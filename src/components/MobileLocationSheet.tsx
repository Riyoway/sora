import { Globe2, LocateFixed, MapPin, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { useI18n } from '../settings'
import type { LocationPoint } from '../types/weather'

interface MobileLocationSheetProps {
  open: boolean
  isLocating: boolean
  onClose: () => void
  onLocate: () => void
  onSelect: (location: LocationPoint) => void
}

export function MobileLocationSheet({ open, isLocating, onClose, onLocate, onSelect }: MobileLocationSheetProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const { locations, searching, searchFailed, isGlobalSearch } = usePlaceSearch(query)

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="sheet-scrim" onClick={onClose} aria-label={t.locate.close} />
          <motion.section
            className="mobile-sheet glass-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.38 }}
          >
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div><span className="eyebrow">{t.sheet.eyebrow}</span><h2>{t.sheet.title}</h2></div>
              <button className="icon-button" onClick={onClose} aria-label={t.locate.close}><X size={19} /></button>
            </div>
            <button className="location-button primary-action" onClick={onLocate} disabled={isLocating}>
              <LocateFixed size={18} /> {isLocating ? t.locate.finding : t.locate.use}
            </button>
            <label className="search-field">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.locate.searchPlaceholder} autoFocus />
              {searching && <span className="search-spinner" aria-label={t.locate.finding} />}
            </label>
            {isGlobalSearch && <div className="search-scope mobile-search-scope"><Globe2 size={13} /> {t.locate.worldwide}</div>}
            <div className="mobile-location-list">
              {locations.map((location) => (
                <button key={location.id} onClick={() => { onSelect(location); onClose() }}>
                  <MapPin size={17} />
                  <span><strong>{location.name}</strong><small>{location.admin1 && location.admin1 !== location.name ? `${location.admin1} · ` : ''}{location.country}</small></span>
                </button>
              ))}
              {!locations.length && !searching && (
                <div className="empty-locations">
                  <Globe2 size={22} />
                  <strong>{t.locate.noPlaces}</strong>
                  <span>{searchFailed ? t.locate.searchUnavailable : t.locate.trySheet}</span>
                </div>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
