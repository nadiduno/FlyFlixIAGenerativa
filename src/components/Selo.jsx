import { SELO } from '../lib/dados.js'

/** Selo de procedencia: acompanha todo texto que a ferramenta gera. */
export default function Selo() {
  return (
    <div className="selo">
      {SELO.map(([titulo, texto]) => (
        <div key={titulo}>
          <strong>{titulo}:</strong> {texto}
        </div>
      ))}
    </div>
  )
}
