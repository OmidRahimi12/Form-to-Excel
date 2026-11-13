# Development Progress

## Current phase

Phase 11 — PWA and offline application support implemented. Phases 01–10.1 are implemented; Archive was intentionally excluded after its APK workflow could not be established. Phase 11 verification is recorded below; Phase 12 has not started.

## Completed work

- Initialized a React 19, TypeScript, and Vite application with strict TypeScript settings.
- Added Tailwind CSS 4 through its Vite plugin and a small responsive RTL/LTR-compatible foundation stylesheet.
- Initially added React Router routes for Dashboard, Forms, Files, Merged Files, Archive, Communication, Document Information, Notes, Spreadsheet, and Settings inside a shared application layout. The Archive route was later removed by the Phase 09 scope decision below.
- Added i18next resources for Persian, Pashto, and English. Persian is the initial language; language changes update the document language and direction.
- Added reusable UI components: Button, Input, Select, Card, Modal, and Table.
- Added shared SearchBar, EmptyState, Loading, and ConfirmationDialog components.
- Organized application layout, dashboard, localization, styles, and component categories into separate directories.
- Copied the complete supplied specification to `docs/PROJECT_SPEC.md`.
- Completed the Phase 01 audit on 2026-11-08. `npm install` completed successfully; npm reported 0 vulnerabilities at that audit.
- Moved Vite, the React Vite plugin, and Tailwind build integration into `devDependencies`; kept the declared package ranges unchanged.
- Added localized labels for shared close, navigation-close, and cancel controls. The sidebar app name now follows the selected locale.
- Confirmed TypeScript and production bundling with `npm run build` (Vite 7.3.7; 1,635 modules transformed).
- Started the Vite dev server successfully at `http://127.0.0.1:5173/`. The root and all nine requested module paths returned HTTP 200 with the SPA shell.
- Runtime-checked the actual i18next module: Persian loads by default, Pashto and English translations resolve, and document `lang`/`dir` update to `ps`/RTL and `en`/LTR.
- Validated package and locale JSON files and inspected installed top-level dependency versions with `npm ls --depth=0`.

## Phase 02 — Design system and UI foundation

### Components created or improved

- Added `PageHeader` and reused it in dashboard and shared module placeholder pages.
- Added typed `Textarea`, `Checkbox`, `Radio`, `Badge`, `Tabs`, and `Switch` components. Tabs support arrow, Home, and End keyboard navigation.
- Added `FormField` to associate visible labels, hints, required state, and validation errors with a control.
- Improved Modal with a labelled dialog, initial focus, Escape handling, backdrop dismissal, and Tab focus containment.
- Added a shared ThemeToggle; Button now supports the danger variant.
- Kept components independently exported from the shared UI and shared component indexes.

### Design tokens and assets

- Centralized brand, semantic state, surface, text, border, typography, spacing, radius, shadow, motion, and layout-width tokens in `src/styles/tokens.css`.
- Preserved the green already used by the Phase 01 foundation (`#16834a`) and its associated shades; Tailwind CSS 4 theme variables expose the semantic palette.
- Searched the workspace for Dana/Bahij Koodak fonts, SVGs, images, APK extracts, and design resources. None were present. At the end of Phase 02, the font stack used generic system fallbacks; Phase 03 Vazirmatn integration below supersedes that choice.
- The APK, supplied screenshots, and screen recording were not available in the workspace, so exact original-app matching could not be established from reference material.

### Layout, themes, and responsive behavior

- Refined shared layout styling with logical RTL/LTR spacing and colors sourced from tokens.
- Reused one navigation definition for the full sidebar and compact five-item mobile bottom bar; the full navigation remains available from the mobile menu.
- Added responsive breakpoints at 960px, 700px, and 400px to stack dashboard cards, switch to mobile navigation, and reduce header spacing on narrow screens.
- Implemented light and dark semantic token sets, a header theme toggle, and localStorage persistence (`form-to-excel-theme`). The master project specification calls for both themes; whether the original APK itself supported dark mode could not be inspected.
- Added visible keyboard focus, reduced-motion support, disabled-control states, and improved dialog keyboard behavior.

### Phase 02 verification

- Final completion audit rerun on 2026-11-08. Removed duplicated theme-color literals: the browser theme-color meta tag now reads the active CSS token; the initial HTML value matches the light brand token.
- `npm run build` passed (TypeScript and Vite production build; 1,645 modules transformed).
- `npm run dev -- --host 127.0.0.1` started successfully at `http://127.0.0.1:5173/`.
- The root and nine module URLs returned HTTP 200 with the Vite SPA shell; the token stylesheet also served successfully.
- Browser screenshots and interactive desktop/tablet/mobile visual inspection were not performed. The previous computer-use inspection was stopped because the helper could not determine Chrome's current URL confidently. Do not treat HTTP shell checks as visual verification.

## Phase 03 — Vazirmatn font integration

- Installed `@fontsource/vazirmatn` 5.3.0 as a runtime dependency and removed the earlier variable Fontsource package. `src/main.tsx` imports the Arabic subset styles for weights 400, 500, 600, and 700. Vite bundles local WOFF2 (and WOFF fallback) assets; no CDN is used.
- Shared design tokens map regular/medium/semibold/bold to 400/500/600/700. The Arabic font stack names the bundled `Vazirmatn` family first; English selects the separate `Segoe UI`, Arial, sans-serif stack through `:root[lang="en"]`.
- Centralized `--font-family-arabic`, `--font-family-latin`, and active `--font-family` in `src/styles/tokens.css`. Persian and Pashto use Vazirmatn; `lang="en"` selects Segoe UI/Arial. Body and controls inherit the shared token, covering headings, buttons, inputs, cards, tables, navigation, and dashboard content without component-level font declarations.
- Copied the package's SIL Open Font License into `public/fonts/OFL-Vazirmatn.txt` so the license is present in static output.
- Final build on 2026-11-08 passed (TypeScript plus Vite; 1,653 modules transformed) and emitted local Vazirmatn Arabic WOFF2 files for all four imported weights under `dist/assets`.
- `npm ls @fontsource/vazirmatn --depth=0` confirmed version 5.3.0. Development-server HTTP check for the package Arabic CSS returned 200 and included a local WOFF2 URL. This confirms package resolution and local asset wiring; the browser's computed font and glyph shaping were not visually inspected.
- A final `npm audit --json` found 1 high-severity issue in the pre-existing `xlsx@0.18.5` dependency (SheetJS prototype pollution and ReDoS advisories); Fontsource was not identified in the report. `npm audit` says no automatic fix is available for the current dependency. This font task did not change the Excel dependency.
- Desktop and mobile Persian/Pashto visual rendering could not be inspected: browser UI access is unavailable. HTTP and bundle checks are not a substitute for visual confirmation.

## Phase 03 — Dashboard / Home module

- Refactored the existing Dashboard page into a focused composition of `DashboardWelcome`, `DashboardFeatureGrid`, and `DashboardFeatureCard` components under `src/features/dashboard/components/`.
- Added one shared navigation/route definition in `src/app/navigation.ts`; the sidebar, dashboard feature cards, and React Router paths consume the same paths and icon definitions.
- Initially added dashboard links to Forms, Files, Spreadsheet, Merged Files, Archive, and Notes. The Archive shortcut was later removed by the Phase 09 scope decision below.
- Added Persian, Pashto, and English labels/descriptions for the feature cards. The RTL/LTR-aware arrow follows i18next's current direction. Vazirmatn remains inherited from the existing Arabic font token; English uses the Latin token.
- Kept the existing green welcome panel and card language. The feature grid uses three columns on wide screens, two on tablet/standard mobile, and one below 400px.
- Omitted statistics and recent activity because the project has no Dexie schema, local data services, or activity records yet. No hard-coded counts or sample records are displayed. The dashboard has no data request, so no synthetic loading or error state is needed.
- No original APK, screenshot, or recording was available to verify exact content or visual matching.
- Locale-key validation passed for all six dashboard descriptions in Persian, Pashto, and English.
- Final `npm run build` passed on 2026-11-08 (TypeScript and Vite production build; 1,653 modules transformed).
- `npm run dev -- --host 127.0.0.1` started successfully on 2026-11-08. The root and all nine app route URLs, including the six dashboard-card destinations, returned HTTP 200 from the Vite SPA server. The Fontsource Arabic CSS also returned 200 and referenced its local WOFF2 file.
- Inspected the route registry and React Router bindings: the six dashboard card destinations map to existing placeholder route elements and share path keys with the navigation registry. The HTTP checks do not simulate card clicks or confirm rendered page contents.
- Dashboard page styles do not set a nested vertical scrolling region. The only vertical overflow regions found are the fixed sidebar (for a menu taller than the viewport) and modal (for oversized dialog content); both are intentional. The document handles dashboard page scrolling. Browser visual inspection was unavailable, so duplicate scrollbars at actual viewport sizes were not visually checked.
- No browser screenshots or interactive desktop/tablet/mobile checks were performed. HTTP responses and successful bundling do not establish rendered card layout, visual font selection, or responsive appearance.

## Phase 04 — Forms module

### Reference and supported fields

- Inspected `src/reference/form-to-excel.apk`. Its bundled workbook (`assets/flutter_assets/assets/files/97e-11f1-ab27-f742e6b5c5ad.xlsx`) contains the 13 column labels used to establish the form fields and ordering: letter/document number and date, incoming number and date, outgoing number and issue date, sender, recipient, file number, page number in file, delivered to, subject, and notes. The APK's compiled code also contains matching model/search fields such as `incomingNumber`, `outgoingNumber`, `documentNumber`, `fileNumber`, `sender`, `recipient`, `deliveredTo`, `subject`, and `notes`.
- No individual fields are marked required: validation follows the APK's `Empty forms cannot be saved` behavior and requires at least one non-blank value. Number-like identifiers remain text so valid formats are not rejected. The three date values use native date controls.
- No other original screen screenshots or recording were present. Form field labels and order are grounded in the supplied APK workbook; exact screen-by-screen visual matching was not possible.

### Architecture and data

- Added `src/features/forms/` with typed models, form field metadata, separate validation and service modules, Dexie query hooks, focused list/editor/card/details components, and list/create/details/edit pages.
- Reused the app's shared PageHeader, FormField, Input, Textarea, Button, Card, SearchBar, Loading, EmptyState, and ConfirmationDialog; the existing `/forms` route now renders the feature and adds routes for `/forms/new`, `/forms/:id`, and `/forms/:id/edit`.
- Added the first browser database schema in `src/database/appDatabase.ts`: Dexie database `form-to-excel`, version 1, with an auto-increment forms table plus created/updated timestamp indexes. No prior web database existed, so no migration from an earlier version was needed. All form reads/writes/deletes are isolated in `formService.ts`; presentation components do not access IndexedDB directly.
- Create, view, edit, and confirmed delete are implemented. Editing preserves `createdAt` and advances `updatedAt`; live Dexie queries refresh list/details views after changes. Search checks every supported field, trims surrounding whitespace, ignores case/diacritics and normalizes common Persian/Arabic letter and digit variants.
- Loading, empty, unmatched-search, not-found, storage failure, validation, and save/delete feedback states are implemented. Creation and editing prevent repeated submissions while saving. No records or statistics are fabricated.
- Added complete Forms labels and messages in Persian, Pashto, and English. Form content inherits the shared Vazirmatn/Latin typography tokens and responsive styles use existing theme tokens.
- The dashboard currently contains no form statistic, so no dashboard database coupling was added.

### Verification and remaining checks

- `npm run build` passed on 2026-11-08: TypeScript and Vite production build; 1,672 modules transformed. Vite emitted a chunk-size advisory because the main JS chunk is 505.98 kB minified; build completed successfully.
- `npm run dev -- --host 127.0.0.1` started successfully. Requests to `/forms`, `/forms/new`, `/forms/1`, and `/forms/1/edit` returned HTTP 200 from the SPA server. This verifies server fallback responses, not rendered route content.
- Parsed all three locale JSON resources and checked the required Forms translation keys; all passed. Confirmed the APK sample workbook headers align with the model field order.
- Fetched the router, editor, and query hook through Vite's dev transform endpoint; each returned HTTP 200 with no import/transform error. A temporary Vite TypeScript-loader smoke check passed for empty-form rejection, accepting one populated field, trimming whitespace and normalizing Persian digits for search, and returning no match for unrelated text. The temporary check file was removed.
- The full interactive IndexedDB CRUD/reload workflow was not run. The configured environment exposes no test script/framework, and browser automation was unavailable. Do not treat route shell responses or pure validation/search checks as verification of persistence or button interactions.
- No test framework is configured in `package.json`. Browser automation could not be run because CUA reports that the browser access host is unavailable. Consequently, the full interactive create/list/details/edit/search/delete/reload workflow, IndexedDB persistence in a real browser, RTL/LTR rendering, responsive layout, and validation interactions remain unverified by browser execution.

#### Final Phase 04 browser verification attempt (2026-11-08)

- Started the development server at `http://127.0.0.1:5173/` for the requested browser run. The computer-use inventory returned no apps or browsers and reported `Browsers: Error: The browser access host is unavailable`. No browser interaction was possible, so none of the requested UI workflows or viewport behaviors are marked as browser-tested.
- Manual browser procedure when access is available:
  1. Open `http://127.0.0.1:5173/forms`. Confirm the empty state appears. Choose **Create form**, then try saving all 13 fields blank; the form should stay open and show the translated empty-form validation message.
  2. Create a harmless sample with Document number `۱۴۰۵-۱۲۳`, Document date `2026-11-08`, Incoming number `۴۵۶`, Incoming date `2026-11-08`, Outgoing number `۷۸۹`, Issue date `2026-11-08`, Sender `اداره نمونه`, Recipient `بخش آزمایشی`, File number `دوسیه ۱۲`, Page number in file `۳`, Delivered to `واحد نمونه`, Subject `آزمایش فرم`, and Notes `رکورد آزمایشی برای بررسی`. Save it. Confirm its details view shows the entered values and the Forms list contains it.
  3. Choose **Edit**, change the subject to `آزمایش ویرایش‌شده`, save, and verify the changed value. Refresh the details page, then return to `/forms`; confirm the edit and record remain. Check the created timestamp remains unchanged while the modification timestamp advances.
  4. Search the list for `آزمایش` and confirm the form appears; clear the search. Search for `۱۴۰۵` and confirm the document number is found. Search for unrelated text and confirm the no-match state appears; clear the search.
  5. Choose **Delete**, cancel once and confirm the record remains. Open the delete confirmation again and confirm deletion. Verify the list becomes empty, then refresh `/forms` and verify the record is still absent.
  6. Switch the language selector to Persian and English; verify Persian shows RTL layout and English shows LTR. At a mobile viewport (for example 390×844), open `/forms/new` and verify all fields fit without horizontal overflow and the editor is single-column. Repeat the language direction check in the narrow viewport.
- The app should be run locally for this procedure; the listed values are disposable test data. Record each observed result separately before marking the corresponding browser check complete. The present run did not perform these steps.

### SheetJS security finding

- An online `npm audit --json` for the existing `xlsx@0.18.5` reported one high-severity package with two advisories: prototype pollution GHSA-4r6h-8v6p-xvw6 / CVE-2023-30533 (affected `<0.19.3`) and ReDoS GHSA-5pgg-2g8v-p4x9 / CVE-2024-22363 (affected `<0.20.2`). The advisory database reports no patched version available through npm; vendor builds are distributed separately. See [Prototype Pollution advisory](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6) and [ReDoS advisory](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9).
- Left the existing dependency unchanged in this Forms phase: it is not imported anywhere in `src/`, and no Excel parsing is implemented here. Before a later spreadsheet/import phase, replace it with a maintained and patched solution (or a vetted vendor build compatible with local/offline bundling), verify workbook import/export compatibility with project fixtures, and rerun the audit. Do not parse untrusted workbooks with the current version.
- The earlier offline-only npm audit reported zero findings from cached metadata; that result was superseded by the online audit above.

## Phase 05 — Files module

### Original workflow and scope

- Inspected the supplied APK's compiled assets and Dart symbol strings. The original app has a `FilesPage`, `file_card.dart`, `ExportFileModel`/`ExportFileDatabase`, an open-file service, a file-sharing service, and delete operations. Its file workflow manages locally exported Excel files separately from the distinct merged-files feature.
- `docs/ORIGINAL_FORMS_REFERENCE.md` was not present. The APK contained no additional screen captures. The model did not expose a form-record relation, so file entries are kept independent of Forms and do not copy form values.
- The APK contains Excel and CSV export-related code (`.xlsx`, `.csv`, and `text/csv` strings); following the approved clarification, the file service accepts generated `.xlsx` and `.csv` artifacts with canonical MIME types. No upload, file categories, merged-file workflow, or Excel/CSV generation was added. The Files list remains empty until a future local export workflow calls `saveExportedFile`.
- Neither format is parsed or rendered in-app. XLSX receives a small ZIP signature check; CSV is validated by extension, MIME type, size, and metadata without parsing. The Open action hands the local Blob URL to the browser's file handler; browser behavior varies, so Download remains available. This avoids parsing workbooks with the existing `xlsx@0.18.5` dependency while its high-severity advisories remain open.

### Architecture and persistence

- Added `src/features/files/` types, file service, live-query hooks, filename/size utilities, action hook, file card/list/details/actions components, and list/details pages.
- Reused the shared PageHeader, Card, Button, SearchBar, Loading, EmptyState, and ConfirmationDialog. `/files` now renders the Files list and `/files/:id` renders file metadata and actions.
- Extended the existing `form-to-excel` Dexie database from schema version 1 to version 2. Existing Forms table indexes/schema remain unchanged. Version 2 adds a `files` metadata table and a separate `fileContents` table keyed by file ID. The separate Blob store keeps large content out of list/search queries; save/delete update both stores atomically.
- File metadata includes ID, filename, canonical MIME type (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` or `text/csv`), byte size, creation/export timestamp, and optional opaque `contentHash` metadata. The service accepts generated `.xlsx` and `.csv` Blobs, rejects unsafe/path-like names, empty or mismatched MIME/extension data, invalid timestamps, and non-ZIP XLSX headers. Opening/downloading rechecks content presence, size, MIME, and the XLSX ZIP signature; clear missing/corrupt states are shown. Optional `contentHash` is preserved if supplied by a future export workflow; no hash algorithm is assumed or generated here.
- Search is case-insensitive on filename and ignores surrounding query whitespace. Delete requires shared confirmation. Open, Download, and user-initiated Web Share actions are available on details; unsupported sharing tells the user to use Download. Temporary Blob URLs are revoked on a timer.
- Persian, Pashto, and English translations were added for all Files UI and feedback. Existing Vazirmatn/Latin typography tokens, theme colors, and responsive breakpoints are reused. No Forms behavior or data model was changed; the Dexie live-query hook was extracted to a common hook and reused by both modules.

### Verification and remaining checks

- Final `npm run build` passed on 2026-11-08 (TypeScript plus Vite; 1,686 modules transformed). Vite emitted a chunk-size advisory for the 524.45 kB minified main JavaScript chunk; the build completed successfully.
- `npm run dev -- --host 127.0.0.1` started successfully. `/files` and `/files/1` and the router, file card/details components, and file service transform endpoints returned HTTP 200 without import/transform errors.
- Parsed all three locale files and checked Files translation key coverage successfully. A temporary Vite-loaded smoke check passed for CSV with a UTF-8 MIME parameter, canonical CSV MIME storage, optional content-hash/timestamp preservation, XLSX ZIP signature validation, search across both types, mismatched extension/MIME rejection, unsupported type rejection, and invalid XLSX signature rejection. The temporary check file was removed.
- No automated test framework is configured. Browser automation returned no browser inventory and `Browsers: Error: The browser access host is unavailable`. Thus list interactions with real entries, IndexedDB v1→v2 upgrade and persistence, open/download/share, deletion, missing/corrupt data UI, and desktop/mobile RTL/LTR rendering were not browser-tested.
- The project currently has no export UI that calls `saveExportedFile`; there is no upload control by design. The Files workflow requires a future local export producer to register generated XLSX/CSV files. In-app spreadsheet preview and checksum-based detection of internal file corruption are not implemented; validation checks metadata and, for XLSX, the ZIP signature only.

## Phase 06 — Merged Files module

### Implemented workflow and architecture

- Extended the existing Files list with an opt-in selection mode. Cards reuse the existing FileCard and show an accessible checkbox; only local `.xlsx` entries with the XLSX MIME type can be selected. The toolbar shows the selection count, prevents creating a new output with fewer than two files, and provides a cancel action. Existing search, details, open/download/share, and delete behavior remains available.
- Added a create workflow with a validated output name and automatic `.xlsx` extension. Added an append workflow that takes one selected Files workbook and a chosen existing merged workbook. The append path parses and validates both inputs and generates the replacement completely before an atomic Dexie transaction updates the merged Blob and size; the selected Files record is never modified.
- Added `src/features/merged-files/` types, focused workbook merge and workflow services, a Dexie repository, selection/workflow hooks, selection/create/append dialogs, merged file actions/card/list components, and the `/merged-files` page. The page shows a count, filename, XLSX type, size, saved date, open/download/share actions, confirmation-based deletion, and loading/empty/error states.
- Reused shared PageHeader, Card, Button, Checkbox, Input, Select, Modal, FormField, ConfirmationDialog, Loading, and EmptyState components. No upload, categories, search, preview, or Forms relationship was added.

### Workbook merge rules and persistence

- Uses the already installed `xlsx@0.18.5` library, loaded only when a merge starts. No dependency was installed or version changed.
- Requires each selected workbook to have readable, non-empty worksheets, a non-empty first row of column headers, and at least one data row. Workbooks must have the same worksheet names in the same order and matching first-row headers (normalized with Unicode NFKC and trimmed whitespace). A mismatch rejects the operation before storage changes.
- For each worksheet, the first workbook supplies the output header row. Data rows from each workbook are appended in selection order; subsequent header rows are omitted and blank rows are skipped. The same rule applies when appending one workbook to an existing merged workbook. The implementation rebuilds data-only workbooks, so it does not preserve formatting, formulas, charts, macros, merged cells, or other advanced workbook features.
- Added Dexie schema version 3 with `mergedFiles` metadata (`id`, filename, XLSX MIME type, size, creation timestamp) and a separate `mergedFileContents` Blob table keyed by merged file ID. This is a migration that only adds stores; Forms and Files schema/indexes and existing records are untouched. Save, replace, and delete operations use transactions for metadata/content consistency.
- Existing project UI and services continue to keep merged records separate from Forms and regular Files. Outputs stay local in IndexedDB.
- All new messages are translated in Persian, Pashto, and English. Existing document direction, Vazirmatn/Latin font tokens, themes, and responsive styles are reused.

### Verification and limitations

- `npm run typecheck` passed on 2026-11-09.
- A temporary Node service-level verification passed for valid multi-sheet merging, selection-order row appending, header de-duplication, XLSX output MIME, minimum source count, mismatched headers and sheet names, invalid and empty workbook rejection, CSV selection exclusion, and merged filename validation. The temporary harness was removed. This did not exercise Dexie or browser persistence.
- All three locale JSON files parsed and contained matching key sets (153 keys each).
- Final `npm run build` passed on 2026-11-09 (Vite 7.3.7; 1,704 modules transformed). SheetJS is emitted as a separate 429.18 kB lazy-loaded chunk. The main JavaScript chunk is 551.44 kB and still triggers Vite's advisory threshold of 500 kB; the build completed successfully.
- `npm run dev -- --host 127.0.0.1` started successfully. `/files`, `/merged-files`, and the transformed Files/Merged Files page and merge-service modules returned HTTP 200. The server was stopped after these checks.
- Browser interaction and visual checks were not completed. The computer-use helper failed to connect (`Computer Use native pipe is unavailable: failed to connect native pipe: The system cannot find the file specified. (os error 2)`), and Node has no IndexedDB global or installed IndexedDB test polyfill. Consequently, actual selection/dialog behavior, IndexedDB v2-to-v3 data preservation and reload persistence, append transaction rollback, download/open/share/delete interactions, and Persian/Pashto/English viewport rendering remain unverified in a browser.
- There is still no export UI that creates regular Files entries, so the application has no in-UI way to supply source workbooks for manual end-to-end merging yet. Files also has no upload control by design. Browser workflow verification requires XLSX entries to be created by a future local export producer.
- The existing `xlsx@0.18.5` dependency has high-severity advisories recorded in the Phase 03 notes. This phase did not alter the dependency; merging currently reads only XLSX records already in local storage and adds no upload path. Reassess the parser dependency before supporting arbitrary/imported workbooks.

### Phase 06 — Corrective hardening (2026-11-09)

- Replaced the stale npm-registry SheetJS package with official `xlsx@0.20.3`, installed directly from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` as specified by the official installation guide. The merge service still lazy-loads SheetJS. npm reported 0 vulnerabilities during installation; it also warned that the existing esbuild install script has not been approved by npm's install-script policy.
- Added an optimistic revision value to merged-file metadata. Existing records without a revision are treated as revision 0; new records start at 0. Append replacement now checks the expected revision and atomically writes the replacement Blob and incremented revision in one Dexie read/write transaction. A stale append receives a localized conflict message in Persian, Pashto, and English. No database version or indexed schema changed.
- `npm run typecheck` passed. `npm run build` passed (1,704 modules transformed); Vite still reports the main 552.13 kB chunk over its 500 kB advisory threshold. The lazy SheetJS chunk is 499.54 kB.
- Temporary in-memory checks against the actual Vite-loaded merge service passed for new workbook creation, row append/header de-duplication, appending to an existing output, mismatched-header rejection, and CSV/invalid-byte rejection. `/`, `/files`, and `/merged-files` returned HTTP 200 from the development server. All three locale JSON files parsed with matching 154-key sets and the new conflict message present.
- A temporary in-memory repository check with a serialized database test double passed: two same-revision replacements produced one success and one conflict, and an invalid replacement preserved the prior Blob/revision. This does not exercise IndexedDB or Dexie's real cross-tab transaction scheduling. No browser automation or IndexedDB test adapter was available; real version 1/2 database preservation and actual browser concurrency remain unverified. No real application database records were used or changed. Manual browser verification remains outstanding.

## Phase 07 — Excel generation and Forms-to-Files export

### Implemented workflow

- Added an export-all action to the Forms page. It exports every saved form in the existing `listForms()` order (most recently updated first) to one local `.xlsx` file named `forms_export.xlsx`; no form selection or filename prompt is added.
- Added `src/features/forms/services/formExportService.ts` to build an XLSX workbook and save it through the existing Files `saveExportedFile()` service. SheetJS remains dynamically imported so the Excel library stays lazy-loaded. No database table or schema migration was needed.
- Added `src/features/forms/hooks/useFormExport.ts` for single-flight/loading state and localized success, empty-database, and failure feedback. `FormsPage` composes the action and status message with existing shared Button and PageHeader components; responsive action wrapping is handled in shared page styling.
- The workbook contains one `Sheet1` worksheet, 13 headers in the established Forms field order, and one row per form. Persian headers are defined once in the export service. Missing values are blank, source form records are not changed, and the worksheet view is marked RTL. The output uses the canonical XLSX MIME type accepted by Files, making it eligible for the existing Merged Files XLSX selection workflow.
- Persian, Pashto, and English translations were added for the action, in-progress label, empty state, success count, and generic export failure. No CSV export, single-form export, selected-form export, import, or Phase 08 functionality was added.

### Verification and limitations

- `npm.cmd run typecheck` passed on 2026-11-09.
- `npm.cmd run build` passed on 2026-11-09 (Vite 7.3.7; 1,706 modules transformed). SheetJS remains in a separate lazy chunk (499.54 kB); the main JavaScript chunk is 556.29 kB and triggers Vite's existing 500 kB size advisory.
- Temporary service-level checks using an in-memory Dexie test double passed: empty export creates no file; single and multiple form exports round-trip through SheetJS; headers and field mapping are preserved; missing cells remain blank; rows follow `listForms()` order; `Sheet1` and RTL view are present; saved output is retrievable from the existing Files service with the expected name and MIME type; and a simulated workbook-generation failure saves no partial file. The Merged Files `isMergeableFile` predicate accepted the exported XLSX metadata and rejected CSV metadata. The temporary harness used no real user database.
- All three locale JSON files parsed and have matching 159-key sets, including the new Phase 07 labels.
- `npm.cmd run dev -- --host 127.0.0.1` started successfully. `/forms`, the transformed Forms page, and the transformed export service returned HTTP 200; the server was stopped after the check.
- Browser UI testing was not completed because browser automation is unavailable in this environment. The rendered button states, browser IndexedDB persistence, opening/downloading the export, and the Merged Files selection UI accepting this specific generated file remain unverified in a real browser. Predicate-level service checks do not simulate those UI interactions.

## Phase 08 — Spreadsheet editor and Excel import

### Implemented workflow and architecture

- Replaced the `/spreadsheet` placeholder with a home page offering New Workbook, Import XLSX, and Import CSV actions. Blank workbooks start with one empty `Sheet1`; imports remain temporary in-memory sessions until explicit Save As.
- Added a focused `src/features/spreadsheet/` feature: home and editor pages; import/editor hooks; a workbook parsing, editing, sheet-management, and writing service; a temporary session handoff; workbook/error types; and cell-address helpers.
- Added files: pages `SpreadsheetHomePage` and `SpreadsheetEditorPage`; components `SpreadsheetHomeActions`, `SpreadsheetToolbar`, `SpreadsheetGrid`, `SpreadsheetCell`, `SpreadsheetCellEditor`, `SpreadsheetSheetBar`, `SaveSpreadsheetDialog`, and `UnsavedChangesDialog`; hooks `useSpreadsheetHome` and `useSpreadsheetEditor`; services `spreadsheetService` and `spreadsheetSessionStore`; plus spreadsheet types and `cellAddress` utility.
- Modified `src/app/navigation.ts` and `src/app/router.tsx`, shared `Input`, Files `FileDetailsPage`, `src/styles/index.css`, and all three locale translation files.
- Added dedicated home actions, toolbar, memoized cell buttons, editable cell-value bar, grid with row/column headers, worksheet tabs, Save As dialog, and unsaved-changes dialog. Reused shared Button, Input, FormField, Modal, ConfirmationDialog, EmptyState, Loading, and PageHeader. The editor grid is deliberately separate from the read-only shared Table.
- Basic editing supports selecting cells, cell value changes through the input bar, Enter to commit, Escape to cancel, automatic commit when another cell is selected, arrow-key cell navigation, scrolling, and display of existing values. Values render as React text; imported workbook content is never inserted as HTML.
- Worksheet create/rename/delete is supported. Names are checked against Excel length/character rules and case-insensitive duplicates; deleting the final sheet is prevented and deletion requires confirmation.
- Save As writes an XLSX Blob via the installed lazy-loaded SheetJS `xlsx@0.20.3` and existing `saveExportedFile()` service. Each save creates a new Files record. Reopening an XLSX from its Files details page loads an editing copy; the stored source Blob is not changed by editing that session.
- Imported workbooks do not create Files records automatically and no spreadsheet Dexie table or schema version was added. Existing Forms, Files, and Merged Files data models were not changed. Added an optional `inputRef` prop to shared Input for spreadsheet editor focus behavior.
- The editor uses React Router `useBlocker` for in-app navigation and a `beforeunload` warning for browser close/refresh when the session is dirty. Save failures leave the editor session and dirty state intact; a save guard prevents repeated submissions.
- Added matching Persian, Pashto, and English labels and errors. Existing RTL/LTR document direction, design tokens, Vazirmatn and Latin font tokens, and theme styles are reused. The data grid keeps spreadsheet column coordinates LTR while surrounding UI follows page direction.

### Import validation and limits

- Supports `.xlsx` and `.csv`; `.xls` is rejected. Files are checked for extension, emptiness, a 10 MiB maximum size, and XLSX ZIP signature before parsing. Parsing errors, too many worksheets, oversized dimensions, and over-limit cell ranges show localized errors. VBA is disabled and no workbook scripts/macros are executed.
- To bound rendered grid size, imports are limited to 20 sheets, 5,000 rows per sheet, 100 columns, and 50,000 rendered cells across the workbook. These are explicit product guardrails; service checks verified the size rejections, but browser memory/performance at the upper bound was not benchmarked.
- SheetJS Community Edition does not calculate formulas and does not guarantee full preservation of complex formatting. The UI states those limits. There is no macro execution, formula recalculation, or promise of full Excel fidelity.

### Verification and limitations

- `npm.cmd run typecheck` passed on 2026-11-09.
- `npm.cmd run build` passed on 2026-11-09 (Vite 7.3.7; 1,722 modules transformed). SheetJS remains a separate lazy chunk at 499.54 kB. The main JavaScript chunk is 588.02 kB and triggers Vite's 500 kB advisory threshold.
- A temporary service-level integration harness passed for blank workbook creation and save; multi-sheet XLSX import and CSV import; import remaining temporary; invalid, unsupported, empty, over-10-MiB, and over-cell-limit inputs; text cell values; cell editing; sheet add/rename/delete and duplicate/invalid name checks; final-sheet protection; Files Save As and reopen; and byte-for-byte preservation of the original saved workbook when editing a reopened copy. The harness used an in-memory database test double and no real application records; no test file was retained.
- All three locale JSON files parse and have matching 205-key sets, including the spreadsheet labels and errors.
- `npm.cmd run dev -- --host 127.0.0.1` started successfully. `/spreadsheet`, `/spreadsheet/editor`, `/spreadsheet/editor/file/1`, `/files/1`, and the transformed Spreadsheet home/editor/service modules returned HTTP 200. These are dev-server transform/fallback checks, not evidence of rendered behavior.
- Actual browser interaction and visual inspection could not be performed. Computer Use returned `Computer Use native pipe is unavailable: failed to connect native pipe: The system cannot find the file specified. (os error 2)`. Browser cell editing, file-picker interaction, real IndexedDB persistence/reopen, Files navigation guard, Save As failure behavior, and RTL/LTR desktop/mobile appearance remain unverified.
- The grid is bounded but not virtualized. Browser performance on large workbooks and lower-powered mobile devices remains unverified. Formula values use available cached display values; formula calculations are not run. Complex formatting may change when writing an edited workbook.

### Phase 08 — Critical cell draft and save safety correction (2026-11-10)

- Replaced the cell editor's private draft state with the editor page's controlled `cellDraft`. Every keystroke now updates the same state used by the dirty indicator, React Router blocker, `beforeunload` handler, cell selection, and Save As.
- Selecting a different cell or worksheet commits the active draft first. Apply/Enter commits through one form-submit path; Escape resets the controlled draft to the current workbook value. Sheet create, rename, and delete actions also commit the active cell before changing sheets.
- Save As commits the active draft before serialization. The editor captures a `structuredClone` workbook snapshot and a synchronous revision value. Serialization uses the snapshot, and the session is marked clean only if the revision still matches after storage completes. Failed saves leave the session dirty and the Save As dialog open.
- While a save is running, the cell input, cell grid, worksheet controls, file-name input, save/cancel controls, and dialog dismissal are disabled. The shared Modal gained an optional `dismissible` prop, defaulting to `true` so other dialogs keep their prior behavior; the Save As dialog sets it false while busy, blocking its close button, Escape, and backdrop dismissal.
- No dependency, database schema, Forms, Files, or Merged Files logic was changed. At the time of this Phase 08 correction, Phase 09 had not started.

#### Correction verification

- `npm.cmd run typecheck` passed on 2026-11-10.
- The first sandboxed `npm.cmd run build` attempt failed because esbuild could not spawn its service (`spawn EPERM`). The same required build was rerun with process permission and passed: Vite 7.3.7, 1,722 modules transformed. The existing main-chunk warning remains (588.13 kB above Vite's 500 kB advisory); SheetJS remains lazy-loaded at 499.54 kB.
- A temporary Vite SSR service check used the actual spreadsheet service to create a workbook, set a cell value, clone the workbook snapshot, write XLSX, reopen it with SheetJS, and confirm the value round-tripped. It passed. No test file or user database data was retained or modified.
- A temporary automated source-contract check passed for the controlled cell draft, dirty/navigation guard wiring, commit-before-selection, Escape reset wiring, commit-before-save, snapshot/revision clean-state logic, busy-state dialog dismissal blocking, and disabled editing controls. These assertions inspect source structure; they are not simulated UI interaction tests.
- The requested click/keyboard scenarios (cell selection, Escape, router cancel/discard, failed save, duplicate submission, and modal close paths) were inspected in source but could not be exercised in a browser. No project UI test framework, DOM emulator, or browser automation package is installed; browser access was not available. Do not treat these as browser-verified.
- The code paths preserve the draft on failed save because commit happens before serialization and only successful completion clears dirty state; duplicate saves are rejected by the existing synchronous save lock. The revision guard retains dirty state if a newer workbook mutation occurs after snapshot capture. These were confirmed by code inspection, not by forcing a real IndexedDB failure or concurrent browser edit.
- Remaining limitation: actual browser confirmation behavior for refresh/tab close, keyboard focus during a busy dialog, and responsive RTL/LTR rendering remains unverified. The build's existing bundle-size advisory is unchanged.

## Phase 09 — Archive intentionally excluded (2026-11-10)

- Reviewed the original APK's Flutter AOT strings and symbols. It confirms an `ArchivePage` class at `screens/input_screens/archive_page.dart`, but the page's purpose, data model, actions, and navigation entry point could not be established.
- By product decision, the web Archive placeholder and all app-facing Archive navigation and localization entries were removed. No Archive feature, data model, service, hook, or Dexie table was added.
- Updated the master specification to remove Archive from required modules, suggested database tables, architecture examples, and foundation route requirements; added the explicit exclusion decision so the scope is clear.
- This is an intentional exclusion, not an unfinished module. The APK investigation remains documented here as rationale. At the time of the Phase 09 review, Phase 10 had not started.

## Component architecture decisions

- Pages compose layout, shared, and feature components; shared pieces have typed props and live in their own files.
- Navigation entries are defined once and reused by the desktop sidebar and mobile navigation.
- The mobile bottom bar reuses that navigation definition in compact mode; the full list remains in the sidebar.
- Shared buttons default to `type="button"` to avoid accidental form submissions when reused.
- Build-only packages are correctly classified as development dependencies.
- Shared navigation and dialog accessibility labels are localized.
- Feature services, hooks, and database areas are reserved for later feature phases; no business logic or persistence was added in this foundation phase.
- Module routes use a small shared placeholder page until their feature work is authorized in a later phase.

## Installed dependencies

Configured in `package.json`: React, React DOM, TypeScript, Vite, Tailwind CSS, React Router, Dexie, SheetJS (`xlsx`), i18next, react-i18next, Lucide React, and `@fontsource/vazirmatn`.

## Remaining tasks

- Compare the responsive Forms UI with original screenshots or a recording if they become available; the APK's embedded workbook established form fields but not exact screen layouts.
- Perform visual viewport and theme persistence checks in a browser when browser inspection is available.
- Visually verify Persian/Pashto Vazirmatn rendering at desktop and mobile sizes when browser preview is available.
- Forms export is implemented in Phase 07, and basic spreadsheet import/view/edit/save is implemented in Phase 08; other import formats remain unsupported.
- Perform rendered viewport checks for font selection, dashboard scrollbars, and responsive layouts when browser access is available.

## Known issues

- Communication, Document Information, and Notes remain intentional placeholders. Settings now hosts Phase 10 backup and restore. Spreadsheet was implemented in Phase 08. Archive was intentionally excluded by the Phase 09 product decision above.
- Original APK is available and its embedded workbook was inspected; original screen screenshots and recording are still unavailable.
- The IndexedDB schema now covers Forms, exported Files, and merged workbooks. Phase 11 adds an asset-only service worker; it does not cache user data or change IndexedDB.
- Browser visual/interactive checks recorded for earlier Forms, Files, Merged Files, and spreadsheet phases remain incomplete. Phase 11's production offline shell was verified separately in isolated headless Chrome as described below; this does not cover those earlier feature workflows or visual viewport QA.
- npm warns that esbuild's install script has not been approved by npm's install-script policy. The production build and Vite development server both worked in the permitted elevated run.

## Phase 10 — Database Backup and Restore

This section records the initial Phase 10 implementation; size limits and verification below were superseded by Phase 10.1.

### Implementation

- Added `src/features/backup/` with a versioned backup type, database backup/validation/restore service, a focused operation hook, Settings page, backup action card, and explicit restore confirmation component. `/settings` now provides the local backup and restore workflow; existing feature routes and navigation are unchanged.
- Uses the existing Dexie database at schema version 3 without changing any schema or migration. The backup snapshot includes Forms, Files metadata and Blobs, and Merged Files metadata and Blobs. It preserves primary IDs, timestamps, supported MIME types, file sizes, optional `contentHash` values, and merged-file revisions. There are no other user-data tables to include.
- The downloaded `.zip` contains `manifest.json`, `data.json`, and separate binary entries for stored file contents. The manifest identifies the application, backup format/version, creation time, database schema version, included tables, and every content reference. The `fflate` 0.8.3 dependency is used to write/read uncompressed entries; binary Blobs are streamed into the ZIP during backup creation.
- Restore checks the 256 MiB archive and expanded-data limits, validates ZIP central-directory structure and CRC values, accepts only uncompressed entries in the supported layout, validates the manifest and all records/IDs, verifies metadata-to-Blob references and sizes, checks XLSX ZIP signatures, and rejects duplicates, unexpected paths, malformed data, and unsupported formats. The selected file's extension and MIME type are not trusted as validation.
- All archive and record validation finishes before opening the write transaction. Restore then clears and repopulates the five existing Dexie tables in one read/write transaction. If the transaction fails, Dexie rolls it back and the localized error says existing data was preserved. The confirmation dialog lists record counts and warns that restore replaces local data. Creating a backup is a separate action; restore does not trigger a backup download automatically.
- Added Persian, Pashto, and English text for all backup controls, warnings, confirmations, success states, and errors. Existing design tokens, RTL/LTR, theme, and Vazirmatn typography are inherited.

### Verification and limits

- Added `fflate` 0.8.3 as an exact dependency and updated the lockfile. Installation succeeded after the sandbox's cache-only attempt failed with `ENOTCACHED`; npm reported 0 vulnerabilities. npm also repeated the existing esbuild install-script approval warning.
- `npm run typecheck` passed.
- A temporary Vite SSR harness built a valid stored ZIP fixture with Files metadata and a CSV Blob; `validateBackupFile` restored its structure and Blob size successfully. It also confirmed malformed archive bytes and modified entry payloads with mismatched CRC are rejected. The temporary harness was removed after verification.
- `npm run build` passed after an initial sandbox `spawn EPERM` retry with elevated execution (Vite 7.3.7; 1,729 modules transformed). The existing main JavaScript chunk remains above Vite's 500 kB advisory threshold (614.80 kB); SheetJS remains lazy-loaded. No database schema change was made.
- No test framework or IndexedDB adapter is configured. No browser automation was available, so real browser download behavior, file picker interaction, translated visual layout, restore confirmation interaction, reload persistence, and rollback against a real IndexedDB database were not browser-tested. The code uses a single Dexie transaction spanning all five tables, but transaction rollback and historical v1/v2 database upgrade preservation still need browser verification.
- Backups and restores are limited to 256 MiB to bound browser memory use. Archives are uncompressed and this initial format accepts only the app's own ZIP entry layout; other ZIP backups are intentionally rejected. Keep downloaded backups outside the browser profile because clearing browser storage can remove the live database.

## Phase 10.1 — Backup and Restore reliability hardening

### Reliability and performance changes

- Reduced and separated size limits: 16 MiB maximum selected ZIP and expanded archive total; 8 MiB maximum per stored binary entry; 2 MiB maximum each for `data.json` and the central directory; 1 MiB maximum for `manifest.json`; and 1,000 total ZIP entries. The limits are checked from the selected file size and ZIP central directory before entry streaming, JSON parsing, or content materialization. Backup creation applies the same expanded, per-entry, metadata, entry-count, and output-archive limits.
- Moved ZIP creation and validation to a dedicated Vite-bundled Web Worker. The worker is created for one operation, handles worker/message errors, and is terminated after completion. Dexie snapshots and restore transactions remain in the application context. No CDN or new runtime library was introduced for workers.
- The worker serializes the table JSON once, writes bounded uncompressed ZIP data with known entry sizes, and avoids building concatenated copies of binary entries. Restore reads stored entries using validated central-directory offsets, retains chunks, checks CRC incrementally with a lookup table, and creates Blobs from those chunks. This also avoids the prior streaming-parser boundary ambiguity when workbook content itself begins with the ZIP `PK` signature.
- The reader remains compatible with Phase 10 version-1 backups created with streaming ZIP data descriptors. A permanent regression test covers old-style ZIPs containing XLSX data.
- Record and metadata validation now rejects unknown data keys and unknown fields for the current backup format. Malformed or unsupported backups are rejected before database writes.

### UI and routing

- Restore errors are shown inside the still-open confirmation dialog. During restoration, confirm/cancel buttons are disabled and the shared Modal is non-dismissible; defaults for other dialogs remain unchanged. The operation lock continues to reject duplicate operations.
- The clipped file input is removed from keyboard tab order and hidden from assistive technology; the visible shared Button is the accessible, focusable file-picker action.
- Settings uses a lazy page import with a translated loading state and an error boundary. Vite emits a separate Settings page chunk and worker asset; SheetJS remains lazy-loaded.
- Added a Node built-in test script and `fake-indexeddb` 6.2.8 as a dev dependency. No test framework was added. `AppDatabase` accepts a database name for disposable tests; the production default name and schema are unchanged.

### Verification

- `npm run test:backup` passed six tests using `fake-indexeddb` and the actual Dexie APIs: create/validate/restore and replacement of existing records; exact record/metadata/Blob byte and MIME comparisons; CRC corruption and unknown-field rejection; injected failure at the final table write with all existing records and Blob bytes preserved; prior streaming-format backup compatibility; and v1, v2, and v3 schema preservation when opened with the current v3 schema. The worker boundary is represented by an inline test shim that invokes the same archive codec; these are not real browser Worker tests.
- The rollback test uses a disposable fake IndexedDB database and injects a rejection during `mergedFileContents.bulkAdd` after earlier table operations. The transaction rejected and all original stores and Blob contents matched their pre-restore values.
- The migration tests create separate disposable v1, v2, and v3 databases and then open each with the current `AppDatabase` class. Forms survived all versions; Files and FileContents survived v2/v3; Merged Files and its Blob survived v3. This is fake IndexedDB testing, not native browser IndexedDB testing.
- `npm run typecheck` passed. Final `npm run build` passed on 2026-11-10 (Vite 7.3.7; 1,728 modules transformed). It emitted the backup worker as a 19.69 kB local asset and a separate lazy Settings page chunk (5.00 kB). The main JavaScript chunk is 596.11 kB and triggers Vite's existing 500 kB advisory; the lazy SheetJS chunk is 499.54 kB. No browser UI test was performed.
- Final `npm run dev -- --host 127.0.0.1` started successfully on 2026-11-10. The root, Settings, Forms, Files, Merged Files, and Spreadsheet URLs returned HTTP 200 from the Vite SPA server. These are route-shell checks, not browser-rendered interaction checks. The server was stopped after verification.
- `PROJECT_SPEC.md` already requires local database backup/restore; no specification change was needed. No database schema migration or Forms/Files/Merged Files/Spreadsheet business logic change was made.

### Remaining limits

- No real browser test covered file picker cancellation, dialog interaction, actual Worker startup, download behavior, UI responsiveness, visual RTL/LTR/theme layout, or browser storage persistence. The worker is emitted as a local same-origin asset; first-use offline availability remains dependent on future PWA/service-worker caching, which is outside Phase 10.1.
- Backup files larger than 16 MiB, expanded data over 16 MiB, any one binary file over 8 MiB, `data.json` or the central directory over 2 MiB, manifests over 1 MiB, and archives with more than 1,000 entries are rejected. Archives must use the supported uncompressed ZIP format.

## Phase 11 — PWA and offline application support (2026-11-10)

### Implementation

- Inspection found no previous manifest, service worker, PWA dependency, or suitable standalone logo asset in the web app. The original APK contains `assets/flutter_assets/assets/icons/excellogo.svg`; adapted icon source SVGs were created from that mark and rendered as regular 192×192 and 512×512 PNGs plus a 512×512 maskable PNG. Original green identity is preserved.
- Added `public/manifest.webmanifest` with Persian/RTL metadata, app names and description, `/` start URL and scope, standalone display, any orientation, existing green theme color, light page background, and three PNG icon declarations. `index.html` links the manifest and icons.
- Added a small custom Vite build plugin in `vite.config.ts` that emits `dist/sw.js` with a content-derived cache version. It precaches the built HTML, JS, CSS, local Vazirmatn fonts, icons, and manifest. Same-origin GET requests use the current shell cache first; app navigations under the configured base fall back to cached `index.html`, so React Router nested routes load offline. It activates only after successful precache, removes older caches with this app's prefix, and claims clients. It does not cache third-party origins, downloads, Blob URLs, or IndexedDB data.
- Registered the worker only in production through a focused PWA provider. Updates wait in the browser until the user selects the localized **Update now** action; **Later** dismisses the notice. A timeout/error leaves the current page loaded. Spreadsheet already warns before an unload with unsaved edits; an update reload therefore remains subject to the browser's existing beforeunload confirmation. The worker never edits or clears IndexedDB.
- Added a localized Settings install card. It detects standalone installation and handles `beforeinstallprompt` where supported, including installation completion. iOS receives Add to Home Screen instructions; unsupported browsers receive a clear message without a fake install action. Added an unobtrusive localized offline banner and an accessible live status.
- No Vite PWA package was retained. The considered `vite-plugin-pwa@1.3.0` supported the project's Vite 7, but its Workbox dependency tree caused six npm audit findings (two low and four moderate). They were in build-only glob/minimatch/deepmerge paths and not reachable through deployed app features, but were genuine findings and had no published deepmerge fix at the time of review. The temporary package was removed instead of downgrading, forcing, or suppressing advisories. A narrowly scoped Vite plugin emits the needed service worker without adding runtime or build dependencies. Final `npm audit --json` reports zero findings.
- `package.json` retains its existing dependencies; no database schema, form/file storage, backup format, or restore logic changed. The service worker only caches immutable build assets and HTML.

### Verification and limitations

- The PNG icon files were rendered with headless Chrome and inspected for exact 192×192 and 512×512 dimensions. Manifest JSON and referenced files were checked during build output inspection.
- `npm run typecheck` passed. `npm run test:backup` passed all six existing backup, rollback, ZIP-compatibility, and schema-upgrade tests. `npm run build` passed on Vite 7.3.7 (1,731 modules transformed); it emitted `sw.js` (2.12 kB), the manifest, and the three icons. The main JS chunk is 603.99 kB and keeps the existing Vite warning over its 500 kB advisory; the lazy SheetJS chunk is 499.54 kB. `npm audit --json` reported zero vulnerabilities after the temporary PWA plugin was removed.
- In an isolated headless Chrome profile against the production preview, the service worker installed and controlled the app. With CDP network emulation set offline, direct navigations to `/`, `/forms`, `/files`, `/merged-files`, `/spreadsheet`, and `/settings` rendered their route headings/content. A separate isolated browser check confirmed IndexedDB write/read while offline. This tested the actual production service worker and app shell, but did not exercise the full Forms UI CRUD workflow offline.
- The production preview returned HTTP 200 for all six required routes, the manifest, service worker, and each icon. The generated worker precache list includes the lazy Settings chunk, backup worker, SheetJS chunk, local fonts, manifest, and icons. No browser interaction test covered install-prompt acceptance/dismissal, update activation/postponement, or iOS Add to Home Screen. Secure-context hosting (HTTPS, or localhost for development) is required for service worker installation.
- Browser installation prompts are platform-specific. Some browsers expose no prompt event; iOS requires the documented manual flow. Browser storage may still be cleared or evicted; users should retain exported backups. Cached app assets are not user-data backups.
