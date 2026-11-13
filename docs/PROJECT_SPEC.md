# FORM TO EXCEL — MASTER PROJECT SPECIFICATION
## Component-Based Architecture Edition

**Project:** Form to Excel — Web Application  
**Reference:** Original Flutter APK and screen recording  
**Environment:** VS Code + Codex

## 1. Project vision

Recreate the existing Form to Excel mobile application as a complete, responsive web application.

Preserve the original application's:
- Visual identity and green branding.
- Persian RTL interface.
- Typography and fonts.
- Buttons, cards, forms and navigation.
- Features and business logic.

The original application is the primary reference. This is a recreation project, not a redesign.

**Scope decision:** The original APK contains an Archive page, but its purpose and workflow could not be established. Archive is intentionally excluded from this web project; do not add an Archive route, feature, or data model without new approved requirements.

## 2. Mandatory architectural principle: Component-Based Development

**THIS IS A NON-NEGOTIABLE REQUIREMENT.**

The entire application must be developed using a modular, component-based React architecture.

Every page, feature and interface must be constructed from reusable, independent React components.

### Component development rules

1. Every component must have a clear, single responsibility.
2. Reusable UI elements must be created once and reused throughout the application.
3. Never duplicate the same UI implementation across different pages.
4. Avoid excessively large components.
5. Separate presentation components from business logic.
6. Use shared components for buttons, inputs, cards, dialogs, tables, navigation and other repeated elements.
7. Use feature-specific components when functionality belongs to a particular module.
8. Keep components independent and maintainable.
9. Use props and appropriate composition patterns to make components reusable.
10. Avoid unnecessary component nesting and overengineering.
11. Extract reusable hooks for shared stateful logic.
12. Keep database operations and business logic outside presentation components.

### Component organization

Use three primary component categories:

**A. Shared components**

Components reused throughout the application.

Examples:
- Button
- Input
- Select
- Modal
- Dialog
- Card
- Table
- SearchBar
- Loading
- EmptyState
- ConfirmationDialog

**B. Layout components**

Examples:
- AppLayout
- Sidebar
- Header
- BottomNavigation
- PageContainer
- NavigationMenu

**C. Feature components**

Examples:
- FormCard
- FormBuilder
- FormField
- ExcelFileCard
- MergeFileDialog
- NoteEditor
- SpreadsheetTable

Do not place every component in one directory. Organize them by shared purpose and feature.

## 3. Technology stack

Use:

| Technology | Purpose |
|---|---|
| React | Frontend |
| TypeScript | Type safety |
| Vite | Build tooling |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Dexie.js | IndexedDB management |
| IndexedDB | Local database |
| SheetJS | Excel processing |
| i18next | Localization |
| Lucide React | Icons |
| PWA | Offline functionality |

Use compatible and stable versions.

## 4. Design requirements

- Preserve original green branding.
- Reuse original fonts and assets where possible.
- Support Persian, Pashto and English.
- Persian should be the default language.
- Support RTL and LTR.
- Support light and dark themes.
- Reproduce original mobile layouts.
- Adapt the design for desktop and tablets without changing its identity.
- Avoid unnecessary decorative elements.

## 5. Application modules

Recreate these modules:

1. Dashboard
2. Forms
3. Form Builder
4. Files
5. Merged Files
6. Communication
7. Document Information
8. Notes
9. Spreadsheet
10. Settings

Inspect the original application to establish exact functionality.

## 6. Data storage

No accounts, authentication or online database are required.

Use Dexie.js with IndexedDB.

Suggested tables:
- forms
- records
- files
- mergedFiles
- notes
- settings

Implement:
- Persistent storage.
- Database versioning.
- Data validation.
- Backup and restore.
- Data import and export.
- Safe updates without unnecessary data loss.

Store actual file content using appropriate browser binary storage such as Blob.

## 7. Excel functionality

Implement real client-side functionality:

- Excel generation.
- Excel importing where supported.
- Excel export.
- Excel merging.
- File downloads.
- Original spreadsheet structures and formatting where identifiable.

No dummy buttons or fake functionality.

## 8. Offline and PWA

Implement:
- Installable PWA.
- Service worker.
- Application manifest.
- Offline application shell.
- Offline form management.
- Local database access.

The Phase 11 implementation precaches only versioned, same-origin application assets and uses the cached SPA shell as the offline route fallback. IndexedDB remains the sole store for user records and file contents. Updates are offered through an explicit localized prompt; update activation does not happen automatically.

Handle browser storage limitations and explain backup requirements.

## 9. Code quality

- Strict TypeScript.
- Component-based architecture.
- Reusable components.
- Separation of concerns.
- Feature-based organization.
- Reusable custom hooks.
- Consistent naming.
- Proper error handling.
- No unnecessary dependencies.
- No duplicated UI.
- No giant components.
- No unused code.

## 10. Testing

Test:
- Components.
- Navigation.
- Forms.
- Local database.
- Excel functionality.
- File management.
- Backup and restore.
- Localization.
- RTL/LTR.
- Themes.
- Responsive layouts.
- Offline behavior.

## 11. Deployment

- Frontend: Netlify.
- Repository: GitHub.
- Backend: Not required for the initial local-only version.

## 12. Development workflow

Develop in controlled phases.

For each phase:
1. Inspect existing code.
2. Read this specification.
3. Implement the assigned features.
4. Follow component-based architecture.
5. Test the implementation.
6. Fix errors.
7. Update development documentation.
8. Report completed work.

Wait for approval before starting the next phase.

---

# PROMPT 01 — PROJECT FOUNDATION

## Phase 01: Initialization and Component Architecture

Read `docs/PROJECT_SPEC.md` completely before starting.

Your task is to establish a professional React application foundation with a strictly component-based architecture.

### Task 1 — Inspect workspace

- Inspect the existing workspace.
- Check for an existing React project.
- Inspect package.json and installed dependencies.
- Check Tailwind configuration.
- Preserve existing useful work.

If the workspace is empty, initialize Vite + React + TypeScript.

### Task 2 — Install and configure technologies

Configure:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Dexie.js
- SheetJS
- i18next
- Lucide React

Install compatible versions and avoid unnecessary packages.

### Task 3 — Establish component-based architecture

Create an organized structure similar to:

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
│
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── Card/
│   │   ├── Table/
│   │   └── index.ts
│   │
│   ├── shared/
│   │   ├── SearchBar/
│   │   ├── EmptyState/
│   │   ├── Loading/
│   │   └── ConfirmationDialog/
│   │
│   └── layout/
│       ├── AppLayout/
│       ├── Header/
│       ├── Sidebar/
│       ├── BottomNavigation/
│       └── PageContainer/
│
├── features/
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── forms/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   ├── files/
│   ├── excel/
│   ├── notes/
│   ├── communication/
│   ├── spreadsheet/
│   └── settings/
│
├── database/
├── services/
├── hooks/
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── locales/
│   ├── fa/
│   ├── ps/
│   └── en/
├── types/
├── utils/
├── styles/
└── main.tsx

docs/
├── PROJECT_SPEC.md
└── DEVELOPMENT_PROGRESS.md
```

You may adjust the structure if necessary, but preserve its component-based principles.

### Task 4 — Component architecture rules

This task is especially important.

- Create components as separate files.
- Use clear component names.
- Give each component one primary responsibility.
- Build shared components before duplicating their implementation.
- Use composition and props instead of copying code.
- Separate business logic into services and hooks.
- Keep page components focused on composing smaller components.
- Avoid huge JSX files.
- Avoid unnecessary abstractions.
- Use TypeScript interfaces or types for component props.
- Export reusable components through appropriate index files when useful.

Do not create dozens of meaningless components merely to increase component count. Components must represent useful, independently maintainable UI or logic.

### Task 5 — Routing

Set up React Router with placeholder pages for:

- Dashboard
- Forms
- Files
- Merged Files
- Communication
- Document Information
- Notes
- Spreadsheet
- Settings

Use a shared application layout.

### Task 6 — Localization foundation

Configure i18next for:
- Persian.
- Pashto.
- English.

Implement language switching and automatic RTL/LTR direction handling.

Persian is the initial language.

### Task 7 — Tailwind foundation

Configure Tailwind CSS, responsive breakpoints and basic RTL/LTR compatibility.

Do not invent final visual styles in this phase. Original design tokens will be established in Phase 02.

### Task 8 — Documentation

Create `docs/PROJECT_SPEC.md` containing this complete specification.

Create `docs/DEVELOPMENT_PROGRESS.md` recording:
- Completed work.
- Current phase.
- Component architecture decisions.
- Installed dependencies.
- Remaining tasks.
- Known issues.

### Task 9 — Verification

- Install dependencies.
- Run the development server.
- Run the production build.
- Fix TypeScript errors.
- Fix build errors.
- Test initial routes.
- Test RTL/LTR switching.
- Verify component imports and organization.

### Task 10 — Final report

Report:
1. Project structure.
2. Component architecture.
3. Installed dependencies.
4. Created shared components.
5. Routing implementation.
6. Localization implementation.
7. Build and testing results.
8. Remaining issues.

**IMPORTANT FINAL INSTRUCTION**

This application must remain component-based throughout all future development phases.

Every subsequent feature must follow the same architecture.

Do not implement the entire application in this phase.

Do not start Phase 02 automatically.

Finish Phase 01, report your results and wait for approval.
