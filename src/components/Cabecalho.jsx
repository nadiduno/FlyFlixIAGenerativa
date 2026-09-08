import { PAGINAS, MODELO } from '../lib/dados.js'
import { useApp } from '../contexto/AppContext.jsx'
import { numeroBR, percentualBR } from '../lib/formato.js'
import s from './Cabecalho.module.css'

export default function Cabecalho({ paginaAtual, aoTrocarPagina, tema, aoAlternarTema, aoAbrirCopiloto }) {
  const { fila, capacidade, contatos, dados } = useApp()
  const taxa = dados.universo ? dados.evasoes / dados.universo : 0

  const metricas = [
    { rotulo: 'Acompanhadas', valor: numeroBR(fila.length) },
    { rotulo: 'Evasão Histórica', valor: percentualBR(taxa, 0) },
    { rotulo: 'Atenção Maior', valor: numeroBR(Math.min(capacidade, fila.length)) },
    { rotulo: 'Contatos Feitos', valor: numeroBR(Object.keys(contatos).length) },
  ]

  return (
    <header className={s.cabecalho}>
      <div className={s.topo}>
        <div className={s.marca}>
          <h1>FlyFlix</h1>
          <p className={s.assinatura}>Identificar o risco antes de o problema chegar</p>
        </div>

        <ul className={s.metricas} aria-label="Resumo da fila">
          {metricas.map((metrica) => (
            <li key={metrica.rotulo}>
              <div>
                {metrica.rotulo}
                <b>{metrica.valor}</b>
              </div>
            </li>
          ))}
        </ul>

        <div className={s.acoes}>
          <p className={s.veredito}>
            Estação 14: <b>p = {MODELO.pValor.toLocaleString('pt-BR', { minimumFractionDigits: 4 })}</b>. O modelo tira nota melhor do que o acaso conseguiria.
          </p>
          <button
            type="button"
            className="botao botaoSobreMarca"
            onClick={aoAlternarTema}
            aria-label={tema === 'escuro' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
          >
            {tema === 'escuro' ? 'Tema Claro' : 'Tema Escuro'}
          </button>
          <button type="button" className="botao botaoSobreMarca" onClick={aoAbrirCopiloto} aria-haspopup="dialog">
            Copiloto
          </button>
        </div>
      </div>

      <nav className={s.navegacao} aria-label="Páginas da ferramenta">
        {PAGINAS.map((pagina) => (
          <button
            key={pagina.id}
            type="button"
            className={`${s.aba} ${paginaAtual === pagina.id ? s.abaAtiva : ''}`}
            aria-current={paginaAtual === pagina.id ? 'page' : undefined}
            onClick={() => aoTrocarPagina(pagina.id)}
          >
            {pagina.nome}
          </button>
        ))}
      </nav>

      <div className={s.aviso} role="note">
        <p>
          <strong>Protótipo acadêmico.</strong> Ferramenta de TCC do Grupo Ada Lovelace, Turma Fly em parceria com a Alura, o Itaú e a DiversiData. Não serve para decisão sobre pessoas reais. As fichas carregadas agora são fictícias. A ordem vira real quando o arquivo da Estação 15 é carregado na página Base e Conexão.
        </p>
      </div>
    </header>
  )
}
