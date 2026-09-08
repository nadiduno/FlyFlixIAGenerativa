/**
 * Leitor de planilha nova.
 *
 * A dor mais cara medida no notebook nao e o modelo, e a fragmentacao: 163
 * colunas que eram uma duzia de perguntas, 91 delas respondidas por uma turma
 * so, 6 abas de backlog sem coluna de status e 312 alunas perdidas por isso.
 *
 * Aqui os cabecalhos de uma aba nova sao mapeados para os 15 conceitos da
 * Estacao 3. Nada e gravado: cada linha sai como proposta para revisao humana.
 */
import { normalizar } from './formato.js'

const CONCEITOS = [
  { conceito: 'escolaridade_txt', termos: ['escolaridade', 'grau de escolaridade', 'nivel de escolaridade'] },
  { conceito: 'internet_txt', termos: ['internet', 'wi-fi', 'wifi', 'acesso a internet'] },
  { conceito: 'computador_txt', termos: ['computador', 'dispositivo', 'notebook'] },
  { conceito: 'pessoas_casa_txt', termos: ['pessoas moram', 'quantas pessoas'] },
  { conceito: 'mae_cuidadora', termos: ['filhos', 'mae/cuidadora', 'cuidadora'] },
  { conceito: 'raca', termos: ['raca', 'etnia', 'como voce se identifica'] },
  { conceito: 'genero', termos: ['genero'] },
  { conceito: 'lgbt', termos: ['lgbtqia', 'lgbtqiapn', 'comunidade lgbt'] },
  { conceito: 'idade_txt', termos: ['idade'] },
  { conceito: 'nascimento', termos: ['data de nascimento', 'nascimento'] },
  { conceito: 'renda_faixa', termos: ['renda familiar', 'renda'] },
  { conceito: 'estado_txt', termos: ['estado que mora', 'estado/regiao', 'estado'] },
  { conceito: 'disponibilidade_txt', termos: ['disponibilidade', 'tempo para estudar', 'dedicar ao curso'] },
  { conceito: 'deficiencia', termos: ['deficiencia'] },
  { conceito: 'status_aprovacao', termos: ['status de aprovacao', 'status aluna', 'status'] },
]

const PESSOAL = ['whatsapp', 'telefone', 'celular', 'e-mail', 'email', 'cpf', 'rg', 'endereco', 'cep', 'bairro', 'rua', 'nome completo', 'linkedin', 'conte', 'relato', 'justifique', 'descreva']
const DESLIGAMENTO = ['desligamento', 'desligada', 'assinou']
const ENGAJAMENTO = ['conseguiu estudar', 'horas por semana', 'presenca', 'entregou', 'frequencia', 'acessou a plataforma', 'de fato']

export const CABECALHOS_EXEMPLO = [
  'Qual é o seu nível de escolaridade?',
  'Você possui acesso a Internet?',
  'Qual dispositivo você pretende usar para acompanhar o curso?',
  'Quantas pessoas moram na sua casa? (somente números)',
  'Você possui filhos ou exerce papel de mãe/cuidadora?',
  'Status Aluna no Curso',
  'Assinou desligamento',
  'Quantas horas por semana você conseguiu estudar de fato?',
  'Qual o seu WhatsApp?',
  'Em relação à raça, como você se identifica?',
].join('\n')

export function mapearCabecalhos(entrada) {
  const linhas = String(entrada || '')
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean)

  return linhas.map((cabecalho) => {
    const chave = normalizar(cabecalho)

    if (PESSOAL.some((termo) => chave.includes(normalizar(termo)))) {
      return { cabecalho, destino: 'Não entra', confianca: 'Alta', nota: 'Risco de dado pessoal, Estação 2.5.' }
    }
    if (DESLIGAMENTO.some((termo) => chave.includes(normalizar(termo)))) {
      return { cabecalho, destino: 'Sinal de desfecho', confianca: 'Alta', nota: 'Alimenta o detector de status, Estação 6.1.' }
    }

    let melhor = null
    let pontuacao = 0
    CONCEITOS.forEach((item) => {
      item.termos.forEach((termo) => {
        const alvo = normalizar(termo)
        if (chave.includes(alvo) && alvo.length > pontuacao) {
          melhor = item.conceito
          pontuacao = alvo.length
        }
      })
    })

    if (melhor === 'status_aprovacao') {
      return { cabecalho, destino: 'Alvo: status_aprovacao', confianca: pontuacao >= 12 ? 'Alta' : 'Média', nota: 'Coluna de desfecho, entra na Estação 6.' }
    }
    if (melhor) {
      return { cabecalho, destino: melhor, confianca: pontuacao >= 12 ? 'Alta' : 'Média', nota: 'Variante conhecida, entra no MAPA da Estação 3.' }
    }
    if (ENGAJAMENTO.some((termo) => chave.includes(normalizar(termo)))) {
      return { cabecalho, destino: 'Conceito novo: engajamento', confianca: 'Proposta', nota: 'Não existe no MAPA e é justamente a lacuna L5, vale criar.' }
    }
    return { cabecalho, destino: 'Não reconhecido', confianca: 'Baixa', nota: 'Vira pendência para revisão humana, não entra sozinha.' }
  })
}
