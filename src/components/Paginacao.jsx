import { PAGINAS } from '../lib/dados.js'
import s from './Paginacao.module.css'

export default function Paginacao({ paginaAtual, aoTrocarPagina }) {
  const indice = PAGINAS.findIndex((pagina) => pagina.id === paginaAtual)
  const anterior = indice > 0 ? PAGINAS[indice - 1] : null
  const proxima = indice < PAGINAS.length - 1 ? PAGINAS[indice + 1] : null

  return (
    <nav className={s.paginacao} aria-label="Navegação entre páginas">
      {anterior ? (
        <button type="button" className={s.botao} onClick={() => aoTrocarPagina(anterior.id)}>
          <span className={s.direcao}>Página anterior</span>
          <span className={s.destino}>{anterior.nome}</span>
        </button>
      ) : (
        <span className={s.vazio} aria-hidden="true" />
      )}

      {proxima ? (
        <button type="button" className={`${s.botao} ${s.proxima}`} onClick={() => aoTrocarPagina(proxima.id)}>
          <span className={s.direcao}>Próxima página</span>
          <span className={s.destino}>{proxima.nome}</span>
        </button>
      ) : (
        <span className={s.vazio} aria-hidden="true" />
      )}
    </nav>
  )
}
