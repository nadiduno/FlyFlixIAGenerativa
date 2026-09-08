/** Utilitarios de formatacao em pt-BR. */

export function numeroBR(valor, casas = 0) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '-'
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

export function percentualBR(fracao, casas = 0) {
  if (fracao === null || fracao === undefined) return '-'
  return `${(fracao * 100).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`
}

export function dataHoje() {
  return new Date().toLocaleDateString('pt-BR')
}

/** Remove acentos e caixa, para comparar texto digitado. */
export function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}
