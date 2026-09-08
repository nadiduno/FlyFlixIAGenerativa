import { analisar } from '../lib/guarda.js'
import s from './RelatorioGuarda.module.css'

/**
 * Mostra o resultado da guarda de linguagem.
 * A guarda aponta e explica a regra: ela nunca reescreve nem envia.
 */
export default function RelatorioGuarda({ texto }) {
  const { pedacos, achados, bloqueios } = analisar(texto || '')

  return (
    <section aria-label="Resultado da guarda de linguagem">
      <h4 className="rotulo" style={{ display: 'block', marginBottom: '9px' }}>
        Guarda de Linguagem
      </h4>

      <p className={s.texto}>
        {pedacos.map((pedaco, indice) =>
          pedaco.tipo === 'marca' ? (
            <mark key={indice} className={pedaco.gravidade === 'bloqueia' ? s.bloqueia : s.revisar}>
              {pedaco.conteudo}
            </mark>
          ) : (
            <span key={indice}>{pedaco.conteudo}</span>
          ),
        )}
      </p>

      {achados.length ? (
        <ul className={s.achados}>
          {achados.map(({ regra, exemplos }) => (
            <li key={regra.id}>
              <span className={`etiqueta ${regra.gravidade === 'bloqueia' ? 'etiquetaErro' : 'etiquetaAlerta'}`}>
                {regra.gravidade === 'bloqueia' ? 'Bloqueia' : 'Revisar'}
              </span>
              <span>
                <span className={s.trecho}>{exemplos.join(', ')}</span>
                <br />
                {regra.motivo}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={s.achados}>
          <li>
            <span className="etiqueta etiquetaPositiva">Passa</span>
            <span>Nenhuma regra acionada. O texto não cita risco, não nomeia atributo protegido, não presume barreira e não promete recurso.</span>
          </li>
        </ul>
      )}

      <p className={`veredito ${bloqueios ? 'veredictoErro' : 'veredictoOk'}`}>
        {bloqueios
          ? `${bloqueios} regra(s) de bloqueio acionada(s). Corrija antes de enviar.`
          : 'Liberado para revisão humana. Quem envia é a gestora: a ferramenta não envia nada.'}
      </p>
    </section>
  )
}
