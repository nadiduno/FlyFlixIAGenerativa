import { useCallback, useEffect, useState } from 'react'
import { PAGINAS } from './lib/dados.js'
import { ProvedorApp } from './contexto/AppContext.jsx'
import Cabecalho from './components/Cabecalho.jsx'
import CabecalhoPagina from './components/CabecalhoPagina.jsx'
import Paginacao from './components/Paginacao.jsx'
import GavetaCopiloto from './components/GavetaCopiloto.jsx'
import Painel from './paginas/Painel.jsx'
import FichaAluna from './paginas/FichaAluna.jsx'
import Mensagens from './paginas/Mensagens.jsx'
import RegistroConversa from './paginas/RegistroConversa.jsx'
import BaseConexao from './paginas/BaseConexao.jsx'
import FichaTecnica from './paginas/FichaTecnica.jsx'

function temaInicial() {
  try {
    const salvo = window.localStorage.getItem('flyflix.tema')
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch (erro) {
    /* segue com a preferencia do sistema */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

function Conteudo() {
  const [pagina, definirPagina] = useState('painel')
  const [copilotoAberto, definirCopilotoAberto] = useState(false)
  const [tema, definirTema] = useState(temaInicial)
  const [pedidoMensagem, definirPedidoMensagem] = useState(null)
  const [pedidoRegistro, definirPedidoRegistro] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
    try {
      window.localStorage.setItem('flyflix.tema', tema)
    } catch (erro) {
      /* sem persistencia, o tema vale so nesta sessao */
    }
  }, [tema])

  const irPara = useCallback((destino) => {
    definirPagina(destino)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const pedirMensagem = useCallback(
    (indice, trilha) => {
      definirPedidoMensagem({ indice, trilha })
      definirCopilotoAberto(false)
      irPara('mensagens')
    },
    [irPara],
  )

  const pedirRegistro = useCallback(
    (indice) => {
      definirPedidoRegistro(indice)
      irPara('registro')
    },
    [irPara],
  )

  const indice = PAGINAS.findIndex((item) => item.id === pagina)
  const atual = PAGINAS[indice]

  return (
    <>
      <a className="pular-para-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <Cabecalho
        paginaAtual={pagina}
        aoTrocarPagina={irPara}
        tema={tema}
        aoAlternarTema={() => definirTema((atualTema) => (atualTema === 'escuro' ? 'claro' : 'escuro'))}
        aoAbrirCopiloto={() => definirCopilotoAberto(true)}
      />

      <main id="conteudo" className="envoltorio" style={{ paddingTop: '26px' }}>
        <CabecalhoPagina numero={indice + 1} total={PAGINAS.length} nome={atual.nome} resumo={atual.resumo} />

        {pagina === 'painel' ? <Painel aoAbrirFicha={() => irPara('ficha')} /> : null}
        {pagina === 'ficha' ? <FichaAluna aoGerarMensagem={pedirMensagem} aoRegistrarConversa={pedirRegistro} /> : null}
        {pagina === 'mensagens' ? <Mensagens pedido={pedidoMensagem} aoConsumirPedido={() => definirPedidoMensagem(null)} /> : null}
        {pagina === 'registro' ? <RegistroConversa pedido={pedidoRegistro} aoConsumirPedido={() => definirPedidoRegistro(null)} /> : null}
        {pagina === 'base' ? <BaseConexao /> : null}
        {pagina === 'tecnica' ? <FichaTecnica /> : null}

        <Paginacao paginaAtual={pagina} aoTrocarPagina={irPara} />
      </main>

      <footer className="envoltorio" style={{ paddingBottom: '48px', color: 'var(--texto-3)', fontSize: '.82rem', lineHeight: 1.65 }}>
        <p>
          Cada Falso Negativo é uma mulher que a gente poderia ter acolhido antes. O modelo existe para chegar antes da evasão, nunca para rotular ninguém.
        </p>
        <p>
          Números citados nesta ferramenta vêm do notebook TCC_EvasaoFly_G4_V15, com a estação indicada em cada afirmação. Nada foi estimado.
        </p>
      </footer>

      <GavetaCopiloto
        aberta={copilotoAberto}
        aoFechar={() => definirCopilotoAberto(false)}
        aoPedirMensagem={(acao) => pedirMensagem(acao.indice, acao.trilha)}
      />
    </>
  )
}

export default function App() {
  return (
    <ProvedorApp>
      <Conteudo />
    </ProvedorApp>
  )
}
