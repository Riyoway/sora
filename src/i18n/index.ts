import { en, type Messages } from './locales/en'
import { ja } from './locales/ja'

// Add a language: create a locale file and append one entry here. Nothing else
// hardcodes the language list — the settings screen and browser-language
// detection both read from LOCALES.
export const LOCALES = [
  { code: 'en', label: 'English', messages: en },
  { code: 'ja', label: '日本語', messages: ja },
] as const

export type LanguageCode = (typeof LOCALES)[number]['code']
export type LanguageSetting = 'auto' | LanguageCode
export type { Messages }

export const DEFAULT_LANGUAGE: LanguageCode = 'en'

function isSupported(code: string): code is LanguageCode {
  return LOCALES.some((locale) => locale.code === code)
}

/** Resolve 'auto' against the browser's preferred languages; otherwise the chosen code. */
export function resolveLanguage(setting: LanguageSetting): LanguageCode {
  if (setting !== 'auto') return setting
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0]
    if (isSupported(base)) return base
  }
  return DEFAULT_LANGUAGE
}

export function getMessages(code: LanguageCode): Messages {
  return LOCALES.find((locale) => locale.code === code)?.messages ?? en
}
