import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getMessages, resolveLanguage, type LanguageCode, type Messages } from './i18n'
import { parseWeatherDate, weatherKind } from './lib/weather'
import { readSettings, saveSettings } from './lib/storage'
import { type Settings, type WindUnit } from './settings-config'
import type { WeatherCategory } from './types/weather'

export type { Settings, TempUnit, WindUnit } from './settings-config'

const WIND_FACTOR: Record<WindUnit, number> = { kmh: 1, mph: 0.621371, ms: 1 / 3.6 }
const WIND_LABEL: Record<WindUnit, string> = { kmh: 'km/h', mph: 'mph', ms: 'm/s' }

interface AppValue {
  settings: Settings
  setSettings: (patch: Partial<Settings>) => void
  lang: LanguageCode
  t: Messages
  temp: (celsius: number) => string
  windLabel: string
  wind: (kmh: number) => string
  hour: (iso: string, timezone: string, utcOffsetSeconds?: number) => string
  time: (iso: string, timezone: string, utcOffsetSeconds?: number) => string
  day: (iso: string) => string
  fullDate: (iso: string) => string
  weather: (code: number) => { label: string; shortLabel: string; category: WeatherCategory }
}

const AppContext = createContext<AppValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(readSettings)

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState((current) => {
      const next = { ...current, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const value = useMemo<AppValue>(() => {
    const lang = resolveLanguage(settings.language)
    const t = getMessages(lang)
    const dtf = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(lang, options)

    return {
      settings,
      setSettings,
      lang,
      t,
      temp: (celsius) => `${Math.round(settings.tempUnit === 'f' ? celsius * 1.8 + 32 : celsius)}°`,
      windLabel: WIND_LABEL[settings.windUnit],
      wind: (kmh) => `${Math.round(kmh * WIND_FACTOR[settings.windUnit])} ${WIND_LABEL[settings.windUnit]}`,
      hour: (iso, timezone, offset = 0) =>
        dtf({ hour: 'numeric', timeZone: timezone }).format(parseWeatherDate(iso, offset)),
      time: (iso, timezone, offset = 0) =>
        dtf({ hour: 'numeric', minute: '2-digit', timeZone: timezone }).format(parseWeatherDate(iso, offset)),
      day: (iso) => dtf({ weekday: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)),
      fullDate: (iso) =>
        dtf({ weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`)),
      weather: (code) => {
        const { key, category } = weatherKind(code)
        return { label: t.weather[key].label, shortLabel: t.weather[key].short, category }
      },
    }
  }, [settings, setSettings])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Provider and its hook are intentionally colocated (they share the context).
// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): AppValue {
  const value = useContext(AppContext)
  if (!value) throw new Error('useI18n must be used within SettingsProvider')
  return value
}
