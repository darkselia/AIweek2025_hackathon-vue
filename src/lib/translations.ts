// Общий словарь переводов классов повреждений и вспомогательные функции
export const damageClassRuMap: Record<string, string> = {
  'crazing': 'Трещины',
  'inclusion': 'Включения',
  'patches': 'Бляшки',
  'pitted_surface': 'Каверны',
  'rolled-in_scale': 'Окалины',
  'scratches': 'Царапины',
}

export function translateDamageLabel (label: string): string {
  const isDefect = /_defect$/i.test(label)
  const key = label.replace(/_defect$/i, '')
  const base = damageClassRuMap[key] ?? key
  return isDefect ? `${base} (дефект)` : base
}
