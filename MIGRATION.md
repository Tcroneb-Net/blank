# ⚠️ Deprecated Directories

The following directories/pages have been removed as the project is now documentation-focused:

- **`app/page/`** - Old custom pages directory
- **`app/blog/`** - Blog section removed
- **`app/chat/`** - Chat room removed
- **`app/listpage/`** - List page section removed
- **`app/fastupdate/`** - Fast update removed

## Project Restructure

The project has been restructured to focus on API documentation as the main landing page:

### What Changed:

1. **`app/page.jsx`** - Now displays the interactive API documentation (moved from `/docs`)
2. **`app/layout.jsx`** - Updated to English-only metadata
3. **`README.md`** - Converted to English-only with updated project structure information

### New Structure:

- **Home (`/`)** = API Documentation (Interactive Playground)
- **No more separate `/docs` route** - Documentation is now at the root

### Language:

- **English Only** - All UI and metadata now in English
- All Indonesian/Peru references removed
- UI strings updated to English

## Environment Setup

Make sure your `.env.local` is configured:

```env
PURUBOY_PG_URL="postgres://user:password@host:port/database?sslmode=require"
PURUBOY_ADMIN_KEY="your_secret_password"
```

## Running the Project

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the API documentation playground.

---

**Status**: Project restructuring completed as of June 7, 2026
