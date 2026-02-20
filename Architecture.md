# Zenith AI Task Manager - Architecture

## System Structure

The Zenith AI Task Manager is built with a modern, modular architecture that separates concerns between the UI, state management, AI logic, and persistence.

### Folder Hierarchy

```
/root
├── /src
│   ├── /components     # React components (UI cards, sidebar, modals, etc.)
│   │   ├── /Auth       # Authentication screens
│   │   └── ...         # Feature-specific components
│   ├── /services       # API calls, Firebase initialization, AI API integration
│   │   ├── authService.ts
│   │   ├── firebase.ts
│   │   ├── geminiService.ts
│   │   ├── taskDb.ts
│   │   └── hal.ts      # Hardware Abstraction Layer
│   ├── /store.ts       # State management (Zustand-like Context API)
│   ├── /types.ts       # TypeScript interfaces and types
│   └── App.tsx         # Main application entry and routing
├── /public             # Static assets
├── /firebase           # Firebase config + security rules (conceptual)
├── /ai                 # AI logic (embedded in geminiService.ts)
└── package.json
```

## Layers

### 1. Presentation/UI Layer
- **React + Tailwind CSS**: Fully responsive, high-performance dashboard.
- **Framer Motion**: Smooth transitions and interactive animations.
- **Lucide React**: Consistent, high-quality iconography.

### 2. AI Layer (Neural Core)
- **Gemini 3 Flash**: Used for fast task extraction, optimization, and suggestions.
- **Gemini 3 Pro**: Used for complex project decomposition, deep research (with Google Search), and technical terminal queries (Antigravity).
- **Strategic Briefing**: Real-time synthesis of task context into actionable insights.

### 3. Memory & Context Layer
- **Task Context**: Maintains the current state of tasks, suggestions, and user settings.
- **Terminal History**: Stores conversation context for the Antigravity console.

### 4. Scheduler/Reminder Layer
- **Timeline View**: Chronological roadmap based on task deadlines.
- **Notification Engine**: Simulated multi-channel alerts (Push, Email, SMS).

### 5. Persistence Layer
- **Firebase Firestore**: Real-time NoSQL database for tasks and user data.
- **Firebase Auth**: Multi-modal authentication (Google, Email, Phone/OTP).

### 6. Hardware Abstraction Layer (HAL)
- **Biometric Simulation**: Interfaces with browser APIs (Camera, Microphone) to simulate high-assurance security acquisition.

## Error Handling
- **Graceful Degradation**: AI modules provide fallback responses if API calls fail.
- **Firebase Handshake**: Singleton initialization with error catching to prevent app crashes.
- **Type Safety**: Comprehensive TypeScript interfaces ensure data integrity across the system.
