import { useEffect, useMemo, useState } from 'react'
import { WORLD_LOCATIONS } from '../data/locations'
import { searchLocations } from '../lib/geocoding'
import type { LocationPoint, Region } from '../types/weather'

export function usePlaceSearch(query: string, region: Region = 'All') {
  const [remoteLocations, setRemoteLocations] = useState<LocationPoint[]>([])
  const [searching, setSearching] = useState(false)
  const [searchFailed, setSearchFailed] = useState(false)
  const normalized = query.trim().toLowerCase()

  const featuredLocations = useMemo(() => WORLD_LOCATIONS.filter((location) => {
    const matchesRegion = region === 'All' || location.region === region
    const haystack = `${location.name} ${location.admin1 ?? ''} ${location.country} ${location.countryCode}`.toLowerCase()
    return matchesRegion && (!normalized || haystack.includes(normalized))
  }), [normalized, region])

  useEffect(() => {
    if (normalized.length < 2) {
      setRemoteLocations([])
      setSearching(false)
      setSearchFailed(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setSearching(true)
      setSearchFailed(false)
      searchLocations(query, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) setRemoteLocations(results)
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) return
          setRemoteLocations([])
          setSearchFailed(true)
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false)
        })
    }, 280)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [normalized, query])

  const locations = useMemo(() => {
    if (normalized.length < 2) return featuredLocations
    const featuredKeys = new Set(featuredLocations.map((location) => `${location.name.toLowerCase()}|${location.countryCode}`))
    const remote = remoteLocations.filter((location) => {
      if (region !== 'All' && location.region !== region) return false
      return !featuredKeys.has(`${location.name.toLowerCase()}|${location.countryCode}`)
    })
    return [...featuredLocations, ...remote]
  }, [featuredLocations, normalized.length, region, remoteLocations])

  return { locations, searching, searchFailed, isGlobalSearch: normalized.length >= 2 }
}
