import { DEFAULT_LOCATION, WORLD_LOCATIONS } from '../data/locations'
import { DEFAULT_SETTINGS, type Settings } from '../settings-config'
import type { ForecastResponse, LocationPoint } from '../types/weather'

const FAVORITES_KEY = 'sora:favorites-v2'
const LEGACY_FAVORITES_KEY = 'sora:favorites'
const SELECTED_KEY = 'sora:selected-location-v2'
const LEGACY_SELECTED_KEY = 'sora:selected-location'
const FORECAST_CACHE_KEY = 'sora:forecast-cache'
const SETTINGS_KEY = 'sora:settings-v1'

export function readSettings(): Settings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    // Merge onto defaults so a settings key added in a later version still resolves.
    return saved ? { ...DEFAULT_SETTINGS, ...(JSON.parse(saved) as Partial<Settings>) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Storage can be unavailable in hardened/private browsing modes.
  }
}

export function readFavorites(): LocationPoint[] {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY)
    if (saved) return JSON.parse(saved) as LocationPoint[]

    const legacyIds = JSON.parse(localStorage.getItem(LEGACY_FAVORITES_KEY) ?? '[]') as string[]
    return legacyIds.map((id) => WORLD_LOCATIONS.find((location) => location.id === id)).filter(Boolean) as LocationPoint[]
  } catch {
    return []
  }
}

export function saveFavorites(locations: LocationPoint[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(locations))
  } catch {
    // Storage can be unavailable in hardened/private browsing modes.
  }
}

export function readSelectedLocation(): LocationPoint {
  try {
    const saved = localStorage.getItem(SELECTED_KEY)
    if (saved) return JSON.parse(saved) as LocationPoint

    const legacyId = localStorage.getItem(LEGACY_SELECTED_KEY)
    return WORLD_LOCATIONS.find((location) => location.id === legacyId) ?? DEFAULT_LOCATION
  } catch {
    return DEFAULT_LOCATION
  }
}

export function saveSelectedLocation(location: LocationPoint): void {
  try {
    localStorage.setItem(SELECTED_KEY, JSON.stringify(location))
  } catch {
    // Storage can be unavailable in hardened/private browsing modes.
  }
}

export function saveForecastCache(locationId: string, data: ForecastResponse): void {
  try {
    const cache = JSON.parse(localStorage.getItem(FORECAST_CACHE_KEY) ?? '{}') as Record<
      string,
      { savedAt: number; data: ForecastResponse }
    >
    cache[locationId] = { savedAt: Date.now(), data }

    const entries = Object.entries(cache).sort((a, b) => b[1].savedAt - a[1].savedAt).slice(0, 24)
    localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {
    // Storage can be unavailable in hardened/private browsing modes.
  }
}

export function readForecastCache(locationId: string): { savedAt: number; data: ForecastResponse } | null {
  try {
    const cache = JSON.parse(localStorage.getItem(FORECAST_CACHE_KEY) ?? '{}') as Record<
      string,
      { savedAt: number; data: ForecastResponse }
    >
    return cache[locationId] ?? null
  } catch {
    return null
  }
}
