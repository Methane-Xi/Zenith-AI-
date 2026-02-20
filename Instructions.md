# Zenith AI Task Manager - Developer Instructions

## Non-Negotiable Rules

### 1. AI Logic Modularity
- All AI interactions must reside in `services/geminiService.ts`.
- Use `gemini-3-flash-preview` for low-latency tasks (extraction, summary).
- Use `gemini-3-pro-preview` for high-reasoning tasks (decomposition, research).

### 2. Environment Variables
- All custom variables must be prefixed with `VITE_` in `.env`.
- The Gemini API key is accessed via `process.env.API_KEY` (configured in `vite.config.ts`).
- Never hardcode secrets in the codebase.

### 3. UI & UX Standards
- All buttons must have active/hover states.
- Use the `glass` utility class for panels to maintain the "Enclave" aesthetic.
- Ensure all pages render correctly on mobile (touch targets > 44px).
- Animations should use `framer-motion` for consistency.

### 4. Error Handling
- Never allow the app to crash on missing API keys; provide clear console warnings.
- Use the `AcquisitionState.ERROR` state in biometric engines to handle hardware denial.
- All Firebase calls must be wrapped in try/catch blocks.

### 5. TypeScript Usage
- Maintain strict typing in `types.ts`.
- Avoid `any` unless absolutely necessary for external SDK payloads.
- Use Enums for status and state management.

### 6. State Management
- Use the `TaskProvider` pattern for global state.
- Ensure real-time listeners (Firestore/Auth) are properly cleaned up in `useEffect` returns.
