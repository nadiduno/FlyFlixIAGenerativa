import { useId, useState } from 'react'
import { useApp } from '../contexto/AppContext.jsx'
import { CABECALHOS_EXEMPLO, mapearCabecalhos } from '../lib/harmonizador.js'

const TRECHO_EXPORTACAO = `# ---- Exporta a fila para o FlyFlix ----
# Rode depois da celula que cria a lista de prioridade e salva o .joblib
import json, datetime

perfil_te = universo.loc[X_te.index]
ordem = np.argsort(-prob_te)

def limpo(v, tipo=float):
    return None if pd.isna(v) else tipo(v)

export = {
    "gerado_em": str(datetime.date.today()),
    "campeao": campeao,
    "limiar": round(float(LIMIAR), 3),
    "universo": int(len(universo)),
    "evasoes": int(universo['evadiu'].sum()),
    "fila": [],
}
for k in ordem:
    r = perfil_te.iloc[int(k)]
    export["fila"].append({
        "aluna_id":       r["aluna_id"],
        "turma":          r["turma_aba"],
        "apontada":       "sim" if prob_te[k] >= LIMIAR else "nao",
        "idade":          limpo(r["idade"]),
        "escolaridade":   limpo(r["escolaridade"], int),
        "renda_ord":      limpo(r["renda_ord"], int),
        "pessoas_casa":   limpo(r["pessoas_casa"]),
        "tem_computador": limpo(r["tem_computador"], str),
        "regiao":         limpo(r["regiao"], str),
        # raca e lgbt NAO entram: Estacao 16 proibe como motivo de contato
    })

with open('dados/fila_flyflix.json', 'w', encoding='utf-8') as f:
    json.dump(export, f, ensure_ascii=False, indent=2)

print(f"{len(export['fila'])} alunas exportadas para dados/fila_flyflix.json")`

const FORMATO_ESPERADO = `{
  "gerado_em": "2026-09-08",
  "campeao": "Random Forest",
  "limiar": 0.491,
  "universo": 60,
  "evasoes": 39,
  "fila": [
    {
      "aluna_id": "Aluna 1331",
      "turma": "T12",
      "apontada": "sim",
      "idade": 34,
      "escolaridade": 4,
      "renda_ord": 0,
      "pessoas_casa": 4,
      "tem_computador": "Nao",
      "regiao": "NE"
    }
  ]
}`

export default function BaseConexao() {
  const { dados, carregarFila, voltarAoExemplo } = useApp()
  const [json, definirJson] = useState('')
  const [avisoFila, definirAvisoFila] = useState(null)
  const [endereco, definirEndereco] = useState('')
  const [avisoApi, definirAvisoApi] = useState(null)
  const [cabecalhos, definirCabecalhos] = useState(CABECALHOS_EXEMPLO)
  const idJson = useId()
  const idApi = useId()
  const idCabecalhos = useId()

  const propostas = mapearCabecalhos(cabecalhos)
  const novos = propostas.filter((item) => item.confianca === 'Proposta').length
  const pendentes = propostas.filter((item) => item.confianca === 'Baixa').length

  function carregar() {
    try {
      const objeto = JSON.parse(json)
      if (!objeto.fila || !objeto.fila.length) throw new Error('o arquivo não tem o campo "fila"')
      carregarFila(objeto)
      definirAvisoFila({ ok: true, texto: `Fila carregada com ${objeto.fila.length} fichas. O painel já está usando ela.` })
    } catch (erro) {
      definirAvisoFila({ ok: false, texto: `JSON inválido: ${erro.message}` })
    }
  }

  async function testarApi() {
    if (!endereco.trim()) {
      definirAvisoApi({ ok: false, texto: 'Informe o endereço da API.' })
      return
    }
    definirAvisoApi({ ok: true, texto: `Tentando ${endereco}/saude...` })
    try {
      const resposta = await fetch(`${endereco.replace(/\/$/, '')}/saude`)
      const corpo = await resposta.json()
      definirAvisoApi({ ok: true, texto: `Conectado. Modelo: ${corpo.campeao || 'desconhecido'}, limiar ${corpo.limiar ?? 'desconhecido'}.` })
    } catch (erro) {
      definirAvisoApi({
        ok: false,
        texto: `Não consegui falar com a API (${erro.message}). A tela continua funcionando inteira sobre o JSON colado acima: nenhuma função depende de rede.`,
      })
    }
  }

  return (
    <>
      <section className="cartao" aria-label="Carregar a fila">
        <header>
          <div>
            <span className="rotulo">Passo 1</span>
            <h3>Carregar a Fila da Estação 15</h3>
          </div>
          <p className="miudo dados" style={{ marginLeft: 'auto', margin: 0 }}>
            Fonte:{' '}
            <strong style={{ color: dados.fonte === 'exemplo' ? 'var(--alerta)' : 'var(--positivo)' }}>
              {dados.fonte === 'exemplo' ? 'Exemplo fictício' : `Arquivo carregado, ${dados.gerado_em}`}
            </strong>
          </p>
        </header>

        <div className="corpo">
          <p className="miudo">
            A Estação 15 já gravou <code>modelo_evasao_G4.joblib</code>, com cerca de 325 KB, a ficha técnica e a lista de prioridade. Rode o trecho de exportação abaixo, cole o JSON aqui e a fila fictícia é substituída pela real. A alternativa é subir a API e apontar o endereço no Passo 2.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <label className="rotuloCampo" htmlFor={idJson}>
                Colar o JSON da fila
              </label>
              <textarea id={idJson} className="area" rows="10" spellCheck="false" value={json} onChange={(evento) => definirJson(evento.target.value)} placeholder="Cole aqui o conteúdo de dados/fila_flyflix.json" />
              <div className="linhaBotoes">
                <button type="button" className="botao botaoPrimario" onClick={carregar}>
                  Carregar Fila
                </button>
                <button type="button" className="botao botaoSecundario" onClick={() => { voltarAoExemplo(); definirAvisoFila(null) }}>
                  Voltar ao Exemplo
                </button>
              </div>
              {avisoFila ? (
                <p className={`veredito ${avisoFila.ok ? 'veredictoOk' : 'veredictoErro'}`} role="status" aria-live="polite">
                  {avisoFila.texto}
                </p>
              ) : null}
            </div>

            <div>
              <span className="rotuloCampo">Formato esperado</span>
              <pre className="codigo">{FORMATO_ESPERADO}</pre>
              <p className="miudo discreto" style={{ marginTop: '12px' }}>
                <strong>Repare no que não está no contrato:</strong> <code>risco</code>, <code>raca</code> e <code>lgbt</code>. As três entram no modelo e nenhuma atravessa para a tela da gestora. A ordem da lista já carrega toda a informação de risco que o notebook autoriza usar.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '22px' }}>
            <span className="rotuloCampo">Cole isto no fim da Estação 15 do notebook</span>
            <pre className="codigo">{TRECHO_EXPORTACAO}</pre>
          </div>
        </div>
      </section>

      <section className="cartao" aria-label="Conexão com a API">
        <header>
          <div>
            <span className="rotulo">Passo 2</span>
            <h3>Ligar a API do Modelo</h3>
          </div>
        </header>
        <div className="corpo">
          <div className="linhaCampos">
            <div>
              <label className="rotuloCampo" htmlFor={idApi}>
                Endereço da API
              </label>
              <input id={idApi} className="campo" type="url" value={endereco} onChange={(evento) => definirEndereco(evento.target.value)} placeholder="https://sua-api.onrender.com" />
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <button type="button" className="botao botaoSecundario" onClick={testarApi}>
                Testar Conexão
              </button>
            </div>
          </div>
          {avisoApi ? (
            <p className={`veredito ${avisoApi.ok ? 'veredictoOk' : 'veredictoErro'}`} role="status" aria-live="polite">
              {avisoApi.texto}
            </p>
          ) : null}
          <p className="miudo discreto" style={{ marginTop: '14px' }}>
            O arquivo <code>api_passo_firme.py</code>, entregue junto, sobe o <code>.joblib</code> num FastAPI com <code>POST /prever</code> e <code>POST /fila</code>. As origens liberadas por CORS já incluem <code>http://localhost:3000</code>, <code>http://127.0.0.1</code> e <code>https://fly-flix-ia-generativa.vercel.app</code>. Sem API configurada, a tela funciona inteira sobre o JSON do Passo 1.
          </p>
        </div>
      </section>

      <section className="cartao" aria-label="Leitor de planilha nova">
        <header>
          <div>
            <span className="rotulo">Manutenção da Base</span>
            <h3>Leitor de Planilha Nova</h3>
          </div>
        </header>
        <div className="corpo">
          <p className="miudo discreto">
            Chegou turma nova com formulário diferente. Cole os cabeçalhos e a ferramenta propõe a qual dos 15 conceitos cada coluna pertence, acha coluna de status pelo vocabulário e separa dado pessoal. Foi assim que 163 colunas viraram 15 na Estação 3, e é o que evita repetir o trabalho na mão a cada semestre.
          </p>

          <label className="rotuloCampo" htmlFor={idCabecalhos}>
            Cabeçalhos, um por linha
          </label>
          <textarea id={idCabecalhos} className="area" rows="7" spellCheck="false" value={cabecalhos} onChange={(evento) => definirCabecalhos(evento.target.value)} />

          {propostas.length ? (
            <>
              <div className="rolagemTabela" style={{ marginTop: '20px' }}>
                <table className="tabelaDados">
                  <caption>Proposta de mapeamento, {propostas.length} cabeçalho(s). Nada foi gravado.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Cabeçalho</th>
                      <th scope="col">Destino Proposto</th>
                      <th scope="col">Confiança</th>
                      <th scope="col">Por Quê</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propostas.map((item, indice) => {
                      const naoEntra = item.destino === 'Não entra' || item.destino === 'Não reconhecido'
                      return (
                        <tr key={`${item.cabecalho}-${indice}`}>
                          <td>{item.cabecalho}</td>
                          <td className={naoEntra ? 'valorAusente' : 'valorDito'}>{item.destino}</td>
                          <td>{item.confianca}</td>
                          <td className="discreto">{item.nota}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="veredito veredictoOk">
                Nada foi gravado. {novos ? `${novos} conceito(s) novo(s) proposto(s) e ` : ''}
                {pendentes} pendência(s) para revisão humana. A confirmação de uma pessoa é o que vira linha no MAPA da Estação 3.
              </p>
            </>
          ) : null}
        </div>
      </section>
    </>
  )
}
