import { MODELO } from '../lib/dados.js'

const FICHA = [
  ['Projeto', 'Evasão Fly, Grupo Ada Lovelace (G4), Turma Fly diversiData'],
  ['Pergunta', 'Prever risco de evasão a partir do formulário de inscrição'],
  ['Universo', '60 alunas, 39 evasões, taxa de 65,0%'],
  ['Treino e teste', '45 e 15 alunas'],
  ['Campeão', 'Random Forest, escolhida por código pela maior AP média'],
  ['Hiperparâmetros', 'max_depth 3, min_samples_leaf 3, max_features sqrt, 300 árvores'],
  ['Métrica principal', 'Average precision (AUC-PR)'],
  ['AP na validação cruzada', '0,975, contra piso teórico do acaso de 0,644'],
  ['AP do acaso, medida', 'Média 0,753 e percentil 95 de 0,861, em 40 embaralhamentos com a busca em grade refeita inteira'],
  ['Limiar operacional', '0,491, o maior que ainda entrega 80% de recall no treino'],
  ['Teste', 'AP 0,971, recall 0,900, precisão 0,818, F1 0,857, acurácia 0,800'],
  ['Calibração', 'Brier 0,125 contra 0,222 de quem repete a média'],
  ['p-valor empírico', '0,0244. O modelo tira nota melhor do que o acaso conseguiria: existe sinal real, ainda que fraco'],
]

const VARIAVEIS = [
  ['No modelo', 'idade, escolaridade, renda_ord, pessoas_casa, raca, tem_computador, regiao, lgbt', 'neutro'],
  ['Visíveis na tela', 'idade, escolaridade, renda, pessoas_casa, tem_computador, regiao', 'dito'],
  ['Nunca exibidas', 'raca, lgbt', 'ausente'],
  ['Fora do modelo', 'disponibilidade_h com 45% no universo; tem_internet, deficiencia e genero sem variação; mae_cuidadora com 0% no universo; turma_aba confundida com período', 'neutro'],
]

const USO = [
  ['Permitido', 'Ordenar a fila de prioridade para acolhimento.', 'etiquetaPositiva'],
  ['Proibido', 'Informar risco individual à aluna.', 'etiquetaErro'],
  ['Proibido', 'Decidir desligamento, bolsa ou seleção.', 'etiquetaErro'],
  ['Proibido', 'Conclusão sobre grupo com menos de 10 alunas.', 'etiquetaErro'],
]

const LIMITACOES = [
  ['L1 Tamanho', '60 alunas e 39 evasões. No teste de 15, uma aluna a mais ou a menos mexe o recall em 10 pontos.', 'etiquetaAlerta'],
  ['L2 Alvo', '100% do universo vem de uma fonte só, cuja definição de evasão inclui possível registro faltante. A taxa medida é um teto.', 'etiquetaAlerta'],
  ['L3 Confundimento', '55% do universo vem de um bloco só de turmas. Turma, período e fonte do desfecho estão grudados.', 'etiquetaAlerta'],
  ['L4 Cobertura', '21% das chaves dos backlogs casam com a base. Quem não casa pode ser sistematicamente diferente.', 'etiquetaAlerta'],
  ['L5 Variáveis', 'Nenhuma variável de engajamento durante o curso. É a limitação decisiva, e é a que a página Registro da Conversa começa a resolver.', 'etiquetaErro'],
  ['L6 Autodeclarado', 'As respostas são promessas feitas na inscrição, não medidas do que aconteceu depois.', 'etiquetaAlerta'],
  ['L7 Escala', 'A disponibilidade junta perguntas por dia e por semana, então carrega um pouco de "qual formulário a aluna respondeu".', 'etiquetaAlerta'],
]

export default function FichaTecnica() {
  return (
    <section className="cartao" aria-label="Ficha técnica do modelo">
      <header>
        <div>
          <span className="rotulo">Model Card</span>
          <h3>O Que Este Modelo É, e o Que Ele Não É</h3>
        </div>
      </header>

      <div className="corpo">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '26px' }}>
          <div>
            <h4 style={{ marginBottom: '12px' }}>Ficha</h4>
            <div className="rolagemTabela">
              <table className="tabelaDados">
                <tbody>
                  {FICHA.map(([rotulo, valor]) => (
                    <tr key={rotulo}>
                      <th scope="row" style={{ paddingRight: '16px', textTransform: 'none', letterSpacing: 0, fontSize: '.78rem', borderBottom: '1px solid var(--borda)', verticalAlign: 'top', paddingBottom: '10px' }}>
                        {rotulo}
                      </th>
                      <td>{valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '12px' }}>Variáveis</h4>
            <div className="rolagemTabela">
              <table className="tabelaDados">
                <tbody>
                  {VARIAVEIS.map(([rotulo, valor, estado]) => (
                    <tr key={rotulo}>
                      <th scope="row" style={{ paddingRight: '16px', textTransform: 'none', letterSpacing: 0, fontSize: '.78rem', borderBottom: '1px solid var(--borda)', verticalAlign: 'top', paddingBottom: '10px' }}>
                        {rotulo}
                      </th>
                      <td className={estado === 'dito' ? 'valorDito' : estado === 'ausente' ? 'valorAusente' : undefined}>{valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 style={{ margin: '24px 0 12px' }}>Uso</h4>
            <ul className="listaItens">
              {USO.map(([rotulo, texto, classe], indice) => (
                <li key={`${rotulo}-${indice}`}>
                  <span className={`etiqueta marcador ${classe}`}>{rotulo}</span>
                  <span>{texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h4 style={{ margin: '28px 0 12px' }}>Limitações Medidas</h4>
        <ul className="listaItens">
          {LIMITACOES.map(([rotulo, texto, classe]) => (
            <li key={rotulo}>
              <span className={`etiqueta marcador ${classe}`}>{rotulo}</span>
              <span>{texto}</span>
            </li>
          ))}
        </ul>

        <p className="veredito veredictoOk" style={{ marginTop: '24px' }}>
          Ressalva para a banca: o ganho medido sobre o acaso é de cerca de {(MODELO.apReal - MODELO.apAcasoP95).toFixed(2).replace('.', ',')} acima do percentil 95, e não os 0,33 sobre o piso teórico de 0,644. A régua certa é o acaso medido na Estação 14, não o piso.
        </p>
      </div>
    </section>
  )
}
