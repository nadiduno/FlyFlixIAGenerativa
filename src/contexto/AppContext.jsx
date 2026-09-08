import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { FILA_EXEMPLO } from '../lib/dados.js'
import { useArmazenamento } from '../lib/armazenamento.js'
import { dataHoje } from '../lib/formato.js'

const Contexto = createContext(null)

export function ProvedorApp({ children }) {
  const [dados, definirDados, limparDados] = useArmazenamento('fila', FILA_EXEMPLO)
  const [capacidade, definirCapacidade] = useArmazenamento('capacidade', 5)
  const [contatos, definirContatos] = useArmazenamento('contatos', {})
  const [registros, definirRegistros] = useArmazenamento('registros', [])
  const [selecionada, definirSelecionada] = useState(0)
  const [pedidoMensagem, definirPedidoMensagem] = useState(null)

  const fila = dados?.fila || []

  const faixaDe = useCallback(
    (indice) => {
      if (indice < capacidade) return 'maior'
      if (indice < capacidade * 2) return 'media'
      return 'menor'
    },
    [capacidade],
  )

  const alternarContato = useCallback(
    (alunaId) => {
      definirContatos((atual) => {
        const proximo = { ...atual }
        if (proximo[alunaId]) delete proximo[alunaId]
        else proximo[alunaId] = { data: dataHoje() }
        return proximo
      })
    },
    [definirContatos],
  )

  const marcarContato = useCallback(
    (alunaId) => {
      definirContatos((atual) => ({ ...atual, [alunaId]: { data: dataHoje() } }))
    },
    [definirContatos],
  )

  const salvarRegistro = useCallback(
    (registro) => {
      definirRegistros((atual) => [registro, ...atual])
      marcarContato(registro.aluna_id)
    },
    [definirRegistros, marcarContato],
  )

  const carregarFila = useCallback(
    (json) => {
      const novo = {
        ...json,
        fonte: 'arquivo',
        universo: json.universo || FILA_EXEMPLO.universo,
        evasoes: json.evasoes || FILA_EXEMPLO.evasoes,
        gerado_em: json.gerado_em || dataHoje(),
      }
      definirDados(novo)
      definirSelecionada(0)
    },
    [definirDados],
  )

  const voltarAoExemplo = useCallback(() => {
    limparDados()
    definirSelecionada(0)
  }, [limparDados])

  const valor = useMemo(
    () => ({
      dados,
      fila,
      capacidade,
      definirCapacidade,
      contatos,
      alternarContato,
      marcarContato,
      registros,
      salvarRegistro,
      selecionada,
      definirSelecionada,
      faixaDe,
      carregarFila,
      voltarAoExemplo,
      pedidoMensagem,
      definirPedidoMensagem,
    }),
    [dados, fila, capacidade, definirCapacidade, contatos, alternarContato, marcarContato, registros, salvarRegistro, selecionada, faixaDe, carregarFila, voltarAoExemplo, pedidoMensagem],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useApp() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useApp precisa estar dentro de <ProvedorApp>')
  return contexto
}
