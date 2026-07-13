import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from 'lucide-react'
import type { ComponentProps } from 'react'
import { weatherKind } from '../lib/weather'

interface WeatherIconProps extends Omit<ComponentProps<typeof Sun>, 'ref'> {
  code: number
  isDay?: number
}

export function WeatherIcon({ code, isDay = 1, ...props }: WeatherIconProps) {
  const { category } = weatherKind(code)
  if (category === 'clear') return isDay ? <Sun {...props} /> : <span className="moon-glyph" aria-hidden="true">◒</span>
  if (category === 'partly-cloudy') return <CloudSun {...props} />
  if (category === 'cloudy') return <Cloud {...props} />
  if (category === 'fog') return <CloudFog {...props} />
  if (category === 'drizzle' || category === 'rain') return <CloudRain {...props} />
  if (category === 'snow') return <Snowflake {...props} />
  return <CloudLightning {...props} />
}
