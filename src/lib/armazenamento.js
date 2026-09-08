import { useCallback, useEffect, useState } from 'react'

const PREFIXO = 'flyflix.'

function ler(chave, padrao) {
  try {
    const bruto = window.localStorage.getItem(PREFIXO + chave)
    return bruto ? JSON.parse(bruto) : padrao
  } catch (erro) {
    return padrao
  }
}

function gravar(chave, valor) {
  try {
    if (valor === null) window.localStorage.removeItem(PREFIXO + chave)
    else window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor))
  } catch (erro) {
    /* modo privado, cota cheia ou site data bloqueado: seguimos sem persistir */
  }
}

/**
 * Estado que sobrevive ao recarregar a pagina, no navegador de quem usa.
 * Nada sai deste navegador: nao ha servidor por tras.
 */
export function useArmazenamento(chave, padrao) {
  const [valor, definir] = useState(() => ler(chave, padrao))

  useEffect(() => {
    gravar(chave, valor)
  }, [chave, valor])

  const limpar = useCallback(() => {
    gravar(chave, null)
    definir(padrao)
  }, [chave, padrao])

  return [valor, definir, limpar]
}
