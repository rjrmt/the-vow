# The Vow - File Structure

```
the-vow/
├── server.js                 # Custom server with WebSocket support
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── realtime/
│   │   │   │   └── route.ts   # Realtime API (GET returns info)
│   │   │   └── session/
│   │   │       ├── create/
│   │   │       │   └── route.ts
│   │   │       └── join/
│   │   │           └── route.ts
│   │   ├── globals.css       # Theme system + CSS vars
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── AppShell.tsx
│   │   ├── ClientOnly.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ModuleSwitcher.tsx
│   │   ├── RibbonNav.tsx
│   │   └── SessionGate.tsx
│   ├── context/
│   │   ├── DateProvider.tsx
│   │   ├── ModuleContext.tsx
│   │   ├── SessionContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/
│   │   ├── haptics.ts
│   │   ├── realtime-client.ts
│   │   └── session-store.ts
│   ├── modules/
│   │   ├── Home.tsx
│   │   ├── DopamineDeck.tsx
│   │   ├── PulseSync.tsx
│   │   ├── MemoryLoom.tsx
│   │   ├── AffirmationOrbit.tsx
│   │   └── CoOpCanvas.tsx
│   ├── reducers/
│   │   └── moduleController.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

## Run

```bash
npm run dev
```

WebSocket server runs on the same port as Next.js. `npm run dev` uses the custom server.
