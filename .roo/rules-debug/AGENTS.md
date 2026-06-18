# Project Debug Rules (Non-Obvious Only)

- **Isolation**: Debug logic in `lib/` independently of the Next.js route handlers to isolate framework-level issues from logic errors.
- **Doc Failures**: If the documentation UI is outdated, check if `scripts/generate-docs.js` is failing or if JSDoc tags in `lib/controllers/` are missing.
- **Silent Failures**: Check `cloudscraper` logs; Cloudflare challenges may cause silent failures or 403s that aren't captured by standard `axios` error handlers.
