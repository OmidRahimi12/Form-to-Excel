import { zipSync } from 'fflate';
import { CSV_MIME_TYPE, XLSX_MIME_TYPE, type StoredFileMetadata } from '../../files/types/file';
import { formFieldKeys, type FormRecord } from '../../forms/types/form';
import { XLSX_MIME_TYPE as MERGED_XLSX_MIME_TYPE, type MergedFileMetadata } from '../../merged-files/types/mergedFile';
import type { NoteRecord } from '../../notes/types/note';
import type { FormTemplate } from '../../forms/types/template';
import {
  BACKUP_FORMAT,
  BACKUP_MAX_ARCHIVE_BYTES,
  BACKUP_MAX_ENTRIES,
  BACKUP_MAX_ENTRY_BYTES,
  BACKUP_MAX_EXPANDED_BYTES,
  BACKUP_MAX_MANIFEST_BYTES,
  BACKUP_MAX_METADATA_BYTES,
  BACKUP_MIME_TYPE,
  BACKUP_VERSION,
  type BackupManifest,
  type BackupSnapshot,
  type ValidatedBackup,
} from '../types/backup';

const LEGACY_TABLES = ['forms', 'files', 'fileContents', 'mergedFiles', 'mergedFileContents'] as const;
const TABLES = [...LEGACY_TABLES, 'notes', 'formTemplates'] as const;
const MANIFEST_PATH = 'manifest.json';
const DATA_PATH = 'data.json';
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

export class BackupError extends Error {
  constructor(readonly translationKey: string, options?: ErrorOptions) {
    const message = translationKey;
    super(message, options);
    this.name = 'BackupError';
  }
}

function safeId(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function validTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function readPrefix(entry: ExtractedEntry, count: number): Uint8Array {
  const result = new Uint8Array(Math.min(count, entry.size));
  let offset = 0;
  for (const part of entry.parts) {
    const length = Math.min(part.byteLength, result.byteLength - offset);
    result.set(part.subarray(0, length), offset);
    offset += length;
    if (offset === result.byteLength) break;
  }
  return result;
}

function jsonBytes(value: unknown): Uint8Array {
  return encoder.encode(JSON.stringify(value));
}

async function makeZip(entries: Array<{ path: string; bytes?: Uint8Array; blob?: Blob }>): Promise<Blob> {
  try {
    const files: Record<string, Uint8Array> = {};
    for (const entry of entries) {
      if (entry.bytes) files[entry.path] = entry.bytes;
      else if (entry.blob) files[entry.path] = new Uint8Array(await entry.blob.arrayBuffer());
      else throw new BackupError('backupErrorCreate');
    }
    const output = zipSync(files, { level: 0 });
    if (output.byteLength > BACKUP_MAX_ARCHIVE_BYTES) throw new BackupError('backupErrorTooLarge');
    return new Blob([output.buffer], { type: BACKUP_MIME_TYPE });
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError('backupErrorCreate', { cause: error });
  }
}

export async function createBackupArchive(snapshot: BackupSnapshot): Promise<Blob> {
  const { data, fileContents, mergedFileContents } = snapshot;
  validateFormRows(data.forms);
  validateMetadata<StoredFileMetadata>(data.files, 'file');
  validateMetadata<MergedFileMetadata>(data.mergedFiles, 'merged');
  validateNotes(data.notes);
  validateTemplates(data.formTemplates);
  if (fileContents.length + mergedFileContents.length + 2 > BACKUP_MAX_ENTRIES) throw new BackupError('backupErrorTooLarge');
  const expectedFileIds = new Map(data.files.map((item) => [item.id, item.size]));
  const expectedMergedIds = new Map(data.mergedFiles.map((item) => [item.id, item.size]));
  const validateLocalContent = (items: typeof fileContents, expected: Map<number | undefined, number>) => {
    const actual = new Set<number>();
    for (const item of items) {
      const size = expected.get(item.fileId);
      if (!safeId(item.fileId) || size === undefined || item.blob.size !== size || actual.has(item.fileId)) throw new BackupError('backupErrorLocalData');
      actual.add(item.fileId);
    }
    if (actual.size !== expected.size) throw new BackupError('backupErrorLocalData');
  };
  validateLocalContent(fileContents, expectedFileIds);
  validateLocalContent(mergedFileContents, expectedMergedIds);
  const dataBytes = jsonBytes(data);
  if (dataBytes.byteLength > BACKUP_MAX_METADATA_BYTES) throw new BackupError('backupErrorTooLarge');
  const descriptors: BackupManifest['contents'] = [];
  const entries: Array<{ path: string; bytes?: Uint8Array; blob?: Blob }> = [];
  let estimatedBytes = dataBytes.byteLength;
  for (const [table, contents] of [['fileContents', fileContents], ['mergedFileContents', mergedFileContents]] as const) {
    for (const item of contents) {
      if (!safeId(item.fileId) || !(item.blob instanceof Blob)) throw new BackupError('backupErrorLocalData');
      const path = `${table}/${item.fileId}.bin`;
      if (item.blob.size > BACKUP_MAX_ENTRY_BYTES) throw new BackupError('backupErrorTooLarge');
      descriptors.push({ table, id: item.fileId, path, size: item.blob.size });
      estimatedBytes += item.blob.size;
      if (estimatedBytes > BACKUP_MAX_EXPANDED_BYTES) throw new BackupError('backupErrorTooLarge');
      entries.push({ path, blob: item.blob });
    }
  }
  const manifest: BackupManifest = {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_VERSION,
    appId: 'form-to-excel',
    createdAt: new Date().toISOString(),
    databaseVersion: 4,
    tables: [...TABLES],
    contents: descriptors,
  };
  const manifestBytes = jsonBytes(manifest);
  if (manifestBytes.byteLength > BACKUP_MAX_MANIFEST_BYTES) throw new BackupError('backupErrorTooLarge');
  estimatedBytes += manifestBytes.byteLength;
  if (estimatedBytes > BACKUP_MAX_EXPANDED_BYTES) throw new BackupError('backupErrorTooLarge');
  entries.unshift({ path: DATA_PATH, bytes: dataBytes }, { path: MANIFEST_PATH, bytes: manifestBytes });
  return makeZip(entries);
}

function parseJson(bytes: Uint8Array): unknown {
  try { return JSON.parse(decoder.decode(bytes)); }
  catch (error) { throw new BackupError('backupErrorInvalid', { cause: error }); }
}

function validateFormRows(value: unknown): FormRecord[] {
  if (!Array.isArray(value)) throw new BackupError('backupErrorInvalid');
  const ids = new Set<number>();
  return value.map((row) => {
    if (!isObject(row) || !hasOnlyKeys(row, ['id', 'createdAt', 'updatedAt', 'templateId', ...formFieldKeys]) || !safeId(row.id) || ids.has(row.id) || !validTime(row.createdAt) || !validTime(row.updatedAt) || (row.templateId !== undefined && !safeId(row.templateId))) throw new BackupError('backupErrorInvalid');
    ids.add(row.id);
    if (!formFieldKeys.every((key) => typeof row[key] === 'string')) throw new BackupError('backupErrorInvalid');
    return row as unknown as FormRecord;
  });
}

function validateNotes(value: unknown): NoteRecord[] {
  if (!Array.isArray(value)) throw new BackupError('backupErrorInvalid');
  const ids = new Set<number>();
  return value.map((row) => {
    if (!isObject(row) || !hasOnlyKeys(row, ['id', 'title', 'body', 'createdAt', 'updatedAt']) || !safeId(row.id) || ids.has(row.id) || typeof row.title !== 'string' || row.title.length > 160 || typeof row.body !== 'string' || row.body.length > 20_000 || !validTime(row.createdAt) || !validTime(row.updatedAt)) throw new BackupError('backupErrorInvalid');
    ids.add(row.id); return row as unknown as NoteRecord;
  });
}

function validateTemplates(value: unknown): FormTemplate[] {
  if (!Array.isArray(value)) throw new BackupError('backupErrorInvalid');
  const ids = new Set<number>();
  return value.map((row) => {
    if (!isObject(row) || !hasOnlyKeys(row, ['id', 'name', 'fields', 'createdAt', 'updatedAt']) || !safeId(row.id) || ids.has(row.id) || typeof row.name !== 'string' || !row.name.trim() || row.name.length > 80 || !validTime(row.createdAt) || !validTime(row.updatedAt) || !Array.isArray(row.fields) || row.fields.length !== formFieldKeys.length) throw new BackupError('backupErrorInvalid');
    ids.add(row.id);
    const fieldIds = new Set<string>();
    for (const field of row.fields) {
      if (!isObject(field) || !hasOnlyKeys(field, ['key', 'visible', 'required']) || typeof field.key !== 'string' || !formFieldKeys.includes(field.key as typeof formFieldKeys[number]) || fieldIds.has(field.key) || typeof field.visible !== 'boolean' || typeof field.required !== 'boolean' || (field.required && !field.visible)) throw new BackupError('backupErrorInvalid');
      fieldIds.add(field.key);
    }
    if (fieldIds.size !== formFieldKeys.length || !row.fields.some((field) => isObject(field) && field.visible === true)) throw new BackupError('backupErrorInvalid');
    return row as unknown as FormTemplate;
  });
}

function validateMetadata<T extends StoredFileMetadata | MergedFileMetadata>(value: unknown, kind: 'file' | 'merged'): T[] {
  if (!Array.isArray(value)) throw new BackupError('backupErrorInvalid');
  const ids = new Set<number>();
  return value.map((row) => {
    const allowedKeys = kind === 'file' ? ['id', 'fileName', 'mimeType', 'size', 'createdAt', 'contentHash'] : ['id', 'fileName', 'mimeType', 'size', 'createdAt', 'revision'];
    if (!isObject(row) || !hasOnlyKeys(row, allowedKeys) || !safeId(row.id) || ids.has(row.id) || typeof row.fileName !== 'string' || !row.fileName.trim() || /[\\/\u0000-\u001f]/.test(row.fileName) || !validTime(row.createdAt) || !Number.isSafeInteger(row.size) || (row.size as number) <= 0) throw new BackupError('backupErrorInvalid');
    ids.add(row.id);
    if (kind === 'file') {
      const okXlsx = row.fileName.toLowerCase().endsWith('.xlsx') && row.mimeType === XLSX_MIME_TYPE;
      const okCsv = row.fileName.toLowerCase().endsWith('.csv') && row.mimeType === CSV_MIME_TYPE;
      if (!okXlsx && !okCsv) throw new BackupError('backupErrorInvalid');
      if (row.contentHash !== undefined && typeof row.contentHash !== 'string') throw new BackupError('backupErrorInvalid');
    } else {
      if (!row.fileName.toLowerCase().endsWith('.xlsx') || row.mimeType !== MERGED_XLSX_MIME_TYPE || (row.revision !== undefined && (!Number.isSafeInteger(row.revision) || (row.revision as number) < 0))) throw new BackupError('backupErrorInvalid');
    }
    return row as unknown as T;
  });
}

interface ZipIndexRecord { crc: number; size: number; dataStart: number; dataEnd: number; }

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let value = i;
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  crcTable[i] = value >>> 0;
}

function updateCrc32(crc: number, bytes: Uint8Array): number {
  let value = crc;
  for (const byte of bytes) value = (value >>> 8) ^ crcTable[(value ^ byte) & 0xff];
  return value;
}

function joinParts(parts: Uint8Array[], size: number): Uint8Array {
  const output = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.byteLength; }
  return output;
}

interface ExtractedEntry { parts: Uint8Array[]; size: number; }

async function readZipIndex(file: File): Promise<Map<string, ZipIndexRecord>> {
  const tailStart = Math.max(0, file.size - 65_557);
  const tail = new Uint8Array(await file.slice(tailStart).arrayBuffer());
  const tailView = new DataView(tail.buffer, tail.byteOffset, tail.byteLength);
  let eocd = -1;
  for (let i = tail.length - 22; i >= 0; i--) if (tailView.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0 || eocd + 22 + tailView.getUint16(eocd + 20, true) !== tail.length) throw new BackupError('backupErrorInvalid');
  const disk = tailView.getUint16(eocd + 4, true);
  const centralDisk = tailView.getUint16(eocd + 6, true);
  const diskEntries = tailView.getUint16(eocd + 8, true);
  const totalEntries = tailView.getUint16(eocd + 10, true);
  const centralSize = tailView.getUint32(eocd + 12, true);
  const centralOffset = tailView.getUint32(eocd + 16, true);
  const absoluteEocd = tailStart + eocd;
  if (totalEntries > BACKUP_MAX_ENTRIES || centralSize > BACKUP_MAX_METADATA_BYTES) throw new BackupError('backupErrorTooLarge');
  if (disk || centralDisk || diskEntries !== totalEntries || totalEntries === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff || centralOffset + centralSize !== absoluteEocd) throw new BackupError('backupErrorInvalid');
  const central = new Uint8Array(await file.slice(centralOffset, absoluteEocd).arrayBuffer());
  const view = new DataView(central.buffer, central.byteOffset, central.byteLength);
  const index = new Map<string, ZipIndexRecord>();
  const ranges: Array<{ start: number; end: number }> = [];
  let expectedExpandedBytes = 0;
  let cursor = 0;
  for (let n = 0; n < totalEntries; n++) {
    if (cursor + 46 > central.length || view.getUint32(cursor, true) !== 0x02014b50) throw new BackupError('backupErrorInvalid');
    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const crc = view.getUint32(cursor + 16, true);
    const compressed = view.getUint32(cursor + 20, true);
    const size = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const startDisk = view.getUint16(cursor + 34, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const end = cursor + 46 + nameLength + extraLength + commentLength;
    if (end > central.length || method !== 0 || (flags & 0x0001) !== 0 || (flags & ~(0x0008 | 0x0800)) !== 0 || startDisk !== 0 || size === 0xffffffff || compressed === 0xffffffff || localOffset === 0xffffffff || size !== compressed || commentLength !== 0) throw new BackupError('backupErrorInvalid');
    const nameBytes = central.subarray(cursor + 46, cursor + 46 + nameLength);
    let name: string;
    try { name = decoder.decode(nameBytes); } catch (error) { throw new BackupError('backupErrorInvalid', { cause: error }); }
    if (!/^(manifest\.json|data\.json|fileContents\/[1-9]\d*\.bin|mergedFileContents\/[1-9]\d*\.bin)$/.test(name) || index.has(name)) throw new BackupError('backupErrorInvalid');
    const entryLimit = name === MANIFEST_PATH ? BACKUP_MAX_MANIFEST_BYTES : name === DATA_PATH ? BACKUP_MAX_METADATA_BYTES : BACKUP_MAX_ENTRY_BYTES;
    if (size > entryLimit) throw new BackupError('backupErrorTooLarge');
    expectedExpandedBytes += size;
    if (expectedExpandedBytes > BACKUP_MAX_EXPANDED_BYTES) throw new BackupError('backupErrorTooLarge');
    const extraStart = cursor + 46 + nameLength;
    for (let p = extraStart; p + 4 <= extraStart + extraLength;) {
      const extraId = view.getUint16(p, true); const extraSize = view.getUint16(p + 2, true);
      if (p + 4 + extraSize > extraStart + extraLength || extraId === 1) throw new BackupError('backupErrorInvalid');
      p += 4 + extraSize;
    }
    if (index.has(name) || localOffset + 30 > centralOffset) throw new BackupError('backupErrorInvalid');
    const local = new Uint8Array(await file.slice(localOffset, localOffset + 30).arrayBuffer());
    const localView = new DataView(local.buffer, local.byteOffset, local.byteLength);
    if (localView.getUint32(0, true) !== 0x04034b50 || localView.getUint16(6, true) !== flags || localView.getUint16(8, true) !== method) throw new BackupError('backupErrorInvalid');
    const localNameLength = localView.getUint16(26, true); const localExtraLength = localView.getUint16(28, true);
    const localNameBytes = new Uint8Array(await file.slice(localOffset + 30, localOffset + 30 + localNameLength).arrayBuffer());
    let localName: string;
    try { localName = decoder.decode(localNameBytes); } catch (error) { throw new BackupError('backupErrorInvalid', { cause: error }); }
    if (localName !== name) throw new BackupError('backupErrorInvalid');
    if (localExtraLength) {
      const localExtra = new Uint8Array(await file.slice(localOffset + 30 + localNameLength, localOffset + 30 + localNameLength + localExtraLength).arrayBuffer());
      const localExtraView = new DataView(localExtra.buffer, localExtra.byteOffset, localExtra.byteLength);
      for (let p = 0; p < localExtra.length;) {
        if (p + 4 > localExtra.length) throw new BackupError('backupErrorInvalid');
        const extraId = localExtraView.getUint16(p, true); const extraSize = localExtraView.getUint16(p + 2, true);
        if (extraId === 1 || p + 4 + extraSize > localExtra.length) throw new BackupError('backupErrorInvalid');
        p += 4 + extraSize;
      }
    }
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressed;
    if (dataEnd > centralOffset || (!(flags & 0x0008) && (localView.getUint32(14, true) !== crc || localView.getUint32(18, true) !== compressed || localView.getUint32(22, true) !== size))) throw new BackupError('backupErrorInvalid');
    let rangeEnd = dataEnd;
    if (flags & 0x0008) {
      if (dataEnd + 12 > centralOffset) throw new BackupError('backupErrorInvalid');
      const descriptor = new Uint8Array(await file.slice(dataEnd, Math.min(dataEnd + 16, centralOffset)).arrayBuffer());
      const descriptorView = new DataView(descriptor.buffer, descriptor.byteOffset, descriptor.byteLength);
      const hasSignature = descriptor.length >= 16 && descriptorView.getUint32(0, true) === 0x08074b50;
      const descriptorOffset = hasSignature ? 4 : 0;
      if (descriptor.length < descriptorOffset + 12 || descriptorView.getUint32(descriptorOffset, true) !== crc || descriptorView.getUint32(descriptorOffset + 4, true) !== compressed || descriptorView.getUint32(descriptorOffset + 8, true) !== size) throw new BackupError('backupErrorInvalid');
      rangeEnd += descriptorOffset + 12;
    }
    ranges.push({ start: localOffset, end: rangeEnd });
    index.set(name, { crc, size, dataStart, dataEnd });
    cursor = end;
  }
  if (cursor !== central.length) throw new BackupError('backupErrorInvalid');
  if (!index.has(MANIFEST_PATH) || !index.has(DATA_PATH)) throw new BackupError('backupErrorInvalid');
  ranges.sort((a, b) => a.start - b.start);
  for (let i = 1; i < ranges.length; i++) if (ranges[i - 1].end > ranges[i].start) throw new BackupError('backupErrorInvalid');
  return index;
}

async function extractZip(file: File): Promise<Map<string, ExtractedEntry>> {
  if (file.size <= 0 || file.size > BACKUP_MAX_ARCHIVE_BYTES) throw new BackupError('backupErrorTooLarge');
  const zipIndex = await readZipIndex(file);
  const extracted = new Map<string, ExtractedEntry>();
  let totalUncompressed = 0;
  for (const [name, indexed] of zipIndex) {
    const entryLimit = name === MANIFEST_PATH ? BACKUP_MAX_MANIFEST_BYTES : name === DATA_PATH ? BACKUP_MAX_METADATA_BYTES : BACKUP_MAX_ENTRY_BYTES;
    if (indexed.size > entryLimit) throw new BackupError('backupErrorTooLarge');
    const parts: Uint8Array[] = [];
    let received = 0;
    let crc = -1;
    const reader = file.slice(indexed.dataStart, indexed.dataEnd).stream().getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > indexed.size || received > entryLimit) throw new BackupError('backupErrorTooLarge');
        totalUncompressed += value.byteLength;
        if (totalUncompressed > BACKUP_MAX_EXPANDED_BYTES) throw new BackupError('backupErrorTooLarge');
        crc = updateCrc32(crc, value);
        parts.push(value);
      }
    } finally { reader.releaseLock(); }
    if (received !== indexed.size || ((crc ^ -1) >>> 0) !== indexed.crc) throw new BackupError('backupErrorInvalid');
    extracted.set(name, { parts, size: received });
  }
  return extracted;
}

export async function validateBackupArchive(file: File): Promise<ValidatedBackup> {
  const entries = await extractZip(file);
  const manifestEntry = entries.get(MANIFEST_PATH);
  const dataEntry = entries.get(DATA_PATH);
  if (!manifestEntry || !dataEntry) throw new BackupError('backupErrorInvalid');
  const manifestBytes = joinParts(manifestEntry.parts, manifestEntry.size);
  const dataBytes = joinParts(dataEntry.parts, dataEntry.size);
  const manifestValue = parseJson(manifestBytes);
  const isLegacy = isObject(manifestValue) && manifestValue.formatVersion === 1;
  const expectedTables = isLegacy ? LEGACY_TABLES : TABLES;
  if (!isObject(manifestValue) || !hasOnlyKeys(manifestValue, ['format', 'formatVersion', 'appId', 'createdAt', 'databaseVersion', 'tables', 'contents']) || manifestValue.format !== BACKUP_FORMAT || ![1, BACKUP_VERSION].includes(manifestValue.formatVersion as number) || manifestValue.appId !== 'form-to-excel' || manifestValue.databaseVersion !== (isLegacy ? 3 : 4) || !Array.isArray(manifestValue.tables) || manifestValue.tables.length !== expectedTables.length || !(manifestValue.tables as unknown[]).every((table, i) => table === expectedTables[i]) || typeof manifestValue.createdAt !== 'string' || !Number.isFinite(Date.parse(manifestValue.createdAt)) || !Array.isArray(manifestValue.contents)) throw new BackupError('backupErrorInvalid');
  const dataValue = parseJson(dataBytes);
  const expectedDataKeys = isLegacy ? ['forms', 'files', 'mergedFiles'] : ['forms', 'files', 'mergedFiles', 'notes', 'formTemplates'];
  if (!isObject(dataValue) || !hasOnlyKeys(dataValue, expectedDataKeys) || expectedDataKeys.some((key) => !(key in dataValue))) throw new BackupError('backupErrorInvalid');
  const forms = validateFormRows(dataValue.forms);
  const files = validateMetadata<StoredFileMetadata>(dataValue.files, 'file');
  const mergedFiles = validateMetadata<MergedFileMetadata>(dataValue.mergedFiles, 'merged');
  const notes = isLegacy ? [] : validateNotes(dataValue.notes);
  const formTemplates = isLegacy ? [] : validateTemplates(dataValue.formTemplates);
  const fileById = new Map(files.map((item) => [item.id!, item]));
  const mergedById = new Map(mergedFiles.map((item) => [item.id!, item]));
  const seen = new Set<string>();
  const fileContents: ValidatedBackup['fileContents'] = [];
  const mergedFileContents: ValidatedBackup['mergedFileContents'] = [];
  for (const descriptor of manifestValue.contents) {
    if (!isObject(descriptor) || !hasOnlyKeys(descriptor, ['table', 'id', 'size', 'path']) || !['fileContents', 'mergedFileContents'].includes(String(descriptor.table)) || !safeId(descriptor.id) || !Number.isSafeInteger(descriptor.size) || (descriptor.size as number) <= 0 || typeof descriptor.path !== 'string') throw new BackupError('backupErrorInvalid');
    const table = descriptor.table as 'fileContents' | 'mergedFileContents';
    const expectedPath = `${table}/${descriptor.id}.bin`;
    const key = `${table}:${descriptor.id}`;
    const metadata = (table === 'fileContents' ? fileById : mergedById).get(descriptor.id);
    const content = entries.get(expectedPath);
    if (descriptor.path !== expectedPath || seen.has(key) || !metadata || !content || content.size !== descriptor.size || content.size !== metadata.size) throw new BackupError('backupErrorInvalid');
    if (metadata.mimeType === XLSX_MIME_TYPE || metadata.mimeType === MERGED_XLSX_MIME_TYPE) {
      const prefix = readPrefix(content, 4);
      if (content.size < 4 || prefix[0] !== 0x50 || prefix[1] !== 0x4b) throw new BackupError('backupErrorInvalid');
    }
    seen.add(key);
    const blob = new Blob(content.parts as unknown as BlobPart[], { type: metadata.mimeType });
    if (table === 'fileContents') fileContents.push({ fileId: descriptor.id, blob });
    else mergedFileContents.push({ fileId: descriptor.id, blob });
  }
  if (fileContents.length !== files.length || mergedFileContents.length !== mergedFiles.length) throw new BackupError('backupErrorInvalid');
  if (entries.size !== 2 + manifestValue.contents.length) throw new BackupError('backupErrorInvalid');
  return { manifest: manifestValue as unknown as BackupManifest, forms, files, fileContents, mergedFiles, mergedFileContents, notes, formTemplates };
}

