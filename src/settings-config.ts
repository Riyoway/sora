import type { LanguageSetting } from './i18n'

// Leaf module (no runtime imports) so both storage and the provider can depend on
// it without forming an import cycle.
export type TempUnit = 'c' | 'f'
export type WindUnit = 'kmh' | 'mph' | 'ms'

export interface Settings {
  language: LanguageSetting
  tempUnit: TempUnit
  windUnit: WindUnit
}

export const DEFAULT_SETTINGS: Settings = { language: 'auto', tempUnit: 'c', windUnit: 'kmh' }
