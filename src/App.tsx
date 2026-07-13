import { Download, Globe2, LocateFixed, MapPin, RefreshCw, Settings as SettingsIcon, Sparkles } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CurrentWeather } from './components/CurrentWeather'
import { HourlyStrip } from './components/HourlyStrip'
import { LocationRail } from './components/LocationRail'
import { MobileLocationSheet } from './components/MobileLocationSheet'
import { Settings } from './components/Settings'
import { WeatherScene } from './components/WeatherScene'
import { WeeklyForecast } from './components/WeeklyForecast'
import { WorldOverview } from './components/WorldOverview'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { fetchForecast, fetchWorldOverview, getThemeClass, nearestFeaturedLocation, weatherKind } from './lib/weather'
import { readFavorites, readForecastCache, readSelectedLocation, saveFavorites, saveForecastCache, saveSelectedLocation } from './lib/storage'
import { useI18n } from './settings'
import type { ForecastResponse, LocationPoint, OverviewWeather } from './types/weather'
import './styles.css'

type View = 'forecast' | 'world' | 'settings'

export default function App() {
  const initialLocation = readSelectedLocation()
  const initialForecast = readForecastCache(initialLocation.id)?.data ?? null
  const [view, setView] = useState<View>('forecast')
  const [selected, setSelected] = useState<LocationPoint>(initialLocation)
  const [forecast, setForecast] = useState<ForecastResponse | null>(initialForecast)
  const [overview, setOverview] = useState<OverviewWeather[]>([])
  const [favorites, setFavorites] = useState<LocationPoint[]>(readFavorites)
  const [loading, setLoading] = useState(!initialForecast)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [isCached, setIsCached] = useState(Boolean(initialForecast))
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { canInstall, install } = useInstallPrompt()
  const { t } = useI18n()

  const loadForecast = useCallback(async (location: LocationPoint, signal: AbortSignal) => {
    const cached = readForecastCache(location.id)
    try {
      const nextForecast = await fetchForecast(location, signal)
      if (signal.aborted) return
      setForecast(nextForecast)
      setIsCached(false)
      saveForecastCache(location.id, nextForecast)
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return
      setMessage(cached ? t.toast.viewingSaved : t.toast.forecastUnavailable)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [t])

  useEffect(() => {
    const controller = new AbortController()
    loadForecast(selected, controller.signal)
    saveSelectedLocation(selected)
    return () => controller.abort()
  }, [loadForecast, selected])

  useEffect(() => {
    if (view !== 'world' || overview.length) return
    const controller = new AbortController()
    setOverviewLoading(true)
    fetchWorldOverview(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setOverview(data)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return
        setMessage(t.toast.worldUnavailable)
      })
      .finally(() => {
        if (!controller.signal.aborted) setOverviewLoading(false)
      })
    return () => controller.abort()
  }, [overview.length, t, view])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 4200)
    return () => window.clearTimeout(timer)
  }, [message])

  const kind = weatherKind(forecast?.current.weather_code ?? 1)
  const isDay = Boolean(forecast?.current.is_day ?? 1)
  const themeClass = getThemeClass(kind.category, isDay ? 1 : 0)

  const onSelectLocation = (location: LocationPoint) => {
    const cached = readForecastCache(location.id)
    setForecast(cached?.data ?? null)
    setIsCached(Boolean(cached))
    setLoading(!cached)
    setSelected(location)
    setView('forecast')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const toggleFavorite = (location: LocationPoint) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.id === location.id)
      const next = exists ? current.filter((item) => item.id !== location.id) : [...current, location]
      saveFavorites(next)
      return next
    })
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setMessage(t.toast.locationUnsupported)
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = nearestFeaturedLocation(coords.latitude, coords.longitude)
        onSelectLocation({
          id: `current-${coords.latitude.toFixed(4)}-${coords.longitude.toFixed(4)}`,
          name: t.locate.currentLocation,
          country: t.locate.near(nearest.name, nearest.country),
          countryCode: nearest.countryCode,
          region: nearest.region,
          latitude: coords.latitude,
          longitude: coords.longitude,
          timezone: nearest.timezone,
          custom: true,
          source: 'geolocation',
        })
        setLocating(false)
        setMessage(t.toast.locationUpdated)
      },
      (error) => {
        setLocating(false)
        setMessage(error.code === error.PERMISSION_DENIED ? t.toast.locationDenied : t.toast.locationFailed)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  const installApp = async () => {
    const accepted = await install()
    setMessage(accepted ? t.toast.installReady : t.toast.installDismissed)
  }

  const navItems = useMemo(() => [
    { id: 'forecast' as const, label: t.nav.forecast, icon: Sparkles },
    { id: 'world' as const, label: t.nav.world, icon: Globe2 },
    { id: 'settings' as const, label: t.nav.settings, icon: SettingsIcon },
  ], [t])

  return (
    <MotionConfig reducedMotion="user">
      <div className={`app ${themeClass}`}>
        <WeatherScene category={kind.category} isDay={isDay} />

        <header className="topbar glass-panel">
          <button className="brand" onClick={() => setView('forecast')} aria-label="Sora home">
            <img className="brand-mark" src="/pwa-192x192.png" alt="" width={36} height={36} />
            <span><strong>Sora</strong><small>{t.brand.tagline}</small></span>
          </button>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} className={view === id ? 'is-active' : ''} onClick={() => setView(id)}>
                <Icon size={16} />{label}
                {view === id && <motion.i layoutId="nav-indicator" />}
              </button>
            ))}
          </nav>

          <div className="top-actions">
            <button className="mobile-location-trigger" onClick={() => setMobileSheetOpen(true)}>
              <MapPin size={16} /><span>{selected.name}</span>
            </button>
            {canInstall && (
              <button className="install-button" onClick={installApp}>
                <Download size={16} /><span>{t.install}</span>
              </button>
            )}
            <button className="icon-button mobile-locate" onClick={locate} disabled={locating} aria-label={t.locate.use}>
              <LocateFixed size={18} />
            </button>
          </div>
        </header>

        <div className="desktop-layout">
          <LocationRail
            selected={selected}
            favorites={favorites}
            isLocating={locating}
            onSelect={onSelectLocation}
            onLocate={locate}
            onToggleFavorite={toggleFavorite}
          />

          <AnimatePresence mode="wait">
            {view === 'forecast' && (
              <motion.main key="forecast" className="forecast-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {forecast ? (
                  <>
                    <div className="forecast-main-column">
                      <CurrentWeather location={selected} forecast={forecast} isCached={isCached} />
                      <HourlyStrip forecast={forecast} />
                    </div>
                    <WeeklyForecast forecast={forecast} />
                  </>
                ) : (
                  <div className="loading-state glass-panel">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}><RefreshCw /></motion.span>
                    <h1>{loading ? t.loading.reading : t.loading.unavailable}</h1>
                    <p>{t.loading.checking(selected.name)}</p>
                  </div>
                )}
              </motion.main>
            )}
            {view === 'world' && (
              <motion.div key="world" className="overview-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WorldOverview weather={overview} loading={overviewLoading} onSelect={onSelectLocation} />
              </motion.div>
            )}
            {view === 'settings' && (
              <motion.div key="settings" className="overview-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Settings />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="mobile-nav glass-panel" aria-label="Mobile navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? 'is-active' : ''} onClick={() => setView(id)}>
              <span><Icon size={19} /></span>{label}
            </button>
          ))}
          <button onClick={() => setMobileSheetOpen(true)}><span><MapPin size={19} /></span>{t.nav.locations}</button>
        </nav>

        <MobileLocationSheet
          open={mobileSheetOpen}
          isLocating={locating}
          onClose={() => setMobileSheetOpen(false)}
          onLocate={locate}
          onSelect={onSelectLocation}
        />

        <AnimatePresence>
          {message && (
            <motion.div className="toast glass-panel" initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ type: 'spring', bounce: 0, duration: 0.35 }}>
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <footer>
          <p>{t.footer}</p>
          <nav className="footer-social" aria-label="Sora links">
            <a href="https://github.com/riyoway/sora" target="_blank" rel="noreferrer noopener" aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.21.7.82.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z"/></svg>
            </a>
            <a href="https://x.com/riyoway" target="_blank" rel="noreferrer noopener" aria-label="X">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M18.9 1.153h3.68l-8.04 9.19L24 22.846h-7.41l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.153h7.59l5.24 6.931 6.07-6.931Zm-1.29 19.49h2.04L6.49 3.24H4.3l13.31 17.403Z"/></svg>
            </a>
            <a href="https://riyo.me" target="_blank" rel="noreferrer noopener" aria-label="riyo.me">
              <Globe2 size={18} />
            </a>
          </nav>
        </footer>
      </div>
    </MotionConfig>
  )
}
