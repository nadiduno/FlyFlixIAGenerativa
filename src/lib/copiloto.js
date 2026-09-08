/**
 * Copiloto interno.
 *
 * Responde citando estacao e numero do notebook, e responde "nao da para afirmar
 * com este n" quando e esse o caso, que e a maioria das vezes. E o antidoto
 * contra a ferramenta virar oraculo.
 *
 * Nao ha chamada de rede: a base de respostas e o proprio notebook.
 */
import { normalizar } from './formato.js'

const PERGUNTAS = [
  {
    chaves: ['risco alto', 'dizer o risco', 'falar o risco', 'risco para a aluna', 'contar o risco', 'porcentagem'],
    recusa: true,
    fonte: 'Estações 13.3 e 15',
    resposta:
      'Não pode. A ficha técnica lista "informar risco individual à aluna" como uso proibido, e a Estação 13.3 mostra por quê: a curva de calibração tem poucas alunas por faixa e é instável. O modelo ordena a fila melhor que o acaso (Brier 0,125 contra 0,222), mas o número que ele devolve não é confiável como probabilidade dita a uma pessoa.',
  },
  {
    chaves: ['desligamento', 'bolsa', 'cortar', 'desligar', 'selecao'],
    recusa: true,
    fonte: 'Estação 15',
    resposta:
      'Não. A ficha técnica lista "decidir desligamento, bolsa ou seleção" como uso proibido. Um modelo que ordena risco, se usado para cortar, vira máquina de exclusão justamente com as alunas que ele mais aponta.',
  },
  {
    chaves: ['computador', 'equipamento', 'falta de computador'],
    fonte: 'Estação 7.3',
    resposta:
      'Não dá para afirmar com este n. A variável tem_computador tem V de Cramér 0,180, na faixa "fraca", e o p-valor está indisponível porque alguma casela esperava menos de 5 alunas. No universo, só 5 alunas responderam "Não". A hipótese H1 continua plausível pela literatura, mas não foi confirmada por estes dados.',
  },
  {
    chaves: ['mae', 'cuidadora', 'filhos', 'cuidado aumenta'],
    fonte: 'Estações 4, 9 e 16',
    resposta:
      'A hipótese não pôde ser testada. A variável mae_cuidadora tem 12% de resposta na base inteira e 0% dentro do universo de 60 alunas, porque a pergunta só existiu em parte dos formulários. É a variável que a literatura mais aponta e a menos preenchida da base. Virou o pedido número 4 à Fly.',
  },
  {
    chaves: ['regiao', 'norte', 'nordeste', 'onde mora'],
    fonte: 'Estações 7.3 e 7.4',
    resposta:
      'Cuidado com essa leitura. Região aparece com V de Cramér 0,554 com a evasão, mas turma × região dá 0,552, praticamente o mesmo. Turma, período e fonte do desfecho estão grudados, que é a limitação L3, então o que parece efeito de região pode ser efeito de turma. Não interpretar como causa e não usar como motivo de contato.',
  },
  {
    chaves: ['modelo e bom', 'confiavel', 'funciona', 'acuracia', 'metricas', 'validado'],
    fonte: 'Estações 13 e 14',
    resposta:
      'Ele ordena, e agora isso está testado. A Estação 14 embaralhou o alvo 40 vezes refazendo a busca em grade inteira: o acaso tira AP 0,753 em média e 0,861 no percentil 95, enquanto o modelo real tira 0,9746. O p empírico é 0,0244, então existe sinal real, ainda que fraco.\n\nDuas ressalvas para não exagerar na banca. Primeira: o ganho verdadeiro sobre o acaso é de cerca de 0,12 acima do percentil 95, não os 0,33 sobre o piso teórico de 0,644. Segunda: o teste final tem 15 alunas, das quais 10 evadiram, e uma aluna a mais ou a menos mexe o recall em 10 pontos.',
  },
  {
    chaves: ['limiar', 'quantas alunas', 'capacidade', 'quantas conversas'],
    fonte: 'Estação 12',
    resposta:
      'Isso é decisão da Fly, não do algoritmo. O limiar 0,491 foi escolhido como o maior que ainda entrega 80% de recall no treino. Com ele, no teste de 15 alunas o modelo apontou 11, das quais 9 tinham evadido, 2 não iam sair e 1 evasão passou batida. O controle de capacidade no Painel é onde você move esse corte.',
  },
  {
    chaves: ['o que pedir', 'muda tudo', 'coletar', 'dado que falta', 'engajamento'],
    fonte: 'Estações 8 e 16',
    resposta:
      'Coletar presença e entrega de atividade por semana e por aluna. A limitação L5 diz que não existe nenhuma variável de engajamento nesta base: as 8 do modelo são declaradas na inscrição, antes de o curso começar, e a evasão acontece durante. Em segundo lugar, usar a mesma chave aluna_id nos dois arquivos: hoje só 21% cruzam, e corrigir isso multiplica o universo sem coletar nada novo.',
  },
  {
    chaves: ['por que a aluna', 'por que ela', 'motivo dela', 'fatores dela', 'o que pesa'],
    fonte: 'Estações 13.2 e 16',
    resposta:
      'Essa pergunta não tem resposta neste modelo, e é importante que não tenha. A campeã é uma Random Forest, que não é linear e não tem coeficiente para ler direção. A permutação da Estação 13.2 mostra que ela usa escolaridade, idade, região e LGBT+, e as duas últimas não podem virar assunto de conversa: região está confundida com turma e LGBT+ é atributo protegido. Por isso a ferramenta entrega roteiro de escuta em vez de diagnóstico.',
  },
]

export const SUGESTOES = [
  'Quem eu procuro primeiro?',
  'Quais alunas precisam de rede de cuidado esta semana?',
  'Gere uma mensagem para Aluna 0142 focada em acesso digital',
  'Posso dizer o risco para a aluna?',
  'O modelo é bom?',
  'O que a Fly precisa coletar?',
]

/**
 * Interpreta a pergunta e devolve { resposta, fonte, recusa?, acao? }.
 * `acao` avisa a interface para abrir o gerador de mensagens ja preenchido.
 */
export function responder(pergunta, contexto) {
  const { fila = [], capacidade = 5, selecionada = 0 } = contexto || {}
  const texto = normalizar(pergunta).replace(/[?!.,]/g, '')

  // 1. gerar mensagem para uma aluna
  if (/(gere|gerar|escrev|monta|faz)/.test(texto) && /(mensagem|rascunho|texto)/.test(texto)) {
    let alvo = fila.findIndex((aluna) => texto.includes(normalizar(aluna.aluna_id)))
    if (alvo < 0) {
      const numero = pergunta.match(/aluna\s*(\d+)/i)
      if (numero) alvo = fila.findIndex((aluna) => aluna.aluna_id.includes(numero[1]))
    }
    if (alvo < 0) alvo = selecionada

    let trilha = 'abertura'
    if (/digital|computador|internet|equipamento/.test(texto)) trilha = 'digital'
    else if (/cuidado|apoio|psicol|familia/.test(texto)) trilha = 'cuidado'
    else if (/logistic|horario|reforco|mentoria/.test(texto)) trilha = 'logistica'
    else if (/retom|de novo|retorno/.test(texto)) trilha = 'retorno'

    return {
      acao: { tipo: 'gerar-mensagem', indice: alvo, trilha },
      fonte: 'Gerador de rascunhos',
      resposta: `Abri o gerador com ${fila[alvo]?.aluna_id || 'a aluna selecionada'} na trilha de ${trilha}. O rascunho já passou pela guarda de linguagem e está editável na página Mensagens. Lembre que o texto oferece o recurso para toda a turma, e não afirma que ela tem aquele problema: o modelo não sabe qual é a barreira dela.`,
    }
  }

  // 2. listar alunas por trilha
  if (/(quais|quem|lista|listar)/.test(texto) && /(cuidado|digital|computador|logistic|horario|apoio)/.test(texto)) {
    if (/digital|computador|internet|equipamento/.test(texto)) {
      const dentro = fila.slice(0, capacidade * 2).filter((aluna) => aluna.tem_computador === 'Não')
      if (!dentro.length) {
        return {
          fonte: 'Fila carregada',
          resposta:
            'Nenhuma das alunas dentro do corte atual declarou não ter computador. Vale lembrar que essa resposta vem da inscrição e pode ter mudado: a pergunta sobre equipamento está no roteiro de escuta justamente por isso.',
        }
      }
      return {
        fonte: 'Estação 7.3 e fila carregada',
        resposta: `Dentro do corte atual, declararam não ter computador na inscrição: ${dentro.map((a) => a.aluna_id).join(', ')}. Isso é encaminhamento possível, não motivo: com V de Cramér 0,180 e p indisponível, o modelo não sustenta que a falta de equipamento seja o que leva à saída.`,
      }
    }
    if (/cuidado|apoio|psicol|familia/.test(texto)) {
      return {
        fonte: 'Estações 4 e 9',
        resposta:
          'Não consigo responder isso com os dados que existem. A variável mae_cuidadora tem 0% de resposta dentro do universo de 60 alunas: a pergunta não estava no formulário dessas turmas. Toda a fila entra como "sem dado" nessa trilha, e a única forma de saber hoje é perguntar na conversa. A pergunta já está no roteiro de escuta de cada ficha.',
      }
    }
    return {
      fonte: 'Estações 8 e 9',
      resposta:
        'Também não dá. A variável disponibilidade_h ficou fora do modelo com 45% de resposta dentro do universo, e a Estação 8 anota na limitação L7 que ela mistura pergunta por dia com pergunta por semana. A trilha de logística existe como oferta para a turma inteira, não como seleção de quem precisa.',
    }
  }

  // 3. prioridade da semana
  if (/(quem|por quem)/.test(texto) && /(primeiro|comec|priorid|semana)/.test(texto)) {
    const topo = fila.slice(0, capacidade).map((aluna, indice) => `${indice + 1}. ${aluna.aluna_id} (${aluna.turma})`)
    return {
      fonte: 'Fila carregada e Estação 12',
      resposta: `Com a capacidade em ${capacidade} nesta semana, a fila indica começar por:\n\n${topo.join('\n')}\n\nA ordem é a do modelo. O corte em ${capacidade} é seu, não dele: aumentar a capacidade alcança mais gente e gasta mais conversas, e a conta de cada opção está na Estação 12.`,
    }
  }

  // 4. envio automatico
  if (/(envi|manda|dispara)/.test(texto) && /(automat|sozinh|todas|em massa)/.test(texto)) {
    return {
      recusa: true,
      fonte: 'Regra do projeto',
      resposta:
        'Isso a ferramenta não faz, por desenho. Ela gera rascunho, a gestora revisa e a gestora envia. Nenhum texto sai daqui sem uma pessoa ler, e a guarda de linguagem roda antes de cada rascunho aparecer na tela.',
    }
  }

  // 5. banco de perguntas
  let melhor = null
  let pontuacao = 0
  PERGUNTAS.forEach((item) => {
    item.chaves.forEach((chave) => {
      const alvo = normalizar(chave)
      if (texto.includes(alvo) && alvo.length > pontuacao) {
        melhor = item
        pontuacao = alvo.length
      }
    })
  })
  if (melhor) return { resposta: melhor.resposta, fonte: melhor.fonte, recusa: Boolean(melhor.recusa) }

  return {
    fonte: 'Sem dado no notebook',
    resposta:
      'Não tenho isso medido no notebook, e prefiro dizer isso a inventar. Posso responder sobre: por quem começar esta semana, o que o modelo usa e não usa, o que cada limitação significa, e gerar rascunho de mensagem para uma aluna da fila. Se a pergunta for sobre o caso de uma aluna específica, a resposta honesta é que o modelo não fornece motivo por caso, e o caminho é o roteiro de escuta na ficha dela.',
  }
}
