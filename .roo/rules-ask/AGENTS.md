# Project Documentation Rules (Non-Obvious Only)

- **Source of Truth**: The codebase is the documentation. Do not look for a `docs/` folder for API specs; refer to `lib/controllers/`.
- **Output**: The generated documentation is stored in `public/docs.json` after a build.
- **Organization**: `lib/` contains the "how", `lib/controllers/` contains the "what" (API spec).
