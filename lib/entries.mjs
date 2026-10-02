/**
 * Токены группы DTCG без служебных ключей ($type, $description), в порядке шагов шкалы.
 * JSON.parse ставит ключи-числа («10») раньше «01» — числовую шкалу возвращаем в порядок шагов.
 */
export function tokenEntries(group) {
  const e = Object.entries(group).filter(([k]) => !k.startsWith('$'))
  return e.every(([k]) => /^\d+$/.test(k)) ? e.sort(([a], [b]) => Number(a) - Number(b)) : e
}
