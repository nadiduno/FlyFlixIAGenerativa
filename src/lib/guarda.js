/**
 * Guarda de linguagem.
 *
 * Roda em todo texto antes de ele aparecer na tela, inclusive no que a propria
 * ferramenta gera. Aplica o campo `uso_proibido` da ficha tecnica (Estacao 15),
 * as tres regras da Estacao 16 e duas que saem da EDA: nao atribuir barreira que
 * o modelo nao mediu, e nao usar regiao como motivo.
 */

export const REGRAS = [
  {
    id: 'risco-numerico',
    expressao: /\b\d{1,3}\s?%|\bprobabilidade\b|\bscore\b|\bpontua[çc][ãa]o de risco\b/gi,
    gravidade: 'bloqueia',
    motivo:
      'Número de risco na mensagem. A ficha técnica proíbe informar risco individual à aluna, e a calibração é instável com este n (Estação 13.3).',
  },
  {
    id: 'vocabulario-modelo',
    expressao: /\bevas[ãa]o\b|\bevadir\b|\bevadiu\b|\bdesist[ea]\w*\b|\brisco\b/gi,
    gravidade: 'bloqueia',
    motivo:
      'Vocabulário do modelo. A mensagem informa à aluna que ela foi classificada, que é exatamente o uso proibido.',
  },
  {
    id: 'menciona-ferramenta',
    expressao: /\bmodelo\b|\balgoritmo\b|\bintelig[êe]ncia artificial\b|\bIA\b|\bprevis[ãa]o\b|\bsistema (?:previu|apontou)\b/g,
    gravidade: 'bloqueia',
    motivo: 'Menciona a ferramenta para a aluna. Quem fala é a gestora, não o sistema.',
  },
  {
    id: 'atributo-protegido',
    expressao: /\bpreta\b|\bparda\b|\bnegra\b|\bind[íi]gena\b|\bLGBT\w*\b|\btrans\b|\bdefici[êe]ncia\b/gi,
    gravidade: 'bloqueia',
    motivo:
      'Atributo protegido no texto. A Estação 16 proíbe raça, orientação ou deficiência como motivo de contato, mesmo estando dentro do modelo.',
  },
  {
    id: 'vigilancia',
    expressao: /\bvi que\b|\bnotei que\b|\bsei que voc[êe]\b|\bpercebi que voc[êe]\b|\baqui aparece\b/gi,
    gravidade: 'bloqueia',
    motivo:
      'Revela que existe um registro sobre a aluna. Cria vigilância percebida, e o notebook não sustenta nenhuma afirmação sobre o caso dela.',
  },
  {
    id: 'barreira-presumida',
    expressao: /se o acesso a computador|se o acesso à internet|se estiver sem computador|caso n[ãa]o tenha computador|como voc[êe] n[ãa]o tem/gi,
    gravidade: 'revisar',
    motivo:
      'Presume a barreira antes de perguntar. A variável tem_computador tem V de Cramér 0,180, força fraca com p indisponível: o modelo não sabe que esse é o problema dela.',
  },
  {
    id: 'promessa',
    expressao: /vamos te dar|garantimos|a gente consegue conseguir|prometo|empr[ée]stimo de equipamento/gi,
    gravidade: 'revisar',
    motivo: 'Promessa de recurso. Só entra se a Fly confirmar que o recurso existe para esta turma.',
  },
  {
    id: 'regiao-motivo',
    expressao: /\bda sua regi[ãa]o\b|\bpor voc[êe] ser do (?:norte|nordeste|sul)\b|\bregi[ãa]o onde voc[êe] mora\b/gi,
    gravidade: 'revisar',
    motivo:
      'Região como motivo. Turma × região dá V 0,552, praticamente igual à associação com a evasão: o efeito pode ser da turma (Estação 7.4).',
  },
]

/** Devolve os trechos marcados, sem sobreposicao, em ordem de posicao. */
export function encontrarOcorrencias(texto) {
  const achados = []
  REGRAS.forEach((regra) => {
    const flags = regra.expressao.flags.includes('g') ? regra.expressao.flags : `${regra.expressao.flags}g`
    const expressao = new RegExp(regra.expressao.source, flags)
    let encontro = expressao.exec(texto)
    while (encontro !== null) {
      if (encontro[0].length === 0) {
        expressao.lastIndex += 1
      } else {
        achados.push({
          inicio: encontro.index,
          fim: encontro.index + encontro[0].length,
          gravidade: regra.gravidade,
          regraId: regra.id,
          trecho: encontro[0],
        })
      }
      encontro = expressao.exec(texto)
    }
  })

  achados.sort((a, b) => a.inicio - b.inicio || b.fim - a.fim)

  const semSobreposicao = []
  let ultimoFim = -1
  achados.forEach((achado) => {
    if (achado.inicio >= ultimoFim) {
      semSobreposicao.push(achado)
      ultimoFim = achado.fim
    }
  })
  return semSobreposicao
}

/** Quebra o texto em pedacos marcados e nao marcados, pronto para renderizar. */
export function fatiar(texto, ocorrencias) {
  const pedacos = []
  let cursor = 0
  ocorrencias.forEach((ocorrencia) => {
    if (ocorrencia.inicio > cursor) {
      pedacos.push({ tipo: 'texto', conteudo: texto.slice(cursor, ocorrencia.inicio) })
    }
    pedacos.push({
      tipo: 'marca',
      gravidade: ocorrencia.gravidade,
      conteudo: texto.slice(ocorrencia.inicio, ocorrencia.fim),
    })
    cursor = ocorrencia.fim
  })
  if (cursor < texto.length) pedacos.push({ tipo: 'texto', conteudo: texto.slice(cursor) })
  return pedacos
}

/** Analise completa: pedacos para render, achados agrupados e contagem de bloqueios. */
export function analisar(texto) {
  const ocorrencias = encontrarOcorrencias(texto)
  const porRegra = new Map()
  ocorrencias.forEach((ocorrencia) => {
    const regra = REGRAS.find((r) => r.id === ocorrencia.regraId)
    if (!porRegra.has(ocorrencia.regraId)) porRegra.set(ocorrencia.regraId, { regra, exemplos: [] })
    const registro = porRegra.get(ocorrencia.regraId)
    if (registro.exemplos.length < 3 && !registro.exemplos.includes(ocorrencia.trecho)) {
      registro.exemplos.push(ocorrencia.trecho)
    }
  })
  const achados = Array.from(porRegra.values())
  return {
    pedacos: fatiar(texto, ocorrencias),
    achados,
    bloqueios: achados.filter((a) => a.regra.gravidade === 'bloqueia').length,
  }
}
