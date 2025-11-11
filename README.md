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

### Building and running

| Command | Task |
| -------------- | --------------- |
| `pnpm build:web` | Builds the web version into `static/dist` |
| `pnpm start:web` | Starts the Webpack dev server |
| `pnpm build:desktop` | Builds the desktop app into `build/desktop` |
| `pnpm start:desktop` | Starts the Electron dev version |
| `pnpm build:android` | Builds an Android release APK |
| `pnpm start:android` | Starts the Android dev version with Metro |
