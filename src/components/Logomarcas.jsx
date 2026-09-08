import s from './Logomarcas.module.css'
import Semaforo from './Semaforo.jsx'

const MARCAS = [
  { nome: 'Fly Educação', arquivo: '/logos/fly.png' },
  { nome: 'Itaú', arquivo: '/logos/itau.png' },
  { nome: 'Alura', arquivo: '/logos/alura.png' },
]

/**
 * Rodape do painel: logomarcas no canto inferior esquerdo e, entre elas e o
 * botao da proxima pagina, o semaforo de atencao.
 */
export default function Logomarcas({ contagens }) {
  return (
    <section className={s.rodapeMarcas} aria-label="Realização e legenda da fila">
      <div>
        <span className={s.rotulo}>Realização</span>
        <ul className={s.marcas}>
          {MARCAS.map((marca) => (
            <li key={marca.nome}>
              <img src={marca.arquivo} alt={`Logomarca ${marca.nome}`} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
      <Semaforo contagens={contagens} />
    </section>
  )
}
