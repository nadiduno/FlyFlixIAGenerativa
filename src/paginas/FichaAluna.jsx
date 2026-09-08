import { useId } from 'react'
import { useApp } from '../contexto/AppContext.jsx'
import { ESCOLARIDADE, FAIXAS, REGIAO, RENDA } from '../lib/dados.js'
import { ROTEIRO, lacunas } from '../lib/textos.js'
import Selo from '../components/Selo.jsx'
import s from './FichaAluna.module.css'

const MARCADORES = {
  branco: { texto: 'Em Branco', classe: 'etiquetaAlerta' },
  base: { texto: 'Não Existe na Base', classe: 'etiquetaErro' },
  pergunta: { texto: 'Pergunta Ausente', classe: 'etiqueta' },
}

function Valor({ conteudo }) {
  if (conteudo === null || conteudo === undefined || conteudo === '') {
    return <dd className={`${s.semResposta}`}>Sem resposta</dd>
  }
  return <dd>{conteudo}</dd>
}

export default function FichaAluna({ aoGerarMensagem, aoRegistrarConversa }) {
  const { fila, selecionada, definirSelecionada, contatos, alternarContato, faixaDe, registros } = useApp()
  const aluna = fila[selecionada]
  const idSelecao = useId()

  if (!aluna) {
    return (
      <section className="cartao">
        <div className="corpo">
          <p>Nenhuma ficha carregada. Volte ao Painel ou carregue a fila na página Base e Conexão.</p>
        </div>
      </section>
    )
  }

  const chave = faixaDe(selecionada)
  const faixa = FAIXAS.find((item) => item.chave === chave)
  const contato = contatos[aluna.aluna_id]
  const doHistorico = registros.filter((registro) => registro.aluna_id === aluna.aluna_id)

  return (
    <section className="cartao" aria-label={`Ficha de ${aluna.aluna_id}`}>
      <header>
        <div>
          <span className="rotulo">Ficha</span>
          <h3>
            {aluna.aluna_id}
            <span className={s.faixa} style={{ borderColor: faixa.cor, background: faixa.fundo, color: faixa.cor }}>
              <span className={s.luz} style={{ background: faixa.cor }} aria-hidden="true" />
              {faixa.nome}
            </span>
          </h3>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label className="pular-para-conteudo" htmlFor={idSelecao}>
            Escolher aluna
          </label>
          <select
            id={idSelecao}
            className="selecao"
            style={{ width: 'auto', minWidth: '200px' }}
            value={selecionada}
            onChange={(evento) => definirSelecionada(Number(evento.target.value))}
          >
            {fila.map((item, indice) => (
              <option key={item.aluna_id} value={indice}>
                {indice + 1}. {item.aluna_id} · {item.turma}
              </option>
            ))}
          </select>
          <button type="button" className="botao botaoPrimario" onClick={() => aoGerarMensagem(selecionada, 'abertura')}>
            Gerar Mensagem
          </button>
        </div>
      </header>

      <div className="corpo">
        <p className={s.resumo}>
          Posição {selecionada + 1} de {fila.length} · Turma {aluna.turma} ·{' '}
          {contato ? `Último contato em ${contato.data}` : 'Sem contato registrado'}
        </p>

        <dl className={s.grade}>
          <div>
            <dt>Idade</dt>
            <Valor conteudo={aluna.idade ? `${aluna.idade} anos` : null} />
          </div>
          <div>
            <dt>Escolaridade</dt>
            <Valor conteudo={ESCOLARIDADE[aluna.escolaridade] || null} />
          </div>
          <div>
            <dt>Renda por Pessoa</dt>
            <Valor conteudo={RENDA[aluna.renda_ord] || null} />
          </div>
          <div>
            <dt>Pessoas na Casa</dt>
            <Valor conteudo={aluna.pessoas_casa ?? null} />
          </div>
          <div>
            <dt>Computador Próprio</dt>
            <Valor conteudo={aluna.tem_computador || null} />
          </div>
          <div>
            <dt>Região (Contexto)</dt>
            <Valor conteudo={REGIAO[aluna.regiao] || null} />
          </div>
        </dl>

        <p className={s.oculto}>
          <strong>Dois campos do modelo não aparecem aqui, por decisão de projeto:</strong> raça e LGBT+. Eles entram no modelo, e a permutação da Estação 13.2 mostra que a campeã usa LGBT+ entre as quatro variáveis de maior peso. Exatamente por isso eles ficam fora da tela: a Estação 16 proíbe raça, orientação e deficiência como motivo de contato. Região aparece como contexto operacional, nunca como motivo, porque turma × região dá V 0,552 e o efeito pode ser da turma.
        </p>

        <h4 className={s.titulo}>O Que a Gente Não Sabe Sobre Ela</h4>
        <ul className="listaItens">
          {lacunas(aluna).map((item) => {
            const marcador = MARCADORES[item.tipo]
            return (
              <li key={item.texto}>
                <span className={`etiqueta marcador ${marcador.classe}`}>{marcador.texto}</span>
                <span>{item.texto}</span>
              </li>
            )
          })}
        </ul>

        <h4 className={s.titulo}>Roteiro de Escuta</h4>
        <p className={s.aviso}>
          O roteiro é igual para toda a fila, e isso é o achado, não uma limitação: o modelo não fornece motivo por caso. Cada pergunta levanta uma variável que a base não tem.
        </p>
        <ul className="listaItens">
          {ROTEIRO.map(([tema, pergunta]) => (
            <li key={tema}>
              <span className="etiqueta etiquetaPositiva marcador">{tema}</span>
              <span>{pergunta}</span>
            </li>
          ))}
        </ul>

        <div className="linhaBotoes">
          <button type="button" className="botao botaoPrimario" onClick={() => aoGerarMensagem(selecionada, 'abertura')}>
            Gerar Mensagem de Abertura
          </button>
          <button type="button" className="botao botaoSecundario" onClick={() => aoRegistrarConversa(selecionada)}>
            Registrar Conversa
          </button>
          <button type="button" className="botao botaoSecundario" onClick={() => alternarContato(aluna.aluna_id)}>
            {contato ? 'Desmarcar Contato' : 'Marcar Como Contatada'}
          </button>
        </div>

        {doHistorico.length ? (
          <>
            <h4 className={s.titulo}>Conversas Registradas</h4>
            <div className="rolagemTabela">
              <table className="tabelaDados">
                <thead>
                  <tr>
                    <th scope="col">Data</th>
                    {Object.keys(doHistorico[0])
                      .filter((coluna) => coluna !== 'data' && coluna !== 'aluna_id')
                      .map((coluna) => (
                        <th scope="col" key={coluna}>
                          {coluna}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {doHistorico.map((registro, indice) => (
                    <tr key={indice}>
                      <td>{registro.data}</td>
                      {Object.keys(registro)
                        .filter((coluna) => coluna !== 'data' && coluna !== 'aluna_id')
                        .map((coluna) => (
                          <td key={coluna} className={registro[coluna] ? 'valorDito' : 'valorAusente'}>
                            {registro[coluna] || '-'}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <Selo />
      </div>
    </section>
  )
}
