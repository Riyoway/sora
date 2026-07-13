import { Droplets } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { parseWeatherDate } from '../lib/weather'
import { useI18n } from '../settings'
import type { ForecastResponse } from '../types/weather'
import { WeatherIcon } from './WeatherIcon'

export function HourlyStrip({ forecast }: { forecast: ForecastResponse }) {
  const { t, temp, hour } = useI18n()
  const stripRef = useRef<HTMLDivElement>(null)

  // ponytail: mouse wheels only emit deltaY; without this the hidden-scrollbar horizontal
  // strip can't be scrolled by mouse. Non-passive listener so preventDefault stops the
  // page from also scrolling; trackpad horizontal gestures pass through untouched.
  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      if (el.scrollWidth <= el.clientWidth) return
      event.preventDefault()
      el.scrollLeft += event.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const now = parseWeatherDate(forecast.current.time, forecast.utc_offset_seconds).getTime()
  const startIndex = Math.max(0, forecast.hourly.time.findIndex((time) => parseWeatherDate(time, forecast.utc_offset_seconds).getTime() >= now))
  const indexes = Array.from({ length: 24 }, (_, index) => startIndex + index).filter((index) => index < forecast.hourly.time.length)

  // Map each hour's temperature to a bar height so the trend reads at a glance.
  const temps = indexes.map((index) => forecast.hourly.temperature_2m[index])
  const min = Math.min(...temps)
  const span = Math.max(...temps) - min
  const barHeight = (temp: number) => (span === 0 ? 55 : Math.round(24 + 76 * ((temp - min) / span)))

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t.hourly.eyebrow}</span>
          <h2>{t.hourly.title}</h2>
        </div>
        <span className="section-note">{t.hourly.localTime}</span>
      </div>
      <div ref={stripRef} className="hourly-strip glass-panel" role="list" aria-label={t.hourly.title}>
        {indexes.map((index, itemIndex) => {
          const pop = forecast.hourly.precipitation_probability[index]
          return (
            <motion.article
              key={forecast.hourly.time[index]}
              className={`hour-card ${itemIndex === 0 ? 'is-now' : ''}`}
              role="listitem"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(itemIndex, 10) * 0.025, type: 'spring', bounce: 0, duration: 0.35 }}
            >
              <span className="hour-time">{itemIndex === 0 ? t.hourly.now : hour(forecast.hourly.time[index], forecast.timezone, forecast.utc_offset_seconds)}</span>
              <WeatherIcon code={forecast.hourly.weather_code[index]} size={26} strokeWidth={1.6} />
              <strong>{temp(forecast.hourly.temperature_2m[index])}</strong>
              <span className="hour-bar" aria-hidden="true"><i style={{ height: `${barHeight(forecast.hourly.temperature_2m[index])}%` }} /></span>
              <small className={pop >= 30 ? 'is-wet' : ''}><Droplets size={12} />{pop}%</small>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
