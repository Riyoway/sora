import { WORLD_LOCATIONS } from '../data/locations'
import type {
  ForecastResponse,
  LocationPoint,
  OverviewWeather,
  WeatherCategory,
  WeatherKey,
} from '../types/weather'

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

function detailedForecastUrl(location: LocationPoint): string {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '8',
  })

  return `${FORECAST_ENDPOINT}?${params.toString()}`
}

export async function fetchForecast(location: LocationPoint, signal?: AbortSignal): Promise<ForecastResponse> {
  const response = await fetch(detailedForecastUrl(location), { signal })
  if (!response.ok) throw new Error(`Weather service returned ${response.status}`)
  return response.json() as Promise<ForecastResponse>
}

function chunks<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  )
}

export async function fetchWorldOverview(signal?: AbortSignal): Promise<OverviewWeather[]> {
  const groups = chunks(WORLD_LOCATIONS, 18)
  const result = await Promise.all(
    groups.map(async (group) => {
      const params = new URLSearchParams({
        latitude: group.map((item) => item.latitude).join(','),
        longitude: group.map((item) => item.longitude).join(','),
        current: 'temperature_2m,weather_code,is_day',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: '1',
      })
      const response = await fetch(`${FORECAST_ENDPOINT}?${params.toString()}`, { signal })
      if (!response.ok) throw new Error(`Weather service returned ${response.status}`)
      const payload = (await response.json()) as Array<{
        current: { temperature_2m: number; weather_code: number; is_day: number }
        daily: {
          temperature_2m_max: number[]
          temperature_2m_min: number[]
          precipitation_probability_max: number[]
        }
      }> | {
        current: { temperature_2m: number; weather_code: number; is_day: number }
        daily: {
          temperature_2m_max: number[]
          temperature_2m_min: number[]
          precipitation_probability_max: number[]
        }
      }
      const normalized = Array.isArray(payload) ? payload : [payload]
      return normalized.map((weather, index): OverviewWeather => ({
        locationId: group[index].id,
        temperature: weather.current.temperature_2m,
        weatherCode: weather.current.weather_code,
        isDay: weather.current.is_day,
        max: weather.daily.temperature_2m_max[0],
        min: weather.daily.temperature_2m_min[0],
        precipitationProbability: weather.daily.precipitation_probability_max[0],
      }))
    }),
  )

  return result.flat()
}

// Maps a WMO weather code to a translation key + theme category. Labels live in
// the locale files; look them up via useI18n().weather(code).
export function weatherKind(code: number): { key: WeatherKey; category: WeatherCategory } {
  if (code === 0) return { key: 'clear', category: 'clear' }
  if (code === 1 || code === 2) return { key: 'partlyCloudy', category: 'partly-cloudy' }
  if (code === 3) return { key: 'overcast', category: 'cloudy' }
  if (code === 45 || code === 48) return { key: 'fog', category: 'fog' }
  if ([51, 53, 55, 56, 57].includes(code)) return { key: 'drizzle', category: 'drizzle' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { key: 'rain', category: 'rain' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { key: 'snow', category: 'snow' }
  if ([95, 96, 99].includes(code)) return { key: 'thunder', category: 'thunder' }
  return { key: 'mixed', category: 'cloudy' }
}

export function getThemeClass(category: WeatherCategory, isDay: number): string {
  return `theme-${category} ${isDay ? 'is-day' : 'is-night'}`
}

export function windDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return directions[Math.round(degrees / 45) % 8]
}

export function nearestFeaturedLocation(latitude: number, longitude: number): LocationPoint {
  const toRad = (value: number) => (value * Math.PI) / 180
  let nearest = WORLD_LOCATIONS[0]
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const location of WORLD_LOCATIONS) {
    const dLat = toRad(location.latitude - latitude)
    const dLon = toRad(location.longitude - longitude)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(latitude)) * Math.cos(toRad(location.latitude)) * Math.sin(dLon / 2) ** 2
    const distance = 2 * 6371 * Math.asin(Math.sqrt(a))
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = location
    }
  }

  return nearest
}

export function parseWeatherDate(iso: string, utcOffsetSeconds = 0): Date {
  if (/Z$|[+-]\d{2}:\d{2}$/.test(iso)) return new Date(iso)
  const normalized = iso.length === 10 ? `${iso}T12:00:00` : iso
  return new Date(Date.parse(`${normalized}Z`) - utcOffsetSeconds * 1000)
}
