// Converte o valor de um <input type="datetime-local"> (hora local, sem timezone)
// para um ISO string em UTC, pronto para a API.
export function toUtcIso(localValue) {
  if (!localValue) return null
  return new Date(localValue).toISOString()
}

// Converte um ISO string em UTC (vindo da API) para o formato que
// <input type="datetime-local"> espera ("YYYY-MM-DDTHH:mm"), já na hora local.
export function toDatetimeLocalValue(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localTime.toISOString().slice(0, 16)
}
