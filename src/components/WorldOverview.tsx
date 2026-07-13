import { Droplets, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { REGIONS, WORLD_LOCATIONS } from '../data/locations'
import { useI18n } from '../settings'
import type { LocationPoint, OverviewWeather, Region } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

interface WorldOverviewProps {
  weather: OverviewWeather[]
  loading: boolean
  onSelect: (location: LocationPoint) => void
}

export function WorldOverview({ weather, loading, onSelect }: WorldOverviewProps) {
  const { t, temp, weather: describe } = useI18n()
  const [region, setRegion] = useState<Region>('All')
  const [query, setQuery] = useState('')
  const map = useMemo(() => new Map(weather.map((item) => [item.locationId, item])), [weather])
  const locations = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return WORLD_LOCATIONS.filter((location) =>
      (region === 'All' || location.region === region) &&
      (!normalized || `${location.name} ${location.admin1 ?? ''} ${location.country}`.toLowerCase().includes(normalized)),
    )
  }, [query, region])

  return (
    <main className="overview-page">
      <div className="overview-hero">
        <div>
          <span className="eyebrow">{t.overview.eyebrow}</span>
          <h1>{t.overview.title}</h1>
          <p>{t.overview.subtitle}</p>
        </div>
        <div className="overview-stat glass-panel">
          <strong>{weather.length || '—'}</strong>
          <span>{t.overview.citiesUpdated}</span>
        </div>
      </div>

      <div className="overview-toolbar glass-panel">
        <label className="search-field overview-search">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.overview.filterPlaceholder} />
        </label>
        <div className="region-scroller overview-regions" role="tablist" aria-label={t.overview.eyebrow}>
          {REGIONS.map((item) => (
            <button key={item} className={item === region ? 'is-active' : ''} onClick={() => setRegion(item)}>{t.regions[item]}</button>
          ))}
        </div>
      </div>

      <div className="prefecture-grid">
        {locations.map((location, index) => {
          const item = map.get(location.id)
          return (
            <motion.button
              key={location.id}
              className="prefecture-card glass-panel"
              onClick={() => onSelect(location)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 18) * 0.018, type: 'spring', bounce: 0, duration: 0.38 }}
            >
              <div className="prefecture-card-top">
                <span>{t.regions[location.region]}</span>
                {item ? <WeatherIcon code={item.weatherCode} isDay={item.isDay} size={29} strokeWidth={1.5} /> : <span className="skeleton-icon" />}
              </div>
              <div>
                <h2>{location.name}</h2>
                <p>{location.country}</p>
              </div>
              {item ? (
                <>
                  <div className="prefecture-temperature">
                    <strong>{temp(item.temperature)}</strong>
                    <span>{describe(item.weatherCode).shortLabel}</span>
                  </div>
                  <div className="prefecture-meta">
                    <span>{t.overview.high} {temp(item.max)}</span>
                    <span>{t.overview.low} {temp(item.min)}</span>
                    <span><Droplets size={12} />{item.precipitationProbability}%</span>
                  </div>
                </>
              ) : (
                <div className="card-skeleton" aria-label={loading ? t.loading.reading : t.loading.unavailable}><i /><i /><i /></div>
              )}
            </motion.button>
          )
        })}
      </div>
    </main>
  )
}
