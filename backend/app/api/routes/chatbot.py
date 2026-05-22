import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Mensagem
from app.schemas.schemas import MensagemCreate, MensagemOut, ChatbotResposta
from app.core.security import get_current_user_id
from app.core.config import settings

router = APIRouter(prefix="/chatbot", tags=["Chatbot IA"])

PROMPT_SISTEMA = """
Você é o AgroBot, assistente virtual da Plataforma Anti-Desperdício de Alimentos.
Ajude produtores rurais, ONGs e varejos a:
- Cadastrar e gerenciar excedentes de alimentos
- Encontrar parceiros para doação ou venda com desconto
- Entender relatórios de impacto ambiental e financeiro
- Navegar pela plataforma

Seja objetivo, amigável e use linguagem simples. Responda sempre em português brasileiro.
"""

RESPOSTAS_DEMO = {
    "cadastrar_produto": "Para cadastrar um produto, acesse **Meus Produtos** no menu e clique em **Novo Produto**. Informe nome, quantidade, unidade e data de validade. Após salvar, você pode publicar uma oferta!",
    "publicar_oferta": "Para publicar uma oferta, vá em **Ofertas > Nova Oferta**, selecione o produto e defina se é doação ou venda com desconto. Os parceiros serão notificados automaticamente.",
    "buscar_parceiros": "Na aba **Ofertas Disponíveis** você encontra excedentes próximos. Filtre por tipo e categoria. Ao clicar em **Solicitar Coleta**, o produtor será notificado.",
    "consultar_relatorio": "Seus relatórios ficam em **Relatórios**. Você pode gerar por período e ver kg salvos, CO₂ evitado e valor economizado.",
    "ver_notificacoes": "Suas notificações ficam no ícone de sino. Você recebe alertas sobre vencimentos, novas ofertas e confirmações de coleta.",
    "geral": "Olá! Sou o **AgroBot** 🌱, seu assistente anti-desperdício. Posso te ajudar a cadastrar produtos, publicar ofertas, buscar parceiros ou consultar relatórios. O que você precisa?",
}


def detectar_intencao(texto: str) -> str:
    t = texto.lower()
    if any(p in t for p in ["cadastrar", "registrar", "adicionar", "lote"]):
        return "cadastrar_produto"
    if any(p in t for p in ["oferta", "doação", "doar", "excedente"]):
        return "publicar_oferta"
    if any(p in t for p in ["parceiro", "coleta", "buscar", "encontrar"]):
        return "buscar_parceiros"
    if any(p in t for p in ["relatório", "impacto", "co2", "kg"]):
        return "consultar_relatorio"
    if any(p in t for p in ["notificação", "alerta", "aviso"]):
        return "ver_notificacoes"
    return "geral"


async def chamar_llm(historico: list, mensagem: str) -> str | None:
    if not settings.OPENAI_API_KEY:
        return None
    try:
        import httpx
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": PROMPT_SISTEMA},
                *historico[-6:],
                {"role": "user", "content": mensagem},
            ],
            "max_tokens": 512,
            "temperature": 0.7,
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"},
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
    except Exception:
        return None


@router.post("/mensagem", response_model=ChatbotResposta)
async def enviar_mensagem(dados: MensagemCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    historico_db = (
        db.query(Mensagem)
        .filter(Mensagem.sessao_id == dados.sessao_id)
        .order_by(Mensagem.criado_em.desc())
        .limit(10)
        .all()
    )
    historico = [
        {"role": "user" if m.tipo == "entrada" else "assistant", "content": m.conteudo}
        for m in reversed(historico_db)
    ]
    intencao = detectar_intencao(dados.conteudo)
    resposta = await chamar_llm(historico, dados.conteudo)
    if not resposta:
        resposta = RESPOSTAS_DEMO.get(intencao, RESPOSTAS_DEMO["geral"])

    db.add_all([
        Mensagem(usuario_id=user_id, sessao_id=dados.sessao_id, conteudo=dados.conteudo, tipo="entrada", intencao=intencao),
        Mensagem(usuario_id=user_id, sessao_id=dados.sessao_id, conteudo=resposta, tipo="saida", intencao=intencao),
    ])
    db.commit()
    return ChatbotResposta(resposta=resposta, intencao=intencao, sessao_id=dados.sessao_id)


@router.get("/historico/{sessao_id}", response_model=list[MensagemOut])
def historico_sessao(sessao_id: str, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return db.query(Mensagem).filter(Mensagem.sessao_id == sessao_id, Mensagem.usuario_id == user_id).order_by(Mensagem.criado_em.asc()).all()


@router.get("/nova-sessao")
def nova_sessao():
    return {"sessao_id": str(uuid.uuid4()).replace("-", "")[:24]}
