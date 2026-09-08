import { useEffect, useId, useRef, useState } from 'react'
import { useApp } from '../contexto/AppContext.jsx'
import { CANAIS, TRILHAS, montarMensagem } from '../lib/textos.js'
import RelatorioGuarda from '../components/RelatorioGuarda.jsx'
import Selo from '../components/Selo.jsx'

export default function Mensagens({ pedido, aoConsumirPedido }) {
  const { fila, selecionada, definirSelecionada, marcarContato } = useApp()
  const [trilha, definirTrilha] = useState('abertura')
  const [canal, definirCanal] = useState('whatsapp')
  const [rascunho, definirRascunho] = useState('')
  const [aviso, definirAviso] = useState('')
  const areaRef = useRef(null)
  const idAluna = useId()
  const idTrilha = useId()
  const idCanal = useId()
  const idRascunho = useId()

  const aluna = fila[selecionada]

  // Um pedido vindo do copiloto ou da ficha ja chega com aluna e trilha.
  useEffect(() => {
    if (!pedido) return
    if (typeof pedido.indice === 'number') definirSelecionada(pedido.indice)
    if (pedido.trilha) definirTrilha(pedido.trilha)
    aoConsumirPedido()
  }, [pedido, definirSelecionada, aoConsumirPedido])

  useEffect(() => {
    if (aluna) definirRascunho(montarMensagem(trilha, canal, aluna))
  }, [trilha, canal, aluna])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(rascunho)
      definirAviso('Rascunho copiado.')
    } catch (erro) {
      areaRef.current?.select()
      definirAviso('Não consegui copiar sozinha. O texto está selecionado, use Ctrl+C ou Cmd+C.')
    }
    window.setTimeout(() => definirAviso(''), 4000)
  }

  if (!aluna) {
    return (
      <section className="cartao">
        <div className="corpo">
          <p>Nenhuma ficha carregada. Carregue a fila na página Base e Conexão.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="cartao" aria-label="Gerador de rascunhos">
      <header>
        <div>
          <span className="rotulo">Gerador de Rascunhos</span>
          <h3>A Gestora Revisa e Envia. A Ferramenta Nunca Envia.</h3>
        </div>
      </header>

      <div className="corpo">
        <div className="linhaCampos">
          <div>
            <label className="rotuloCampo" htmlFor={idAluna}>
              Aluna
            </label>
            <select id={idAluna} className="selecao" value={selecionada} onChange={(evento) => definirSelecionada(Number(evento.target.value))}>
              {fila.map((item, indice) => (
                <option key={item.aluna_id} value={indice}>
                  {indice + 1}. {item.aluna_id} · {item.turma}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="rotuloCampo" htmlFor={idTrilha}>
              Trilha
            </label>
            <select id={idTrilha} className="selecao" value={trilha} onChange={(evento) => definirTrilha(evento.target.value)}>
              {TRILHAS.map((item) => (
                <option key={item.chave} value={item.chave}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="rotuloCampo" htmlFor={idCanal}>
              Canal
            </label>
            <select id={idCanal} className="selecao" value={canal} onChange={(evento) => definirCanal(evento.target.value)}>
              {CANAIS.map((item) => (
                <option key={item.chave} value={item.chave}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="miudo discreto" style={{ marginTop: '14px' }}>
          Os textos de trilha oferecem o recurso <strong>a todas as alunas da turma</strong>, em vez de supor que aquela aluna tem aquele problema. Essa é a diferença entre encaminhamento e diagnóstico: o modelo não sabe qual é a barreira dela, e supor errado quebra a confiança logo na primeira mensagem.
        </p>

        <div style={{ marginTop: '20px' }}>
          <label className="rotuloCampo" htmlFor={idRascunho}>
            Rascunho para {aluna.aluna_id}, editável
          </label>
          <textarea
            id={idRascunho}
            ref={areaRef}
            className="area"
            rows="11"
            value={rascunho}
            onChange={(evento) => definirRascunho(evento.target.value)}
            style={{ fontFamily: 'var(--fonte)', fontSize: '.98rem', lineHeight: 1.68 }}
          />
        </div>

        <div className="linhaBotoes">
          <button type="button" className="botao botaoPrimario" onClick={copiar}>
            Copiar Rascunho
          </button>
          <button type="button" className="botao botaoSecundario" onClick={() => definirRascunho(montarMensagem(trilha, canal, aluna))}>
            Restaurar Modelo
          </button>
          <button type="button" className="botao botaoSecundario" onClick={() => { marcarContato(aluna.aluna_id); definirAviso('Contato registrado.') }}>
            Marcar Como Contatada
          </button>
          <span role="status" aria-live="polite" className="miudo" style={{ color: 'var(--positivo)' }}>
            {aviso}
          </span>
        </div>

        <div style={{ marginTop: '22px' }}>
          <RelatorioGuarda texto={rascunho} />
        </div>

        <Selo />
      </div>
    </section>
  )
}
