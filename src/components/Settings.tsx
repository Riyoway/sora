import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { LOCALES, type LanguageSetting } from '../i18n'
import { useI18n, type TempUnit, type WindUnit } from '../settings'

export function Settings() {
  const { t, settings, setSettings } = useI18n()

  // Language options are derived from the locale registry, so adding a locale
  // there makes it appear here automatically.
  const languageOptions: { value: LanguageSetting; label: string; hint?: string }[] = [
    { value: 'auto', label: t.settings.languageAuto, hint: t.settings.languageAutoHint },
    ...LOCALES.map((locale) => ({ value: locale.code, label: locale.label })),
  ]
  const tempOptions: { value: TempUnit; label: string }[] = [
    { value: 'c', label: t.settings.unit.celsius },
    { value: 'f', label: t.settings.unit.fahrenheit },
  ]
  const windOptions: { value: WindUnit; label: string }[] = [
    { value: 'kmh', label: t.settings.unit.kmh },
    { value: 'mph', label: t.settings.unit.mph },
    { value: 'ms', label: t.settings.unit.ms },
  ]

  return (
    <main className="settings-page">
      <div className="settings-hero">
        <span className="eyebrow">{t.settings.eyebrow}</span>
        <h1>{t.settings.title}</h1>
      </div>

      <section className="settings-group glass-panel">
        <h2>{t.settings.language}</h2>
        <div className="settings-options" role="radiogroup" aria-label={t.settings.language}>
          {languageOptions.map((option) => {
            const active = settings.language === option.value
            return (
              <button
                key={option.value}
                className={`settings-option ${active ? 'is-active' : ''}`}
                onClick={() => setSettings({ language: option.value })}
                role="radio"
                aria-checked={active}
              >
                <span>{option.label}{option.hint && <small>{option.hint}</small>}</span>
                {active && <motion.span className="settings-check" layoutId="settings-language-check"><Check size={15} /></motion.span>}
              </button>
            )
          })}
        </div>
      </section>

      <div className="settings-row">
        <section className="settings-group glass-panel">
          <h2>{t.settings.temperature}</h2>
          <div className="settings-segment" role="radiogroup" aria-label={t.settings.temperature}>
            {tempOptions.map((option) => (
              <button
                key={option.value}
                className={settings.tempUnit === option.value ? 'is-active' : ''}
                onClick={() => setSettings({ tempUnit: option.value })}
                role="radio"
                aria-checked={settings.tempUnit === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="settings-group glass-panel">
          <h2>{t.settings.windSpeed}</h2>
          <div className="settings-segment" role="radiogroup" aria-label={t.settings.windSpeed}>
            {windOptions.map((option) => (
              <button
                key={option.value}
                className={settings.windUnit === option.value ? 'is-active' : ''}
                onClick={() => setSettings({ windUnit: option.value })}
                role="radio"
                aria-checked={settings.windUnit === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
