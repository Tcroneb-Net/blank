# Project Architecture Rules (Non-Obvious Only)

- **Decoupling**: The Controller layer exists specifically to decouple Next.js Route Handlers from the core logic and the documentation generator.
- **Metadata-Driven**: The system is designed so that adding an endpoint requires updating three distinct locations to ensure the documentation stays in sync with the implementation.
- **Statelessness**: API handlers are intended to be stateless, relying on PostgreSQL via `lib/db.js` for persistence.
