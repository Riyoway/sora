export type WeatherCategory =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder'

export type Region =
  | 'All'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Africa'
  | 'Oceania'

export interface LocationPoint {
  id: string
  name: string
  country: string
  countryCode: string
  region: Exclude<Region, 'All'>
  latitude: number
  longitude: number
  admin1?: string
  timezone?: string
  custom?: boolean
  source?: 'featured' | 'search' | 'geolocation'
}

export interface CurrentWeather {
  time: string
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  precipitation: number
  weather_code: number
  cloud_cover: number
  surface_pressure: number
  wind_speed_10m: number
  wind_direction_10m: number
}

export interface HourlyWeather {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  precipitation_probability: number[]
  weather_code: number[]
  wind_speed_10m: number[]
}

export interface DailyWeather {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  sunrise: string[]
  sunset: string[]
  precipitation_probability_max: number[]
  wind_speed_10m_max: number[]
}

export interface ForecastResponse {
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation: string
  utc_offset_seconds: number
  current: CurrentWeather
  hourly: HourlyWeather
  daily: DailyWeather
}

export interface OverviewWeather {
  locationId: string
  temperature: number
  weatherCode: number
  isDay: number
  max: number
  min: number
  precipitationProbability: number
}

export type WeatherKey =
  | 'clear'
  | 'partlyCloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder'
  | 'mixed'

export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
  admin1?: string
  timezone?: string
  feature_code?: string
}
