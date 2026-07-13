import { Droplets, Gauge, Navigation, Sunrise, Sunset, Wind } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { windDirection } from '../lib/weather'
import { useI18n } from '../settings'
import type { ForecastResponse, LocationPoint } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

interface CurrentWeatherProps {
  location: LocationPoint
  forecast: ForecastResponse
  isCached: boolean
}

export function CurrentWeather({ location, forecast, isCached }: CurrentWeatherProps) {
  const { t, weather, temp, wind, fullDate, time } = useI18n()
  const current = forecast.current
  const descriptor = weather(current.weather_code)
  const todayIndex = Math.max(0, forecast.daily.time.indexOf(current.time.slice(0, 10)))
  const sunrise = forecast.daily.sunrise[todayIndex] ?? forecast.daily.sunrise[0]
  const sunset = forecast.daily.sunset[todayIndex] ?? forecast.daily.sunset[0]
  const formatTime = (value: string) => time(value, forecast.timezone, forecast.utc_offset_seconds)

  return (
    <section className="current-section">
      <AnimatePresence mode="wait">
        <motion.article
          key={`${location.id}-${current.time}`}
          className="current-card glass-panel"
          initial={{ opacity: 0, scale: 0.985, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.99, filter: 'blur(8px)' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.42 }}
        >
          <div className="current-topline">
            <span>{fullDate(current.time.slice(0, 10))}</span>
            <span className="live-status"><i />{isCached ? t.current.saved : t.current.live}</span>
          </div>

          <div className="current-main">
            <div className="location-copy">
              <p>{location.custom ? t.current.yourLocation : t.regions[location.region]}</p>
              <h1>{location.name}</h1>
              <span>{location.custom ? location.country : `${location.admin1 && location.admin1 !== location.name ? `${location.admin1}, ` : ''}${location.country}`}</span>
            </div>
            <div className="weather-mark">
              <WeatherIcon code={current.weather_code} isDay={current.is_day} strokeWidth={1.5} />
            </div>
            <div className="temperature-block">
              <div className="temperature-value">{temp(current.temperature_2m).replace('°', '')}<sup>°</sup></div>
              <div>
                <strong>{descriptor.label}</strong>
                <span>{t.current.feelsLike(temp(current.apparent_temperature))}</span>
              </div>
            </div>
          </div>

          <div className="current-summary">
            <span>
              {t.current.todayReaches(
                temp(forecast.daily.temperature_2m_max[todayIndex] ?? forecast.daily.temperature_2m_max[0]),
                forecast.daily.precipitation_probability_max[todayIndex] ?? forecast.daily.precipitation_probability_max[0],
              )}
            </span>
          </div>

          <div className="metric-grid">
            <div className="metric-item">
              <span className="metric-icon"><Wind size={18} /></span>
              <span><small>{t.current.wind}</small><strong>{wind(current.wind_speed_10m)}</strong></span>
              <em>{windDirection(current.wind_direction_10m)} <Navigation size={12} style={{ transform: `rotate(${current.wind_direction_10m}deg)` }} /></em>
            </div>
            <div className="metric-item">
              <span className="metric-icon"><Droplets size={18} /></span>
              <span><small>{t.current.humidity}</small><strong>{current.relative_humidity_2m}%</strong></span>
              <em>{current.precipitation.toFixed(1)} mm</em>
            </div>
            <div className="metric-item">
              <span className="metric-icon"><Gauge size={18} /></span>
              <span><small>{t.current.pressure}</small><strong>{Math.round(current.surface_pressure)} hPa</strong></span>
              <em>{t.current.cloud(current.cloud_cover)}</em>
            </div>
            <div className="metric-item sun-times">
              <span className="metric-icon"><Sunrise size={18} /></span>
              <span><small>{t.current.sunrise}</small><strong>{formatTime(sunrise)}</strong></span>
              <em><Sunset size={13} /> {formatTime(sunset)}</em>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>
    </section>
  )
}
