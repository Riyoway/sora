import { Droplets, Wind } from 'lucide-react'
import { motion } from 'motion/react'
import { useI18n } from '../settings'
import type { ForecastResponse } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

export function WeeklyForecast({ forecast }: { forecast: ForecastResponse }) {
  const { t, weather, temp, wind, day: formatDay } = useI18n()
  const days = forecast.daily.time.slice(0, 7)
  const low = Math.min(...forecast.daily.temperature_2m_min.slice(0, 7))
  const high = Math.max(...forecast.daily.temperature_2m_max.slice(0, 7))
  const range = Math.max(1, high - low)

  return (
    <aside className="week-card glass-panel">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">{t.weekly.eyebrow}</span>
          <h2>{t.weekly.title}</h2>
        </div>
      </div>
      <div className="week-list">
        {days.map((day, index) => {
          const min = forecast.daily.temperature_2m_min[index]
          const max = forecast.daily.temperature_2m_max[index]
          const left = ((min - low) / range) * 52
          const width = Math.max(16, ((max - min) / range) * 48)
          return (
            <motion.article
              key={day}
              className="day-row"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, type: 'spring', bounce: 0, duration: 0.4 }}
            >
              <div className="day-name">
                <strong>{index === 0 ? t.weekly.today : formatDay(day)}</strong>
                <span>{weather(forecast.daily.weather_code[index]).shortLabel}</span>
              </div>
              <WeatherIcon code={forecast.daily.weather_code[index]} size={25} strokeWidth={1.6} />
              <span className="rain-chance"><Droplets size={12} />{forecast.daily.precipitation_probability_max[index]}%</span>
              <div className="temperature-range">
                <small>{temp(min)}</small>
                <span><i style={{ left: `${left}%`, width: `${width}%` }} /></span>
                <strong>{temp(max)}</strong>
              </div>
            </motion.article>
          )
        })}
      </div>
      <div className="week-footer">
        <span><Wind size={15} /> {t.weekly.peakWind}</span>
        <strong>{wind(Math.max(...forecast.daily.wind_speed_10m_max.slice(0, 7)))}</strong>
      </div>
    </aside>
  )
}
