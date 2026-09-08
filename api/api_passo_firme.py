"""
API do FlyFlix (projeto Passo Firme)
Grupo Ada Lovelace (G4) - Turma Fly - diversiData

Carrega o modelo salvo na Estacao 15 do notebook TCC_EvasaoFly_G4_V15 e expoe
tres rotas para a pagina interna das gestoras da Fly.

O QUE ESTA API DEVOLVE, E O QUE ELA SE RECUSA A DEVOLVER
--------------------------------------------------------
Devolve  : a ORDEM da fila, ja ordenada por risco decrescente.
Devolve  : se a aluna esta acima ou abaixo do limiar operacional (0,491).
NAO devolve : a probabilidade individual. A curva de calibracao da Estacao 13.3
              e instavel com este n, e a ficha tecnica lista "informar risco
              individual a aluna" como uso proibido. Como a pagina nunca precisa
              do numero, ele nao atravessa a fronteira da API.
NAO devolve : os "3 fatores mais influentes daquele caso". A campea e uma Random
              Forest, que nao e linear e nao tem coeficiente para ler direcao
              (Estacao 13.2). Nao existe explicacao por caso confiavel neste
              modelo, e prometer uma seria inventar.
NAO devolve : raca e lgbt. As duas entram no modelo, e a permutacao mostra que a
              campea usa lgbt entre as quatro variaveis de maior peso. Exatamente
              por isso elas nao atravessam para a tela: a Estacao 16 proibe raca,
              orientacao e deficiencia como motivo de contato.

O QUE A ESTACAO 14 DECIDIU
--------------------------
O teste de embaralhamento rodou 40 vezes, refazendo a busca em grade inteira a cada
rodada. O acaso tira AP 0,753 em media e 0,861 no percentil 95. O modelo real tira
0,9746. p empirico 0,0244: existe sinal real, ainda que fraco, e a ordenacao de risco
tem valor. Ressalva para nao exagerar: o ganho MEDIDO sobre o acaso e de cerca de
0,12 acima do percentil 95, nao os 0,33 sobre o piso teorico de 0,644.

COMO RODAR LOCALMENTE
---------------------
    pip install fastapi uvicorn joblib scikit-learn pandas
    # coloque modelo_evasao_G4.joblib na mesma pasta (saida da Estacao 15)
    uvicorn api_passo_firme:app --reload --port 8000

    Documentacao interativa em http://localhost:8000/docs

COMO PUBLICAR DE GRACA
----------------------
Render (https://render.com), plano free:
    1. Suba esta pasta num repositorio Git (api_passo_firme.py, requirements.txt,
       modelo_evasao_G4.joblib).
    2. New > Web Service > conecte o repositorio.
    3. Build Command : pip install -r requirements.txt
    4. Start Command : uvicorn api_passo_firme:app --host 0.0.0.0 --port $PORT
    5. Copie a URL gerada e cole na pagina "Base e Conexao" do FlyFlix.

Hugging Face Spaces, SDK Docker:
    1. New Space > Docker > Blank.
    2. Suba esta pasta com o Dockerfile de tres linhas do fim deste arquivo.
    3. A URL do Space e a URL da API.

requirements.txt sugerido (fixe a versao do scikit-learn usada no Colab, senao o
joblib reclama de incompatibilidade ao carregar):
    fastapi==0.115.0
    uvicorn[standard]==0.30.6
    joblib==1.4.2
    scikit-learn==1.5.2
    pandas==2.2.2

ATENCAO: protótipo academico. Nao serve para decisao sobre pessoas reais.
"""

from __future__ import annotations

import os
from typing import Dict, List, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --------------------------------------------------------------------------- #
# carregamento do modelo salvo na Estacao 15
# --------------------------------------------------------------------------- #

CAMINHO_MODELO = os.environ.get("MODELO_PATH", "modelo_evasao_G4.joblib")

# valores da V15, usados como fallback se o .joblib nao estiver na pasta
LIMIAR_PADRAO = 0.491
VARIAVEIS_PADRAO = [
    "idade", "escolaridade", "renda_ord", "pessoas_casa",
    "raca", "tem_computador", "regiao", "lgbt",
]

MODELO = None
LIMIAR = LIMIAR_PADRAO
VARIAVEIS = list(VARIAVEIS_PADRAO)
ERRO_CARGA: Optional[str] = None

try:
    _pacote = joblib.load(CAMINHO_MODELO)
    MODELO = _pacote["modelo"]
    LIMIAR = float(_pacote.get("limiar", LIMIAR_PADRAO))
    VARIAVEIS = list(_pacote.get("variaveis", VARIAVEIS_PADRAO))
except FileNotFoundError:
    ERRO_CARGA = (
        f"{CAMINHO_MODELO} nao encontrado. O arquivo sai da Estacao 15 do notebook, "
        "em dados/modelo_evasao_G4.joblib, com cerca de 325 KB. Copie ele para a pasta "
        "desta API ou aponte a variavel de ambiente MODELO_PATH."
    )
except Exception as exc:  # versao de sklearn diferente, arquivo corrompido, etc.
    ERRO_CARGA = f"nao foi possivel carregar o modelo: {exc}"


# --------------------------------------------------------------------------- #
# contratos
# --------------------------------------------------------------------------- #

class Aluna(BaseModel):
    """Os 8 conceitos que o modelo usa, exatamente como a Estacao 3 os construiu."""

    aluna_id: str = Field(..., description="identificador anonimo ja atribuido pela Fly, formato 'Aluna 1331'")
    turma: Optional[str] = Field(None, description="turma ou edicao, contexto operacional, nao entra no modelo")

    idade: Optional[float] = Field(None, ge=14, le=80, description="anos completos")
    escolaridade: Optional[int] = Field(None, ge=1, le=6, description="escala ordinal 1 a 6")
    renda_ord: Optional[int] = Field(None, ge=0, le=3, description="renda por pessoa, escala ordinal 0 a 3")
    pessoas_casa: Optional[float] = Field(None, ge=1, le=15)

    raca: Optional[str] = Field(None, description="Preta, Parda, Branca, Indigena, Amarela. Entra no modelo e NUNCA volta na resposta")
    tem_computador: Optional[str] = Field(None, description="Sim ou Nao")
    regiao: Optional[str] = Field(None, description="N, NE, CO, SE, S")
    lgbt: Optional[str] = Field(None, description="Sim, Nao, Prefiro nao responder. Entra no modelo e NUNCA volta na resposta")

    model_config = {
        "json_schema_extra": {
            "example": {
                "aluna_id": "Aluna 1331", "turma": "T12",
                "idade": 34, "escolaridade": 4, "renda_ord": 0, "pessoas_casa": 4,
                "raca": "Parda", "tem_computador": "Nao", "regiao": "NE", "lgbt": "Nao",
            }
        }
    }


class Previsao(BaseModel):
    aluna_id: str
    turma: Optional[str] = None
    apontada: str = Field(..., description="'sim' se a probabilidade fica acima do limiar operacional")
    posicao: Optional[int] = Field(None, description="posicao na fila, so existe quando varias alunas sao enviadas juntas")
    campos_ausentes: List[str] = Field(default_factory=list, description="o que a inscricao nao respondeu, para a gestora confirmar na conversa")
    aviso: str = "Protótipo acadêmico. Ordem de prioridade para acolhimento. Nao serve para decisao sobre pessoas reais."


class RespostaFila(BaseModel):
    gerado_em: str
    campeao: str = "Random Forest"
    limiar: float
    universo: int = 60
    evasoes: int = 39
    p_valor_embaralhamento: float = 0.0244
    veredito: str = (
        "Estacao 14: 40 embaralhamentos com a busca em grade refeita inteira. "
        "O acaso tira AP 0,753 em media e 0,861 no percentil 95; o modelo real tira 0,9746. "
        "p empirico 0,0244: existe sinal real, ainda que fraco. O ganho sobre o acaso MEDIDO "
        "e de cerca de 0,12, nao os 0,33 sobre o piso teorico."
    )
    fila: List[Dict]


# --------------------------------------------------------------------------- #
# app
# --------------------------------------------------------------------------- #

app = FastAPI(
    title="FlyFlix",
    version="1.0",
    description=(
        "Ordena a fila de prioridade para acolhimento na Fly Educacao. "
        "Protótipo academico do TCC do Grupo Ada Lovelace, Turma Fly diversiData. "
        "Devolve ordem, nunca probabilidade individual."
    ),
)

# CORS: so as origens onde o FlyFlix roda de verdade.
# Curinga "*" foi trocado por lista explicita: a API nao usa credenciais, mas
# manter a lista fechada evita que qualquer pagina de terceiro consuma a fila.
# Para liberar um preview novo da Vercel, use ORIGENS_EXTRA no ambiente:
#     ORIGENS_EXTRA="https://flyflix-git-branch-usuario.vercel.app"
ORIGENS = [
    "http://localhost:3000",
    "http://localhost:4173",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "https://fly-flix-ia-generativa.vercel.app",
]
ORIGENS += [o.strip() for o in os.environ.get("ORIGENS_EXTRA", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGENS,
    # previews da Vercel mudam de subdominio a cada branch
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def _quadro(alunas: List[Aluna]) -> pd.DataFrame:
    """Monta o DataFrame com as colunas na ordem exata em que o pipeline foi treinado."""
    linhas = [a.model_dump() for a in alunas]
    df = pd.DataFrame(linhas)
    for col in VARIAVEIS:
        if col not in df.columns:
            df[col] = None
    return df[VARIAVEIS]


def _ausentes(a: Aluna) -> List[str]:
    """Campos em branco na inscricao. Vira a lista 'o que confirmar' na ficha."""
    faltando = [c for c in VARIAVEIS if getattr(a, c, None) in (None, "")]
    # raca e lgbt nunca voltam para a tela, nem para dizer que estao vazias
    return [c for c in faltando if c not in ("raca", "lgbt")]


@app.get("/saude", summary="Diz se o modelo carregou")
def saude():
    return {
        "ok": MODELO is not None,
        "campeao": "Random Forest" if MODELO is not None else None,
        "limiar": LIMIAR,
        "variaveis": VARIAVEIS,
        "erro": ERRO_CARGA,
        "aviso": "Protótipo acadêmico. Nao serve para decisao sobre pessoas reais.",
    }


@app.post("/prever", response_model=List[Previsao], summary="Ordena as alunas enviadas")
def prever(alunas: List[Aluna]):
    """
    Recebe uma ou varias alunas e devolve a fila ordenada.

    A probabilidade e calculada internamente para ordenar e para comparar com o
    limiar, e nao sai na resposta. Se voce precisar do numero para uma analise no
    notebook, use o proprio modelo la, com a ressalva da Estacao 13.3.
    """
    if MODELO is None:
        raise HTTPException(status_code=503, detail=ERRO_CARGA or "modelo indisponivel")
    if not alunas:
        raise HTTPException(status_code=400, detail="envie ao menos uma aluna")

    probs = MODELO.predict_proba(_quadro(alunas))[:, 1]

    itens = []
    for aluna, prob in zip(alunas, probs):
        itens.append({
            "aluna_id": aluna.aluna_id,
            "turma": aluna.turma,
            "apontada": "sim" if prob >= LIMIAR else "nao",
            "campos_ausentes": _ausentes(aluna),
            "_p": float(prob),  # interno, removido logo abaixo
        })

    itens.sort(key=lambda x: x["_p"], reverse=True)
    for posicao, item in enumerate(itens, start=1):
        item["posicao"] = posicao
        del item["_p"]

    return [Previsao(**item) for item in itens]


@app.post("/fila", response_model=RespostaFila, summary="Fila pronta para colar na pagina")
def fila(alunas: List[Aluna]):
    """
    Mesma coisa que /prever, ja embrulhado no formato que a aba
    "Base e conexao" da pagina espera. O jeito rapido de ligar as duas pontas:

        curl -s -X POST http://localhost:8000/fila \\
             -H "Content-Type: application/json" \\
             -d @alunas.json > fila.json

    e colar o conteudo de fila.json no campo da pagina.
    """
    previsoes = prever(alunas)
    por_id = {a.aluna_id: a for a in alunas}

    linhas = []
    for p in previsoes:
        a = por_id[p.aluna_id]
        linhas.append({
            "aluna_id": a.aluna_id,
            "turma": a.turma,
            "apontada": p.apontada,
            "idade": a.idade,
            "escolaridade": a.escolaridade,
            "renda_ord": a.renda_ord,
            "pessoas_casa": a.pessoas_casa,
            "tem_computador": a.tem_computador,
            "regiao": a.regiao,
            # raca e lgbt ficam de fora de proposito, ver cabecalho do arquivo
        })

    return RespostaFila(
        gerado_em=pd.Timestamp.today().strftime("%Y-%m-%d"),
        limiar=LIMIAR,
        fila=linhas,
    )


# --------------------------------------------------------------------------- #
# Dockerfile para o Hugging Face Spaces, se preferir esse caminho:
#
#   FROM python:3.11-slim
#   COPY . /app
#   WORKDIR /app
#   RUN pip install --no-cache-dir -r requirements.txt
#   CMD ["uvicorn", "api_passo_firme:app", "--host", "0.0.0.0", "--port", "7860"]
# --------------------------------------------------------------------------- #

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
