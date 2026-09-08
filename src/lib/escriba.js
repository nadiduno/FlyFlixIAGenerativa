/**
 * Escriba: transforma o registro em texto livre da gestora em campos
 * estruturados de engajamento.
 *
 * Existe por causa da limitacao L5 (Estacao 8): nao ha NENHUMA variavel de
 * engajamento na base, todas as 8 do modelo sao declaradas na inscricao, antes
 * de o curso comecar. Cada conversa registrada aqui vira uma linha da coluna
 * que hoje nao existe.
 *
 * Regra dura: campo que a aluna nao disse fica como pendencia. Nada e deduzido.
 */

/** Campos que alimentam a planilha de acompanhamento. */
export const CAMPOS = [
  {
    nome: 'acessos_plataforma_semana',
    engajamento: true,
    extrair: (t) => {
      const m = t.match(/(uma|duas|tr[eê]s|quatro|cinco|nenhuma|\d+)\s+vez(es)?/i)
      return m ? `${m[1]} vez(es)` : null
    },
  },
  {
    nome: 'horario_de_estudo',
    engajamento: true,
    extrair: (t) => {
      const m = t.match(/(depois das \d{1,2}h?|antes das \d{1,2}h?|de madrugada|de manh[aã]|[àa] noite|[àa] tarde)/i)
      return m ? m[0] : null
    },
  },
  {
    nome: 'equipamento_proprio',
    extrair: (t) => {
      const soCelular = /(s[oó]|apenas|tudo)\s*(pelo|no|pelo meu)?\s*(celular|smartphone|tablet)/i.test(t) || /faz tudo pelo celular/i.test(t)
      const compartilhado = /(do irm[aã]o|da m[aã]e|do marido|emprestad|compartilh|leva pro trabalho|leva para o trabalho)/i.test(t)
      if (soCelular && compartilhado) return 'Não, usa celular; notebook compartilhado'
      if (soCelular) return 'Não, usa celular'
      if (/(tenho|possuo|meu)\s+(notebook|computador)/i.test(t)) return 'Sim'
      return compartilhado ? 'Compartilhado' : null
    },
  },
  {
    nome: 'entregou_atividade',
    engajamento: true,
    extrair: (t) => {
      const negou = /n[aã]o entregou|nao entregou|n[aã]o consegui entregar|deixou de entregar|nao consegui fazer/i.test(t)
      const semana = t.match(/semana\s*(\d+)/i)
      if (negou) return `Não${semana ? `, semana ${semana[1]}` : ''}`
      if (/entregou|entreguei/i.test(t)) return `Sim${semana ? `, semana ${semana[1]}` : ''}`
      return null
    },
  },
  {
    nome: 'rede_de_apoio',
    extrair: (t) => {
      const parcial = /(ter[cç]as|quintas|segundas|quartas|sextas|fins? de semana|alguns dias|[àa]s vezes)/i.test(t)
      const sozinha = /(fica sozinha|sem ajuda|ningu[eé]m ajuda|sozinha)/i.test(t)
      const temAjuda = /(ajuda|apoia|cuida|d[aá] cobertura)/i.test(t)
      if (temAjuda && (parcial || sozinha)) return 'Parcial, só em alguns dias'
      if (sozinha) return 'Sem apoio relatado'
      if (temAjuda) return 'Tem apoio'
      return null
    },
  },
  {
    nome: 'horas_reais_semana',
    engajamento: true,
    extrair: (t) => {
      const m = t.match(/(\d+)\s*horas?\s*(por|na)\s*semana/i)
      return m ? `${m[1]} h/semana` : null
    },
  },
  {
    nome: 'quer_novo_contato',
    extrair: (t) => {
      const m = t.match(/daqui\s+a?\s*(\d+)\s*(dias?|semanas?)/i)
      if (m) return `Sim, em ${m[1]} ${m[2]}`
      return /(chamar de novo|falar de novo|voltar a falar|me procura)/i.test(t) ? 'Sim' : null
    },
  },
  {
    nome: 'barreira_relatada',
    extrair: (t) => {
      const barreiras = []
      if (/(celular|sem computador|notebook.*(irm|m[aã]e|marido|trabalho))/i.test(t)) barreiras.push('equipamento')
      if (/(filha|filho|cuidar|creche|m[aã]e ajuda)/i.test(t)) barreiras.push('cuidado')
      if (/(depois das \d|madrugada|trabalho|hor[aá]rio|turno)/i.test(t)) barreiras.push('horário')
      if (/(internet|wi-?fi|dados m[oó]veis|sinal)/i.test(t)) barreiras.push('conexão')
      return barreiras.length ? barreiras.join(', ') : null
    },
  },
  {
    nome: 'intencao_de_saida',
    extrair: (t) => (/(vou sair|desisti|trancar|parar o curso)/i.test(t) ? 'Mencionou intenção de sair, priorizar' : null),
  },
]

export const REGISTRO_EXEMPLO =
  'Conversei com ela hoje por áudio. Disse que na última semana só conseguiu abrir a plataforma duas vezes, sempre depois das 22h. Faz tudo pelo celular, o notebook é do irmão e ele leva pro trabalho. Não entregou a atividade da semana 3. Falou que a mãe ajuda com a filha nas terças e quintas, nos outros dias fica sozinha. Pediu pra gente chamar de novo daqui 15 dias.'

export function extrairCampos(texto) {
  return CAMPOS.map((campo) => {
    let valor = null
    try {
      valor = campo.extrair(texto || '')
    } catch (erro) {
      valor = null
    }
    return { nome: campo.nome, valor, engajamento: Boolean(campo.engajamento) }
  })
}
