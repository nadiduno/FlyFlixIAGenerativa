/**
 * Roteiro de escuta e modelos de mensagem.
 *
 * O roteiro e IGUAL para toda a fila, e isso e o achado, nao uma limitacao de
 * engenharia: a campea e uma Random Forest, nao linear, sem coeficiente para ler
 * direcao (Estacao 13.2). O modelo nao fornece motivo por caso.
 *
 * Os textos de trilha oferecem o recurso A TODAS as alunas da turma, em vez de
 * supor que aquela aluna tem aquele problema.
 */

export const ROTEIRO = [
  ['Disponibilidade Real', 'Como está sendo encaixar as aulas na sua semana? Me conta como foi a última semana de verdade, não a semana ideal.'],
  ['Equipamento', 'Quando você senta para estudar, você usa o quê? E fica onde?'],
  ['Presença e Entrega', 'Teve alguma aula ou atividade que você não conseguiu fazer? O que aconteceu naquele dia?'],
  ['Rede de Apoio', 'Quem aí em casa sabe que você está fazendo o curso? Alguém te dá cobertura para estudar?'],
  ['Logística', 'Se desse para mudar uma coisa no curso para caber melhor na sua vida, qual seria?'],
  ['Aberta', 'Tem alguma coisa que a Fly poderia fazer que a gente ainda não perguntou?'],
]

export const TRILHAS = [
  { chave: 'abertura', nome: 'Abertura de Escuta, Sem Tema' },
  { chave: 'digital', nome: 'Acesso Digital' },
  { chave: 'cuidado', nome: 'Rede de Cuidado' },
  { chave: 'logistica', nome: 'Logística e Horário' },
  { chave: 'retorno', nome: 'Retomar Contato' },
]

export const CANAIS = [
  { chave: 'whatsapp', nome: 'WhatsApp' },
  { chave: 'email', nome: 'E-mail' },
]

export const MENSAGENS = {
  abertura: {
    whatsapp:
      'Oi, [nome], aqui é a [gestora] da Fly.\n\nEstou passando pelas turmas para conversar com quem entrou neste ciclo e entender como está sendo a rotina de estudo de cada uma.\n\nVocê teria uns 15 minutos nesta semana? Pode ser por áudio, se for mais fácil. Me diz dois horários que funcionam para você que eu me organizo.',
    email:
      'Assunto: 15 minutos de conversa sobre o curso\n\nOi, [nome], tudo bem?\n\nAqui é a [gestora] da Fly. Estou conversando com as alunas da turma [turma] para entender como está sendo encaixar o curso na rotina de cada uma, e o que a gente pode ajustar do nosso lado.\n\nVocê teria uns 15 minutos nesta semana? Me responda com dois horários que funcionam para você, ou me chame no WhatsApp se preferir.\n\nAbraço,\n[gestora]',
  },
  digital: {
    whatsapp:
      'Oi, [nome], aqui é a [gestora] da Fly.\n\nQueria te contar uma coisa que a gente oferece para todas as alunas da turma [turma] e nem sempre fica claro: temos uma lista de bibliotecas e espaços públicos com computador e wi-fi por região, e em algumas turmas conseguimos organizar equipamento emprestado.\n\nSe em algum momento isso te ajudar, me fala que eu te mando a lista da sua cidade. E me conta uma coisa: quando você senta para estudar, você usa o quê?',
    email:
      'Assunto: Lista de espaços com computador e wi-fi\n\nOi, [nome], tudo bem?\n\nAqui é a [gestora] da Fly. Estou mandando para todas as alunas da turma [turma] uma coisa que nem sempre fica clara: a gente mantém uma lista de bibliotecas e espaços públicos com computador e internet por região.\n\nSe isso te ajudar em algum momento, me responde que eu te mando a lista da sua cidade.\n\nE se puder me contar como você costuma acompanhar as aulas, que aparelho usa e onde, ajuda muito a gente a organizar o apoio.\n\nAbraço,\n[gestora]',
  },
  cuidado: {
    whatsapp:
      'Oi, [nome], aqui é a [gestora] da Fly.\n\nEstou mandando para as alunas da turma [turma] uma lista de serviços gratuitos que a gente reuniu: CRAS, CAPS e atendimento psicológico gratuito por região. É uma coisa que a gente oferece para todo mundo, não é sobre você especificamente.\n\nE queria te perguntar: quem aí em casa sabe que você está fazendo o curso? Alguém te dá cobertura para estudar? A gente consegue ajustar bastante coisa quando entende como é a sua semana de verdade.',
    email:
      'Assunto: Rede de apoio e serviços gratuitos por região\n\nOi, [nome], tudo bem?\n\nAqui é a [gestora] da Fly. Estou enviando para as alunas da turma [turma] uma lista que a gente reuniu de serviços gratuitos por região: CRAS, CAPS e atendimento psicológico sem custo. É material que oferecemos para toda a turma.\n\nAproveito para perguntar: como está sendo conciliar o curso com a sua rotina? Quem aí em casa sabe que você está estudando, e você tem alguém que te dê cobertura nesses horários?\n\nAbraço,\n[gestora]',
  },
  logistica: {
    whatsapp:
      'Oi, [nome], aqui é a [gestora] da Fly.\n\nA turma [turma] tem algumas opções que nem todo mundo sabe que existem: mentoria individual, aula de reforço em outro horário e, em alguns casos, remanejamento para turma com horário diferente.\n\nSe algum desses formatos encaixar melhor na sua semana, me fala qual e eu organizo. E me conta: se desse para mudar uma coisa no curso para caber melhor na sua vida, qual seria?',
    email:
      'Assunto: Horários alternativos, mentoria e reforço\n\nOi, [nome], tudo bem?\n\nAqui é a [gestora] da Fly. Queria lembrar as alunas da turma [turma] de algumas opções que existem e nem sempre ficam visíveis: mentoria individual, aula de reforço em outro horário e, em alguns casos, remanejamento para turma com horário diferente.\n\nSe algum desses formatos encaixar melhor na sua semana, me responde qual que eu organizo.\n\nE se puder me contar: se desse para mudar uma coisa no curso para caber melhor na sua vida, o que seria?\n\nAbraço,\n[gestora]',
  },
  retorno: {
    whatsapp:
      'Oi, [nome], aqui é a [gestora] da Fly.\n\nA gente combinou de se falar de novo, e aqui estou. Como foram estas últimas semanas?\n\nSe alguma coisa mudou na sua rotina, me conta que a gente reorganiza o que der.',
    email:
      'Assunto: Retomando nossa conversa\n\nOi, [nome], tudo bem?\n\nAqui é a [gestora] da Fly. A gente tinha combinado de se falar de novo, então estou passando para saber como foram estas últimas semanas.\n\nSe alguma coisa mudou na sua rotina de estudo, me conta que a gente reorganiza o que der do nosso lado.\n\nAbraço,\n[gestora]',
  },
}

export function montarMensagem(trilha, canal, aluna) {
  const base = MENSAGENS[trilha]?.[canal] || MENSAGENS.abertura.whatsapp
  return base.replace(/\[turma\]/g, aluna?.turma || '[turma]')
}

/** O que a gente nao sabe sobre a aluna, e por que nao sabe. */
export function lacunas(aluna) {
  const lista = []
  if (aluna.idade === null || aluna.idade === undefined) lista.push({ tipo: 'branco', texto: 'Idade em branco na inscrição.' })
  if (aluna.escolaridade === null || aluna.escolaridade === undefined) lista.push({ tipo: 'branco', texto: 'Escolaridade em branco na inscrição.' })
  if (aluna.pessoas_casa === null || aluna.pessoas_casa === undefined) lista.push({ tipo: 'branco', texto: 'Quantas pessoas moram na casa, em branco na inscrição.' })
  lista.push({ tipo: 'base', texto: 'Presença e entrega de atividade nas últimas duas semanas, não existe na base.' })
  lista.push({ tipo: 'base', texto: 'Horas reais de estudo por semana, hoje só existe a promessa feita na inscrição.' })
  lista.push({ tipo: 'pergunta', texto: 'Se exerce papel de mãe ou cuidadora, pergunta ausente no formulário desta turma.' })
  lista.push({ tipo: 'pergunta', texto: 'Disponibilidade real de horário, variável ficou fora do modelo com 45% de resposta.' })
  return lista
}
