# FlyFlix

Ferramenta interna das gestoras da Fly Educação para priorizar acolhimento antes
da evasão. Protótipo acadêmico do TCC do Grupo Ada Lovelace, Turma Fly, diversiData.

> **Identificar o risco antes de o problema chegar.**

O modelo por trás é a Random Forest afinada do notebook `TCC_EvasaoFly_G4_V15`.
Todos os números exibidos vêm de lá, com a estação indicada em cada afirmação.
Nada foi estimado.

---

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera dist/
npm run preview  # serve o dist/
```

Requer Node 18 ou superior.

## Publicar na Vercel

1. Suba este repositório no GitHub.
2. Na Vercel: **Add New → Project → Import Git Repository**.
3. O `vercel.json` já define framework Vite, `npm run build` e saída em `dist`.
   Não é preciso configurar nada na interface.
4. Deploy. A URL de produção esperada é `https://fly-flix-ia-generativa.vercel.app`.

Se o domínio mudar, ajuste a lista `ORIGENS` em `api/api_passo_firme.py`, ou
passe `ORIGENS_EXTRA` como variável de ambiente na hospedagem da API.

## Ligar a API do modelo

O front funciona inteiro sem rede: a fila entra por JSON colado na página
**Base e Conexão**. A API é opcional e serve para automatizar esse passo.

```bash
cd api
pip install -r requirements.txt
# copie modelo_evasao_G4.joblib (saída da Estação 15) para esta pasta
uvicorn api_passo_firme:app --reload --port 8000
```

Rotas: `GET /saude`, `POST /prever`, `POST /fila`. O cabeçalho do arquivo
explica o que a API devolve e, principalmente, o que ela se recusa a devolver.

---

## Estrutura

```
src/
  main.jsx              ponto de entrada
  App.jsx               navegação entre as 6 páginas, tema e gaveta do copiloto
  contexto/
    AppContext.jsx      fila, capacidade, contatos, registros e seleção
  lib/                  regras de negócio, sem nenhuma dependência de React
    dados.js            constantes do modelo, escalas e fila de exemplo
    guarda.js           guarda de linguagem (8 regras)
    escriba.js          registro em texto livre para campos estruturados
    harmonizador.js     cabeçalhos de planilha nova para os 15 conceitos
    copiloto.js         roteamento de intenção e respostas ancoradas
    textos.js           roteiro de escuta e modelos de mensagem
    formato.js          formatação pt-BR
    armazenamento.js    hook de persistência em localStorage
  components/           peças reutilizáveis, cada uma com seu .module.css
  paginas/              uma pasta de tela por página da navegação
  styles/
    tokens.css          variáveis de cor, tipografia e espaço, nos dois temas
    base.css            reset, tipografia base e foco visível
    componentes.css     primitivos compartilhados (cartão, botão, campo, tabela)
```

A camada `lib/` é pura: nenhuma função ali importa React nem toca no DOM. Isso
mantém as regras testáveis e permite reaproveitá-las em outro front, se um dia o
grupo quiser gerar a fila num script.

---

## Decisões de implementação

Alguns pontos do briefing foram implementados de forma um pouco diferente do
literal. Cada desvio tem um motivo, e todos são reversíveis.

**CSS Modules em vez de Tailwind.** O requisito pedia "CSS3 modular". CSS Modules
entrega escopo por componente sem build extra nem classes utilitárias no JSX, e
os tokens ficam em um arquivo só, fácil de trocar quando a Fly ajustar a marca.

**Cores claras da paleta como preenchimento, não como texto.** `#25CCE3`,
`#6BE586` e `#D9E345` têm contraste em torno de 2:1 sobre branco, então reprovam
no critério 1.4.3 da WCAG AA para texto. Elas aparecem como fundo, borda, luz do
semáforo e texto no tema escuro. Para texto sobre claro, o sistema usa `#007C9E`
(4,8:1) e `#0D1117`.

**`#004054` como superfície de destaque, não em todo cartão.** Usar o azul
escuro em todos os cartões deixaria a tela pesada. Ele fica no cabeçalho, nos
botões primários, no topo do copiloto e nos blocos de código. Os cartões de
conteúdo usam fundo claro com borda.

**Semáforo com cor mais texto.** Cada luz vem acompanhada do nome da faixa e da
contagem, porque cor sozinha reprova no critério 1.4.1. A faixa é posição na
fila definida pela capacidade da equipe, nunca probabilidade: por isso o rótulo
é "atenção", e não "risco".

**Sora via Google Fonts.** Evita versionar o `.otf` e chega com `display=swap`.
Se a Fly exigir o arquivo local, basta trocar o `<link>` do `index.html` por um
`@font-face` apontando para `public/fonts/Sora.otf`.

**CORS ficou na API.** É um cabeçalho de resposta do servidor: configurar no
front não teria efeito. A lista de origens está em `api/api_passo_firme.py`, com
um regex que já cobre os previews `*.vercel.app`.

---

## Acessibilidade

- `lang="pt-BR"` e marcação semântica: `header`, `nav`, `main`, `section`,
  `footer`, `dl` para pares rótulo e valor, `table` com `thead` e `th scope`.
- Nenhuma `div` clicável. Tudo que age é `button`, então já responde a Enter,
  Espaço e Tab sem handler extra.
- `:focus-visible` de 3px em todo elemento focável.
- Link "Pular para o conteúdo" como primeiro item do DOM.
- Gaveta do copiloto com `role="dialog"`, `aria-modal`, foco movido ao abrir e
  fechamento por Esc.
- `aria-current="page"` na aba ativa, `aria-live="polite"` nos avisos de status
  e no log da conversa.
- Cor nunca é o único canal de informação.
- `prefers-reduced-motion` desliga as transições.

## Privacidade

A fila carregada e os registros de conversa ficam apenas no `localStorage` do
navegador de quem usa. Não há servidor por trás do front, nenhum dado sai da
máquina e nenhuma chamada de rede acontece a não ser que a API seja configurada.

Duas variáveis do modelo, `raca` e `lgbt`, nunca chegam à tela nem ao contrato de
dados, mesmo entrando no cálculo. A Estação 16 do notebook proíbe raça,
orientação e deficiência como motivo de contato.
