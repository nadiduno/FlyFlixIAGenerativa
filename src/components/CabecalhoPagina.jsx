export default function CabecalhoPagina({ numero, total, nome, resumo }) {
  return (
    <div style={{ margin: '0 0 22px' }}>
      <span className="rotulo" style={{ display: 'block', marginBottom: '7px' }}>
        Página {numero} de {total}
      </span>
      <h2>{nome}</h2>
      <p style={{ margin: '8px 0 0', color: 'var(--texto-2)', maxWidth: '62ch' }}>{resumo}</p>
    </div>
  )
}
