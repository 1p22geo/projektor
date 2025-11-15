# ProjektOR - Zaj\*bista aplikacja do szukania projektów dla niewypalonej młodzieży

Dlaczego taka nazwa? Nie mam zielonego pojęcia. Ani czerwonego.
Dlaczego pnpm? Bo npm jest deprecated, wolny, rzuca warningami, a yarn był za duży.

## O co kurde chodzi

- Szkoła rejestruje się w aplikacji
- Szkoła w aplikacji zgłasza konkurs, w tym wymagania co do drużyn (i.e. max 3 drużyny 5-osobowe)
- Uczniowie rejestrują się w aplikacji
- Uczniowie szukają konkursów
- Uczeń zostaje przydzielony do istniejącej drużyny lub tworzy nową

## Official bullshit (feel free to skip this, your IDE knows better how to run it)

### Prerequisites

- pnpm 10+
- Node.js 20+
- Semi-working Android setup

### Setting up

- Clone the repo (downloading a zip from github DOES NOT COUNT)
- `pnpm install`
- `pnpm approve-builds`
- `cp .env.local.example .env.local` (configure your environment variables)

### Building and running

| Command              | Task                                                |
| -------------------- | --------------------------------------------------- |
| `pnpm build:web`     | Builds the web version into `build/web`             |
| `pnpm start:web`     | Starts the Webpack dev server                       |
| `pnpm build:desktop` | Builds desktop app (AppImage/EXE/DMG) into `dist/`  |
| `pnpm start:desktop` | Starts Electron in development mode with hot-reload |
| `pnpm build:android` | Builds Android APK into `dist/`                     |
| `pnpm start:android` | Starts Metro bundler for Android development        |
| `pnpm run:android`   | Runs app on connected Android emulator/device       |
| `pnpm lint`          | ESlint                                              |
| `pnpm test`          | Unit tests with Jest                                |

### Environment Variables

Environment variables are automatically loaded from `.env.local` file:

```bash
cp .env.local.example .env.local

vim .env.local
```

**`.env.local` example:**

```bash
API_URL=https://api.projektor.com
SOCKET_URL=https://ws.projektor.com
```

Available variables:

- `API_URL` - Backend API URL (default: `http://localhost:3000/api`)
- `SOCKET_URL` - WebSocket server URL (default: `http://localhost:3000`)
- `NODE_ENV` - Environment mode (set automatically)
- `ANDROID_HOME` - Path to Android SDK (required for Android builds)
