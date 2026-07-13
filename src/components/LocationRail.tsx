import { Globe2, LocateFixed, MapPin, Search, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { REGIONS, WORLD_LOCATIONS } from '../data/locations'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { useI18n } from '../settings'
import type { LocationPoint, Region } from '../types/weather'

interface LocationRailProps {
  selected: LocationPoint
  favorites: LocationPoint[]
  isLocating: boolean
  onSelect: (location: LocationPoint) => void
  onLocate: () => void
  onToggleFavorite: (location: LocationPoint) => void
}

export function LocationRail({ selected, favorites, isLocating, onSelect, onLocate, onToggleFavorite }: LocationRailProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<Region>('All')
  const { locations: searchResults, searching, searchFailed, isGlobalSearch } = usePlaceSearch(query, region)
  const favoriteIds = useMemo(() => new Set(favorites.map((location) => location.id)), [favorites])

  const locations = useMemo(() => {
    const merged = [...searchResults]
    if (!merged.some((location) => location.id === selected.id) && !query.trim()) merged.unshift(selected)
    return merged.sort((a, b) => {
      const favoriteDifference = Number(favoriteIds.has(b.id)) - Number(favoriteIds.has(a.id))
      if (favoriteDifference) return favoriteDifference
      if (a.id === selected.id) return -1
      if (b.id === selected.id) return 1
      return a.name.localeCompare(b.name)
    })
  }, [favoriteIds, query, searchResults, selected])

  return (
    <aside className="location-rail glass-panel">
      <div className="rail-heading">
        <div>
          <span className="eyebrow">{t.rail.eyebrow}</span>
          <h2>{t.rail.title}</h2>
        </div>
        <span className="count-pill">{WORLD_LOCATIONS.length}+</span>
      </div>

      <button className="location-button primary-action" onClick={onLocate} disabled={isLocating}>
        <LocateFixed size={18} />
        <span>{isLocating ? t.locate.finding : t.locate.use}</span>
      </button>

      <label className="search-field">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.locate.searchPlaceholder} />
        {searching && <span className="search-spinner" aria-label={t.locate.finding} />}
      </label>

      <div className="region-scroller" role="tablist" aria-label={t.regions.All}>
        {REGIONS.map((item) => (
          <button
            key={item}
            className={region === item ? 'is-active' : ''}
            onClick={() => setRegion(item)}
            role="tab"
            aria-selected={region === item}
          >
            {t.regions[item]}
          </button>
        ))}
      </div>

      <div className="location-list" aria-label={t.rail.title}>
        {isGlobalSearch && (
          <div className="search-scope"><Globe2 size={13} /> {t.locate.worldwide}</div>
        )}
        {locations.map((location, index) => {
          const isSelected = selected.id === location.id
          const isFavorite = favoriteIds.has(location.id)
          return (
            <motion.div
              key={location.id}
              className={`location-row ${isSelected ? 'is-selected' : ''}`}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 12) * 0.018 }}
            >
              <button className="location-main" onClick={() => onSelect(location)}>
                <span className="location-marker"><MapPin size={15} /></span>
                <span>
                  <strong>{location.name}</strong>
                  <small>{location.admin1 && location.admin1 !== location.name ? `${location.admin1} · ` : ''}{location.country}</small>
                </span>
              </button>
              <button
                className={`icon-button favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                onClick={() => onToggleFavorite(location)}
                aria-label={t.locate.favorite(location.name, isFavorite)}
              >
                <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </motion.div>
          )
        })}
        {!locations.length && !searching && (
          <div className="empty-locations">
            <Globe2 size={22} />
            <strong>{t.locate.noPlaces}</strong>
            <span>{searchFailed ? t.locate.searchUnavailable : t.locate.tryRail}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
