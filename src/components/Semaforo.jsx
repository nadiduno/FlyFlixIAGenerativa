import { FAIXAS } from '../lib/dados.js'
import s from './Semaforo.module.css'

/**
 * Semaforo de atencao.
 *
 * A cor nunca carrega a informacao sozinha: cada luz vem com o nome da faixa e a
 * contagem em texto, que e o exigido pelo criterio 1.4.1 da WCAG. A faixa e
 * posicao na fila definida pela capacidade da equipe, nao probabilidade.
 */
export default function Semaforo({ contagens }) {
  return (
    <div>
      <ul className={s.semaforo} aria-label="Semáforo de atenção da fila">
        <li className={s.titulo}>Semáforo de Atenção</li>
        {FAIXAS.map((faixa) => (
          <li
            key={faixa.chave}
            className={s.item}
            style={{ borderColor: faixa.cor, background: faixa.fundo, color: faixa.cor }}
          >
            <span className={s.luz} style={{ background: faixa.cor }} aria-hidden="true" />
            {faixa.nome}
            {contagens ? <span className={s.contagem}>{contagens[faixa.chave] ?? 0}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
