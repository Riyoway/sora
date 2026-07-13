# Sora — World Weather

Sora is an installable English-language weather PWA for locations worldwide.

## Included

- Worldwide city and place search powered by Open-Meteo Geocoding
- Current conditions, 24-hour forecast, and 7-day outlook
- Device geolocation with explicit user permission
- A live overview of 72 featured cities across six continents
- Installable PWA manifest, service worker, offline shell, and cached forecasts
- Favorites and saved locations stored locally in the browser
- Full-screen weather scenes for clear skies, cloud, fog, rain, snow, and thunderstorms
- Dense layered rainfall during rain and lightning flashes during thunderstorms
- Responsive desktop, tablet, and mobile layouts
- Hidden native scrollbars while preserving mouse, touch, trackpad, and keyboard scrolling
- Reduced-motion, reduced-transparency, and increased-contrast support

## Stack

- React + TypeScript
- Vite
- Motion for spring-based and interruptible UI transitions
- vite-plugin-pwa / Workbox
- Open-Meteo Forecast and Geocoding APIs
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Geolocation and installation

Browser geolocation requires HTTPS in production. `localhost` is treated as a secure development context by modern browsers. The install button appears only when the browser emits the PWA install prompt.

## Data and privacy

Forecast and location-search requests go directly to Open-Meteo. Device coordinates are requested only after the user presses “Use current location.” Sora includes no analytics, advertising, account system, or custom backend. Favorites, the selected location, and saved forecasts remain in browser storage.

## Motion system

The interface uses restrained, physical motion:

- Spring-based, interruptible view transitions
- Crossfades when the selected location changes
- Staggered forecast entrances
- Immediate press and tap feedback
- Shared navigation indicator and layout animation
- Weather-specific ambient scenes behind the information layer
- Layered rain with depth and storm flashes for thunderstorms
- Automatic reduced-motion alternatives

## Production note

Review Open-Meteo’s current usage terms and plan requirements before commercial or high-volume deployment.

## License

MIT — see [LICENSE](LICENSE).
