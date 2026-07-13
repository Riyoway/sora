import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { WeatherCategory } from '../types/weather'

interface WeatherSceneProps {
  category: WeatherCategory
  isDay: boolean
}

type ParticleStyle = CSSProperties & Record<`--${string}`, string | number>

const cloudMotion = {
  animate: { x: [0, 20, 0], y: [0, -4, 0] },
  transition: { duration: 14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' as const },
}

function rainStyle(index: number, front: boolean, drizzle: boolean): ParticleStyle {
  const seed = index + (front ? 151 : 0)
  return {
    '--x': `${(seed * 47 + 13) % 101}%`,
    '--drift': `${5 + (seed % 5) * 1.4}vw`,
    '--drop-width': `${front ? 1.2 + (seed % 3) * 0.42 : 0.8 + (seed % 3) * 0.3}px`,
    '--drop-length': `${drizzle ? 24 + (seed % 5) * 8 : front ? 78 + (seed % 7) * 18 : 52 + (seed % 6) * 13}px`,
    '--drop-opacity': `${drizzle ? 0.25 + (seed % 4) * 0.055 : front ? 0.42 + (seed % 5) * 0.1 : 0.24 + (seed % 6) * 0.075}`,
    '--drop-duration': `${drizzle ? 1.12 + (seed % 7) * 0.12 : front ? 0.44 + (seed % 7) * 0.045 : 0.58 + (seed % 8) * 0.055}s`,
    '--drop-delay': `${-(seed * 0.071)}s`,
  }
}

function snowStyle(index: number): ParticleStyle {
  return {
    '--x': `${(index * 47 + 9) % 101}%`,
    '--flake-size': `${8 + (index % 4) * 3}px`,
    '--flake-duration': `${8 + (index % 8) * 0.7}s`,
    '--flake-delay': `${-(index * 0.56)}s`,
  }
}

function starStyle(index: number): ParticleStyle {
  return {
    '--x': `${(index * 37 + 7) % 100}%`,
    '--y': `${(index * 53 + 11) % 58}%`,
    '--star-opacity': `${0.2 + (index % 4) * 0.12}`,
    '--star-duration': `${2 + (index % 5) * 0.7}s`,
  }
}

export function WeatherScene({ category, isDay }: WeatherSceneProps) {
  const showClouds = category !== 'clear'
  const showRain = category === 'rain' || category === 'drizzle' || category === 'thunder'
  const showSnow = category === 'snow'
  const showFog = category === 'fog'
  const showStorm = category === 'thunder'
  const isDrizzle = category === 'drizzle'
  const rainCount = isDrizzle ? 44 : category === 'thunder' ? 132 : 96

  return (
    <div className={`weather-scene scene-${category}`} aria-hidden="true">
      <div className="scene-gradient" />
      <div className="scene-grain" />
      {isDay ? (
        <motion.div
          className="scene-sun"
          animate={{ rotate: 360, scale: [1, 1.035, 1] }}
          transition={{ rotate: { duration: 80, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }, scale: { duration: 7, repeat: Number.POSITIVE_INFINITY } }}
        />
      ) : (
        <>
          <motion.div className="scene-moon" animate={{ y: [0, -6, 0] }} transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }} />
          <div className="stars">
            {Array.from({ length: 18 }, (_, index) => <i key={index} style={starStyle(index)} />)}
          </div>
        </>
      )}
      {showClouds && (
        <>
          <motion.div className="scene-cloud cloud-one" {...cloudMotion}><span /><span /><span /></motion.div>
          <motion.div className="scene-cloud cloud-two" animate={{ x: [0, -28, 0], y: [0, 5, 0] }} transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}><span /><span /><span /></motion.div>
        </>
      )}
      {showRain && (
        <>
          <div className={`rain-field rain-back ${isDrizzle ? 'is-drizzle' : ''}`}>
            {Array.from({ length: rainCount }, (_, index) => <i key={index} style={rainStyle(index, false, isDrizzle)} />)}
          </div>
          <div className={`rain-field rain-front ${isDrizzle ? 'is-drizzle' : ''}`}>
            {Array.from({ length: Math.ceil(rainCount * 0.52) }, (_, index) => <i key={index} style={rainStyle(index, true, isDrizzle)} />)}
          </div>
          <div className="rain-haze" />
        </>
      )}
      {showSnow && (
        <div className="snow-field">
          {Array.from({ length: 32 }, (_, index) => <i key={index} style={snowStyle(index)}>✦</i>)}
        </div>
      )}
      {showFog && <div className="fog-field"><i /><i /><i /><i /></div>}
      {showStorm && (
        <>
          <div className="storm-flash" />
          <div className="lightning-bolt bolt-one" />
          <div className="lightning-bolt bolt-two" />
        </>
      )}
      <div className="scene-vignette" />
    </div>
  )
}
