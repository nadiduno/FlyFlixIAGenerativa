import { useId, useMemo, useState } from 'react'
import { useApp } from '../contexto/AppContext.jsx'
import { FAIXAS } from '../lib/dados.js'
import { numeroBR, percentualBR } from '../lib/formato.js'
import Logomarcas from '../components/Logomarcas.jsx'
import s from './Painel.module.css'

/** Encaminhamentos possiveis, nunca o motivo pelo qual a aluna esta na fila. */
function trilhasDe(aluna) {
  const disponiveis = []
  const semDado = []
  if (aluna.tem_computador === 'Não') disponiveis.push('Acesso digital: sem equipamento próprio')
  else semDado.push('acesso digital')
  semDado.push('rede de cuidado', 'logística')
  return { disponiveis, semDado }
}

export default function Painel({ aoAbrirFicha }) {
  const { fila, dados, capacidade, definirCapacidade, contatos, selecionada, definirSelecionada, faixaDe } = useApp()
  const [turma, definirTurma] = useState('')
  const [busca, definirBusca] = useState('')
  const idCapacidade = useId()
  const idTurma = useId()
  const idBusca = useId()

  const turmas = useMemo(() => Array.from(new Set(fila.map((aluna) => aluna.turma))), [fila])

  const visiveis = useMemo(
    () =>
      fila
        .map((aluna, indice) => ({ aluna, indice }))
        .filter(({ aluna }) => (turma ? aluna.turma === turma : true))
        .filter(({ aluna }) => (busca ? aluna.aluna_id.toLowerCase().includes(busca.toLowerCase().trim()) : true)),
    [fila, turma, busca],
  )

  const contagens = useMemo(() => {
    const total = { maior: 0, media: 0, menor: 0 }
    fila.forEach((_, indice) => {
      total[faixaDe(indice)] += 1
    })
    return total
  }, [fila, faixaDe])

  const taxa = dados.universo ? dados.evasoes / dados.universo : 0

  const indicadores = [
    { rotulo: 'Alunas Acompanhadas', valor: numeroBR(fila.length), detalhe: dados.fonte === 'exemplo' ? 'Fichas fictícias de exemplo.' : `Fila carregada em ${dados.gerado_em}.` },
    { rotulo: 'Evasão no Histórico', valor: percentualBR(taxa, 0), detalhe: `${dados.evasoes} evasões em ${dados.universo} alunas com desfecho conhecido, Estação 6.2.` },
    { rotulo: 'Atenção Maior', valor: numeroBR(Math.min(capacidade, fila.length)), detalhe: 'Definido pela capacidade da semana, não pelo modelo.' },
    { rotulo: 'Já Contatadas', valor: numeroBR(Object.keys(contatos).length), detalhe: 'Registro salvo neste navegador.' },
  ]

  function abrir(indice) {
    definirSelecionada(indice)
    aoAbrirFicha()
  }

  return (
    <>
      <section className="cartao" aria-label="Resumo e capacidade">
        <div className="corpo semPadding">
          <dl className={s.indicadores}>
            {indicadores.map((indicador) => (
              <div className={s.indicador} key={indicador.rotulo}>
                <dt>{indicador.rotulo}</dt>
                <dd>
                  <span className={s.valor}>{indicador.valor}</span>
                  <span className={s.detalhe}>{indicador.detalhe}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className={s.capacidade}>
            <label className="rotulo" htmlFor={idCapacidade}>
              Capacidade da Semana
            </label>
            <input
              id={idCapacidade}
              type="range"
              min="1"
              max={Math.max(3, fila.length)}
              value={capacidade}
              onChange={(evento) => definirCapacidade(Number(evento.target.value))}
              aria-describedby={`${idCapacidade}-ajuda`}
            />
            <output className={s.numero} htmlFor={idCapacidade}>
              {capacidade}
            </output>
            <p className={s.explicacao} id={`${idCapacidade}-ajuda`}>
              Quantas alunas a equipe consegue procurar. É este número, e não o algoritmo, que define o corte da fila. A Estação 12 mostra a conta de cada opção: alcançar mais gente custa mais conversas.
            </p>
          </div>
        </div>
      </section>

      <section className="cartao" aria-label="Fila de prioridade">
        <header>
          <div>
            <span className="rotulo">Fila de Prioridade</span>
            <h3>Por Quem Começar</h3>
          </div>
          <div className={s.filtros}>
            <label className="pular-para-conteudo" htmlFor={idTurma}>
              Filtrar por turma
            </label>
            <select id={idTurma} className="selecao" value={turma} onChange={(evento) => definirTurma(evento.target.value)}>
              <option value="">Todas as Turmas</option>
              {turmas.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
            <label className="pular-para-conteudo" htmlFor={idBusca}>
              Buscar identificador
            </label>
            <input
              id={idBusca}
              className="campo"
              type="search"
              value={busca}
              onChange={(evento) => definirBusca(evento.target.value)}
              placeholder="Buscar Identificador"
            />
          </div>
        </header>

        <div className="corpo semPadding">
          <div className={s.rolagem}>
            <table className={s.tabela}>
              <caption>Ordenada pelo modelo. A faixa de atenção vem da capacidade da semana.</caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Identificador</th>
                  <th scope="col">Turma</th>
                  <th scope="col">Atenção</th>
                  <th scope="col">Trilhas de Apoio Possíveis</th>
                  <th scope="col">Contato</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map(({ aluna, indice }) => {
                  const chave = faixaDe(indice)
                  const faixa = FAIXAS.find((item) => item.chave === chave)
                  const contato = contatos[aluna.aluna_id]
                  const { disponiveis, semDado } = trilhasDe(aluna)
                  return (
                    <tr key={aluna.aluna_id} className={indice === selecionada ? s.selecionada : undefined}>
                      <td className={s.posicao}>{indice + 1}</td>
                      <td>
                        <button type="button" className={s.identificador} onClick={() => abrir(indice)}>
                          {aluna.aluna_id}
                          <span className="pular-para-conteudo"> Abrir ficha</span>
                        </button>
                      </td>
                      <td className={s.posicao}>{aluna.turma}</td>
                      <td>
                        <span className={s.faixa} style={{ borderColor: faixa.cor, background: faixa.fundo, color: faixa.cor }}>
                          <span className={s.luz} style={{ background: faixa.cor }} aria-hidden="true" />
                          {faixa.nome}
                        </span>
                      </td>
                      <td>
                        <div className={s.trilhas}>
                          {disponiveis.map((texto) => (
                            <span className="etiqueta" key={texto}>
                              {texto}
                            </span>
                          ))}
                          <span className="etiqueta etiquetaTracejada">{semDado.join(', ')}: sem dado</span>
                        </div>
                      </td>
                      <td className={`${s.contato} ${contato ? s.contatoFeito : ''}`}>{contato ? contato.data : 'Sem contato'}</td>
                    </tr>
                  )
                })}
                {!visiveis.length ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--texto-3)' }}>
                      Nenhuma ficha com esse filtro.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <p className={s.nota}>
            A faixa de atenção é posição na fila, não probabilidade. O risco calculado pelo modelo nunca aparece nesta tela nem em nenhuma mensagem, porque a curva de calibração é instável com este n, conforme a Estação 13.3. As trilhas são <strong>encaminhamentos possíveis</strong> a oferecer depois da escuta, nunca o motivo pelo qual a aluna está na fila: a permutação da Estação 13.2 aponta escolaridade, idade, região e LGBT+, e nenhum desses pode virar assunto de conversa.
          </p>
        </div>
      </section>

      <Logomarcas contagens={contagens} />
    </>
  )
}
