import type { GeocodingResult, LocationPoint, Region } from '../types/weather'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'

const EUROPE = new Set([
  'AL','AD','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','XK','LV','LI','LT','LU','MT','MD','MC','ME','NL','MK','NO','PL','PT','RO','RU','SM','RS','SK','SI','ES','SE','CH','TR','UA','GB','VA','FO','GI','GG','IM','JE','AX',
])
const NORTH_AMERICA = new Set([
  'AG','BS','BB','BZ','CA','CR','CU','DM','DO','SV','GD','GT','HT','HN','JM','MX','NI','PA','KN','LC','VC','TT','US','GL','BM','PR','VI','VG','KY','TC','AW','CW','BQ','SX','MF','PM','MS','GP','MQ',
])
const SOUTH_AMERICA = new Set(['AR','BO','BR','CL','CO','EC','GY','PY','PE','SR','UY','VE','FK','GF'])
const AFRICA = new Set([
  'DZ','AO','BJ','BW','BF','BI','CV','CM','CF','TD','KM','CG','CD','CI','DJ','EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SC','SL','SO','ZA','SS','SD','TZ','TG','TN','UG','ZM','ZW','RE','YT','SH','EH',
])
const OCEANIA = new Set([
  'AU','FJ','KI','MH','FM','NR','NZ','PW','PG','WS','SB','TO','TV','VU','NC','PF','GU','MP','AS','CK','NU','TK','WF','NF','CX','CC','PN',
])

export function regionFromCountryCode(countryCode = ''): Exclude<Region, 'All'> {
  const code = countryCode.toUpperCase()
  if (EUROPE.has(code)) return 'Europe'
  if (NORTH_AMERICA.has(code)) return 'North America'
  if (SOUTH_AMERICA.has(code)) return 'South America'
  if (AFRICA.has(code)) return 'Africa'
  if (OCEANIA.has(code)) return 'Oceania'
  return 'Asia'
}

export function locationFromGeocodingResult(result: GeocodingResult): LocationPoint {
  const countryCode = result.country_code?.toUpperCase() ?? 'XX'
  return {
    id: `geo-${result.id}`,
    name: result.name,
    country: result.country ?? 'Unknown country',
    countryCode,
    region: regionFromCountryCode(countryCode),
    latitude: result.latitude,
    longitude: result.longitude,
    admin1: result.admin1,
    timezone: result.timezone,
    source: 'search',
  }
}

export async function searchLocations(query: string, signal?: AbortSignal): Promise<LocationPoint[]> {
  const normalized = query.trim()
  if (normalized.length < 2) return []

  const params = new URLSearchParams({
    name: normalized,
    count: '10',
    language: 'en',
    format: 'json',
  })
  const response = await fetch(`${GEOCODING_ENDPOINT}?${params.toString()}`, { signal })
  if (!response.ok) throw new Error(`Location search returned ${response.status}`)

  const payload = (await response.json()) as { results?: GeocodingResult[] }
  const seen = new Set<string>()
  return (payload.results ?? [])
    .filter((result) => Number.isFinite(result.latitude) && Number.isFinite(result.longitude))
    .map(locationFromGeocodingResult)
    .filter((location) => {
      const key = `${location.name.toLowerCase()}|${location.countryCode}|${location.admin1 ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
