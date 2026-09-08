import { useEffect, useId, useMemo, useState } from 'react'
import { useApp } from '../contexto/AppContext.jsx'
import { CAMPOS, REGISTRO_EXEMPLO, extrairCampos } from '../lib/escriba.js'
import { dataHoje } from '../lib/formato.js'

function baixarCsv(registros) {
  const colunas = ['data', 'aluna_id', ...CAMPOS.map((campo) => campo.nome)]
  const linhas = registros.map((registro) => colunas.map((coluna) => `"${String(registro[coluna] || '').replace(/"/g, '""')}"`).join(';'))
  const csv = `${colunas.join(';')}\n${linhas.join('\n')}`
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const ancora = document.createElement('a')
  ancora.href = url
  ancora.download = 'registros_flyflix.csv'
  document.body.appendChild(ancora)
  ancora.click()
  document.body.removeChild(ancora)
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export default function RegistroConversa({ pedido, aoConsumirPedido }) {
  const { fila, selecionada, definirSelecionada, registros, salvarRegistro } = useApp()
  const [texto, definirTexto] = useState(REGISTRO_EXEMPLO)
  const [aviso, definirAviso] = useState('')
  const idAluna = useId()
  const idTexto = useId()

  useEffect(() => {
    if (pedido === null || pedido === undefined) return
    definirSelecionada(pedido)
    aoConsumirPedido()
  }, [pedido, definirSelecionada, aoConsumirPedido])

  const campos = useMemo(() => extrairCampos(texto), [texto])
  const ditos = campos.filter((campo) => campo.valor).length
  const deEngajamento = campos.filter((campo) => campo.valor && campo.engajamento).length
  const aluna = fila[selecionada]

  function salvar() {
    if (!aluna) return
    const registro = { data: dataHoje(), aluna_id: aluna.aluna_id }
    campos.forEach((campo) => {
      registro[campo.nome] = campo.valor || ''
    })
    salvarRegistro(registro)
    definirAviso('Conversa salva no histórico deste navegador.')
    window.setTimeout(() => definirAviso(''), 4000)
  }

  return (
    <>
      <section className="cartao" aria-label="Registro da conversa">
        <header>
          <div>
            <span className="rotulo">Depois da Conversa</span>
            <h3>O Que a Conversa Ensinou Que a Base Não Sabia</h3>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <label className="pular-para-conteudo" htmlFor={idAluna}>
              Aluna do registro
            </label>
            <select id={idAluna} className="selecao" style={{ width: 'auto', minWidth: '200px' }} value={selecionada} onChange={(evento) => definirSelecionada(Number(evento.target.value))}>
              {fila.map((item, indice) => (
                <option key={item.aluna_id} value={indice}>
                  {indice + 1}. {item.aluna_id} · {item.turma}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="corpo">
          <p className="miudo discreto">
            A limitação L5 diz que não existe nenhuma variável de engajamento nesta base: as 8 do modelo são declaradas na inscrição, antes de o curso começar. Cada conversa registrada aqui vira uma linha da coluna que hoje não existe. Em três turmas isso muda o que o próximo modelo consegue enxergar.
          </p>

          <label className="rotuloCampo" htmlFor={idTexto}>
            Registro em texto livre, do jeito que você escreve
          </label>
          <textarea id={idTexto} className="area" rows="7" value={texto} onChange={(evento) => definirTexto(evento.target.value)} />

          <div className="linhaBotoes">
            <button type="button" className="botao botaoPrimario" onClick={salvar}>
              Salvar no Histórico
            </button>
            <button type="button" className="botao botaoSecundario" onClick={() => definirTexto('')}>
              Limpar
            </button>
            <button type="button" className="botao botaoSecundario" onClick={() => definirTexto(REGISTRO_EXEMPLO)}>
              Carregar Exemplo
            </button>
            <span role="status" aria-live="polite" className="miudo" style={{ color: 'var(--positivo)' }}>
              {aviso}
            </span>
          </div>

          <h4 className="rotulo" style={{ display: 'block', margin: '24px 0 10px' }}>
            Linha Estruturada Para a Planilha de Acompanhamento
          </h4>
          <div className="rolagemTabela">
            <table className="tabelaDados">
              <thead>
                <tr>
                  <th scope="col">Campo</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Procedência</th>
                </tr>
              </thead>
              <tbody>
                {campos.map((campo) => (
                  <tr key={campo.nome}>
                    <td>{campo.nome}</td>
                    <td className={campo.valor ? 'valorDito' : 'valorAusente'}>{campo.valor || 'Não mencionado'}</td>
                    <td className={campo.valor ? 'valorDito' : 'valorAusente'}>{campo.valor ? 'Dito pela aluna' : 'Perguntar no próximo contato'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={`veredito ${ditos >= 4 ? 'veredictoOk' : 'veredictoErro'}`}>
            {ditos} de {campos.length} campos preenchidos por fala da aluna. Nenhum campo foi deduzido.
            {deEngajamento ? ` ${deEngajamento} deles são de engajamento, que é a variável que a limitação L5 aponta como ausente na base.` : ''}
          </p>
        </div>
      </section>

      <section className="cartao" aria-label="Histórico de conversas">
        <header>
          <div>
            <span className="rotulo">Histórico</span>
            <h3>Conversas Registradas</h3>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button type="button" className="botao botaoSecundario" onClick={() => baixarCsv(registros)} disabled={!registros.length}>
              Exportar CSV
            </button>
          </div>
        </header>
        <div className="corpo">
          {registros.length ? (
            <div className="rolagemTabela">
              <table className="tabelaDados">
                <thead>
                  <tr>
                    <th scope="col">Data</th>
                    <th scope="col">Aluna</th>
                    {CAMPOS.map((campo) => (
                      <th scope="col" key={campo.nome}>
                        {campo.nome}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((registro, indice) => (
                    <tr key={`${registro.aluna_id}-${indice}`}>
                      <td>{registro.data}</td>
                      <td>{registro.aluna_id}</td>
                      {CAMPOS.map((campo) => (
                        <td key={campo.nome} className={registro[campo.nome] ? 'valorDito' : 'valorAusente'}>
                          {registro[campo.nome] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="discreto">Nenhuma conversa registrada ainda. O histórico fica salvo apenas neste navegador.</p>
          )}
        </div>
      </section>
    </>
  )
}
