# Contract Changes

During the backend integration (Phases 1-6), the following deviations/additions were made to the original mock contract:

1. **Authentication:**
   - Instead of mock `loginDemo`, real Firebase Auth tokens are now required via Bearer Headers.
   - `GET /api/v1/auth/me` returns the Firestore user profile.
   - `POST /api/v1/auth/profile` handles account creation payloads (roles, etc.).

2. **AI Deal Room Real-Time Sync:**
   - The original frontend `DealRoom.jsx` relied heavily on mock `setTimeout` generators for AI and Provider replies.
   - We preserved the mock functions behind the `VITE_USE_MOCK` flag, but introduced Firebase Firestore `onSnapshot` listeners when connected to the live backend.
   - AI Mediation is invoked via `POST /api/v1/negotiations/:id/mediate`, which evaluates the message subcollection.

3. **PayPal Checkout Flow:**
   - Replaced static success timers with `@paypal/react-paypal-js`.
   - `POST /api/v1/orders/checkout` initializes the intent securely capturing the platform fee on the server.
   - `POST /api/v1/orders/:id/capture` finalizes it.

4. **Freelancer (Provider) Redesign & Role Separation:**
   - Single source of truth navigation in `src/config/navigation.js`.
   - Strict `RoleRoute` protection preventing cross-role route leakage with friendly redirection toasts.
   - New `hireRequests` collection and API routes (`/api/v1/hire-requests`). Requests expire after 7 days and acceptance creates Deal Room negotiation in a single Firestore transaction to prevent double-acceptance.
   - New `conversations` and `messages` collection with 3-second polling transport.
   - Provider profile enhanced with `basePriceCents`, `packages`, `portfolio`, `certifications`, `published`, and `profileCompleteness`.
   - New AI endpoints: `/api/v1/ai/suggest-price` and `/api/v1/ai/improve-bio`.
   - Complete removal of Skip buttons, speaker/volume toggles, and audio controls across all video players. All videos are silent background/hero players with poster fallback and `prefers-reduced-motion` compliance.
