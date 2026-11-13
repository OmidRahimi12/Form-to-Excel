import { getFileContent } from '../../files/services/fileService';
import { XLSX_MIME_TYPE } from '../../files/types/file';
import { mergeWorkbooks } from './excelMergeService';
import { getMergedFileContent, replaceMergedFileContent, saveMergedFile } from './mergedFileRepository';

export async function createMergedWorkbook(sourceFileIds: number[], fileName: string): Promise<number> {
  if (sourceFileIds.length < 2) throw new Error('tooFewFiles');
  const sources = [];
  for (const id of sourceFileIds) {
    const { metadata, blob } = await getFileContent(id);
    if (metadata.mimeType !== XLSX_MIME_TYPE || !metadata.fileName.toLowerCase().endsWith('.xlsx')) throw new Error('unsupportedSource');
    sources.push({ fileName: metadata.fileName, blob });
  }
  const mergedBlob = await mergeWorkbooks(sources);
  return saveMergedFile(mergedBlob, fileName);
}

export async function appendFileToMergedWorkbook(sourceFileId: number, mergedFileId: number): Promise<void> {
  const [source, target] = await Promise.all([getFileContent(sourceFileId), getMergedFileContent(mergedFileId)]);
  if (source.metadata.mimeType !== XLSX_MIME_TYPE || !source.metadata.fileName.toLowerCase().endsWith('.xlsx')) throw new Error('unsupportedSource');
  const updatedBlob = await mergeWorkbooks([
    { fileName: target.metadata.fileName, blob: target.blob },
    { fileName: source.metadata.fileName, blob: source.blob },
  ]);
  await replaceMergedFileContent(mergedFileId, updatedBlob, target.metadata.revision ?? 0);
}
