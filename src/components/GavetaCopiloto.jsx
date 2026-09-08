import { useEffect, useId, useRef, useState } from 'react'
import { responder, SUGESTOES } from '../lib/copiloto.js'
import { useApp } from '../contexto/AppContext.jsx'
import s from './GavetaCopiloto.module.css'

const SAUDACAO = {
  autor: 'ferramenta',
  texto:
    'Oi. Eu respondo sobre a fila e sobre o que o modelo mede, sempre citando a estação do notebook. Quando a resposta não existe nos dados, eu digo que não existe em vez de inventar.',
  fonte: 'Copiloto interno, uso restrito à equipe da Fly',
}

export default function GavetaCopiloto({ aberta, aoFechar, aoPedirMensagem }) {
  const { fila, capacidade, selecionada } = useApp()
  const [conversa, definirConversa] = useState([SAUDACAO])
  const [pergunta, definirPergunta] = useState('')
  const campoRef = useRef(null)
  const fecharRef = useRef(null)
  const fimRef = useRef(null)
  const tituloId = useId()

  useEffect(() => {
    if (aberta) fecharRef.current?.focus()
  }, [aberta])

  useEffect(() => {
    function aoTeclar(evento) {
      if (evento.key === 'Escape' && aberta) aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberta, aoFechar])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: 'end' })
  }, [conversa])

  function enviar(texto) {
    const limpo = String(texto || '').trim()
    if (!limpo) return
    const resultado = responder(limpo, { fila, capacidade, selecionada })
    definirConversa((atual) => [
      ...atual,
      { autor: 'gestora', texto: limpo },
      { autor: 'ferramenta', texto: resultado.resposta, fonte: resultado.fonte, recusa: resultado.recusa },
    ])
    definirPergunta('')
    if (resultado.acao?.tipo === 'gerar-mensagem') aoPedirMensagem(resultado.acao)
    campoRef.current?.focus()
  }

  if (!aberta) return null

  return (
    <>
      <button type="button" className={s.fundo} aria-label="Fechar o copiloto" onClick={aoFechar} />
      <aside className={s.gaveta} role="dialog" aria-modal="true" aria-labelledby={tituloId}>
        <header className={s.topo}>
          <div>
            <span className="rotulo">Copiloto Interno</span>
            <h3 id={tituloId}>Pergunte Sobre a Fila e o Modelo</h3>
          </div>
          <button type="button" ref={fecharRef} className="botao botaoSobreMarca" onClick={aoFechar}>
            Fechar
          </button>
        </header>

        <div className={s.conversa} role="log" aria-live="polite" aria-label="Conversa com o copiloto">
          {conversa.map((mensagem, indice) => (
            <p
              key={indice}
              className={`${s.mensagem} ${mensagem.autor === 'gestora' ? s.daGestora : s.daFerramenta} ${mensagem.recusa ? s.recusa : ''}`}
            >
              {mensagem.texto}
              {mensagem.fonte ? <span className={s.fonte}>{mensagem.fonte}</span> : null}
            </p>
          ))}
          <div ref={fimRef} />
        </div>

        <div className={s.sugestoes}>
          {SUGESTOES.map((sugestao) => (
            <button key={sugestao} type="button" onClick={() => enviar(sugestao)}>
              {sugestao}
            </button>
          ))}
        </div>

        <form
          className={s.formulario}
          onSubmit={(evento) => {
            evento.preventDefault()
            enviar(pergunta)
          }}
        >
          <label className="pular-para-conteudo" htmlFor="campo-copiloto">
            Sua pergunta
          </label>
          <input
            id="campo-copiloto"
            ref={campoRef}
            className="campo"
            type="text"
            value={pergunta}
            onChange={(evento) => definirPergunta(evento.target.value)}
            placeholder="Ex.: quem eu procuro primeiro?"
            autoComplete="off"
          />
          <button type="submit" className="botao botaoPrimario">
            Enviar
          </button>
        </form>
      </aside>
    </>
  )
}
