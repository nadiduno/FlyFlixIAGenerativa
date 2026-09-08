/**
 * Constantes e dados de exemplo.
 *
 * Todos os numeros citados aqui vem do notebook TCC_EvasaoFly_G4_V15, com a
 * estacao indicada. Nenhum foi estimado. As fichas de `FILA_EXEMPLO` sao
 * ficticias e existem so para a tela abrir em estado util: a fila real chega
 * pelo JSON da Estacao 15, na pagina "Base e Conexao".
 */

export const MODELO = {
  campeao: 'Random Forest',
  universo: 60,
  evasoes: 39,
  treino: 45,
  teste: 15,
  limiar: 0.491,
  apCruzada: 0.975,
  apAcasoTeorico: 0.644,
  apAcasoMedio: 0.753,
  apAcasoP95: 0.861,
  apReal: 0.9746,
  pValor: 0.0244,
  testeAP: 0.971,
  testeRecall: 0.9,
  testePrecisao: 0.818,
  testeF1: 0.857,
  testeAcuracia: 0.8,
  brier: 0.125,
  brierBase: 0.222,
  variaveis: ['idade', 'escolaridade', 'renda_ord', 'pessoas_casa', 'raca', 'tem_computador', 'regiao', 'lgbt'],
  ocultas: ['raca', 'lgbt'],
}

export const ESCOLARIDADE = {
  1: 'Fundamental incompleto',
  2: 'Fundamental completo ou médio incompleto',
  3: 'Médio completo ou técnico',
  4: 'Superior incompleto',
  5: 'Superior completo',
  6: 'Pós-graduação',
}

export const RENDA = {
  0: 'Menos de 1 salário mínimo por pessoa',
  1: 'De 1 a 2 por pessoa',
  2: 'De 2 a 5 por pessoa',
  3: 'Acima de 5 por pessoa',
}

export const REGIAO = { N: 'Norte', NE: 'Nordeste', CO: 'Centro-Oeste', SE: 'Sudeste', S: 'Sul' }

export const FAIXAS = [
  { chave: 'maior', nome: 'Maior Atenção', cor: 'var(--atencao-maior)', fundo: 'var(--atencao-maior-fundo)' },
  { chave: 'media', nome: 'Média Atenção', cor: 'var(--atencao-media)', fundo: 'var(--atencao-media-fundo)' },
  { chave: 'menor', nome: 'Menor Atenção', cor: 'var(--atencao-menor)', fundo: 'var(--atencao-menor-fundo)' },
]

export const SELO = [
  ['Origem', 'Fila ordenada por Random Forest afinada, 8 variáveis do formulário de inscrição.'],
  ['Base', '60 alunas com perfil e desfecho, 39 evasões. Teste com 15 alunas.'],
  ['Não usado como motivo', 'Raça, LGBT+, região.'],
  ['Teste de honestidade', 'Estação 14, p empírico 0,0244. AP real 0,975 contra 0,861 no percentil 95 do acaso.'],
  ['Uso proibido', 'Informar risco individual à aluna, decidir desligamento, bolsa ou seleção.'],
  ['Protótipo acadêmico', 'Rascunho para a gestora revisar. A ferramenta não envia nada.'],
]

export const FILA_EXEMPLO = {
  gerado_em: 'exemplo',
  campeao: MODELO.campeao,
  limiar: MODELO.limiar,
  universo: MODELO.universo,
  evasoes: MODELO.evasoes,
  fonte: 'exemplo',
  fila: [
    { aluna_id: 'Aluna 0142', turma: 'T12', apontada: 'sim', idade: 34, escolaridade: 4, renda_ord: 0, pessoas_casa: 4, tem_computador: 'Não', regiao: 'NE' },
    { aluna_id: 'Aluna 0891', turma: 'T12', apontada: 'sim', idade: null, escolaridade: 3, renda_ord: 1, pessoas_casa: null, tem_computador: 'Sim', regiao: 'SE' },
    { aluna_id: 'Aluna 1204', turma: 'T12', apontada: 'sim', idade: 41, escolaridade: 5, renda_ord: 0, pessoas_casa: 6, tem_computador: 'Sim', regiao: 'N' },
    { aluna_id: 'Aluna 0377', turma: 'T16', apontada: 'sim', idade: 22, escolaridade: null, renda_ord: 1, pessoas_casa: 2, tem_computador: 'Sim', regiao: 'SE' },
    { aluna_id: 'Aluna 1518', turma: 'T12', apontada: 'sim', idade: 29, escolaridade: 4, renda_ord: 0, pessoas_casa: 3, tem_computador: 'Não', regiao: 'NE' },
    { aluna_id: 'Aluna 0655', turma: 'T12', apontada: 'sim', idade: 37, escolaridade: 3, renda_ord: 0, pessoas_casa: 5, tem_computador: 'Sim', regiao: 'NE' },
    { aluna_id: 'Aluna 1077', turma: 'T23', apontada: 'sim', idade: 26, escolaridade: 4, renda_ord: 1, pessoas_casa: 2, tem_computador: 'Sim', regiao: 'SE' },
    { aluna_id: 'Aluna 0429', turma: 'T12', apontada: 'sim', idade: 45, escolaridade: 5, renda_ord: 0, pessoas_casa: 4, tem_computador: 'Não', regiao: 'CO' },
    { aluna_id: 'Aluna 1362', turma: 'T16', apontada: 'sim', idade: null, escolaridade: 4, renda_ord: 1, pessoas_casa: 3, tem_computador: 'Sim', regiao: 'SE' },
    { aluna_id: 'Aluna 0208', turma: 'T12', apontada: 'sim', idade: 31, escolaridade: 3, renda_ord: 0, pessoas_casa: 7, tem_computador: 'Sim', regiao: 'N' },
    { aluna_id: 'Aluna 1445', turma: 'T23', apontada: 'sim', idade: 24, escolaridade: 4, renda_ord: 1, pessoas_casa: 2, tem_computador: 'Sim', regiao: 'SE' },
    { aluna_id: 'Aluna 0913', turma: 'T12', apontada: 'não', idade: 38, escolaridade: 5, renda_ord: 1, pessoas_casa: 3, tem_computador: 'Sim', regiao: 'SE' },
    { aluna_id: 'Aluna 1130', turma: 'T16', apontada: 'não', idade: 28, escolaridade: 4, renda_ord: 1, pessoas_casa: 2, tem_computador: 'Sim', regiao: 'S' },
    { aluna_id: 'Aluna 0561', turma: 'T12', apontada: 'não', idade: 33, escolaridade: 6, renda_ord: 2, pessoas_casa: 2, tem_computador: 'Sim', regiao: 'SE' },
    { aluna_id: 'Aluna 1289', turma: 'T23', apontada: 'não', idade: 47, escolaridade: 5, renda_ord: 1, pessoas_casa: 4, tem_computador: 'Sim', regiao: 'NE' },
  ],
}

export const PAGINAS = [
  { id: 'painel', nome: 'Painel', resumo: 'Por quem começar esta semana, e quantas alunas cabem na capacidade real da equipe.' },
  { id: 'ficha', nome: 'Ficha da Aluna', resumo: 'O que a inscrição respondeu, o que ficou em branco, e as perguntas que puxam a conversa.' },
  { id: 'mensagens', nome: 'Mensagens', resumo: 'Rascunhos por trilha e canal. A guarda de linguagem roda antes de o texto aparecer.' },
  { id: 'registro', nome: 'Registro da Conversa', resumo: 'O que a aluna contou vira linha estruturada: é a coluna de engajamento que a base não tem.' },
  { id: 'base', nome: 'Base e Conexão', resumo: 'Carregar a fila real da Estação 15, ligar a API e mapear planilha nova.' },
  { id: 'tecnica', nome: 'Ficha Técnica', resumo: 'O que este modelo mede, o que ele não mede, e o que é proibido fazer com ele.' },
]
