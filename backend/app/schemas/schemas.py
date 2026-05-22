from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.models import (
    PerfilEnum, TipoOfertaEnum, StatusOfertaEnum,
    StatusProdutoEnum, StatusParceriaEnum,
    TipoNotificacaoEnum, CanalNotificacaoEnum,
)


# ── Auth ──────────────────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Usuário ───────────────────────────────────────────────────────────────────
class UsuarioCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(..., min_length=6)
    perfil: PerfilEnum = PerfilEnum.produtor
    telefone: Optional[str] = None
    localizacao: Optional[str] = None


class UsuarioOut(BaseModel):
    id: int
    nome: str
    email: str
    perfil: PerfilEnum
    telefone: Optional[str]
    localizacao: Optional[str]
    ativo: bool
    criado_em: datetime
    model_config = {"from_attributes": True}


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    localizacao: Optional[str] = None


# ── Produto ───────────────────────────────────────────────────────────────────
class ProdutoCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    categoria: Optional[str] = None
    quantidade: float = Field(..., gt=0)
    unidade: str = "kg"
    data_validade: Optional[datetime] = None
    data_colheita: Optional[datetime] = None
    descricao: Optional[str] = None


class ProdutoOut(BaseModel):
    id: int
    usuario_id: int
    nome: str
    categoria: Optional[str]
    quantidade: float
    unidade: str
    data_validade: Optional[datetime]
    status: StatusProdutoEnum
    criado_em: datetime
    model_config = {"from_attributes": True}


# ── Oferta ────────────────────────────────────────────────────────────────────
class OfertaCreate(BaseModel):
    produto_id: int
    quantidade_disponivel: float = Field(..., gt=0)
    preco: Optional[float] = None
    tipo: TipoOfertaEnum = TipoOfertaEnum.doacao
    data_expiracao: Optional[datetime] = None


class OfertaOut(BaseModel):
    id: int
    produtor_id: int
    produto_id: int
    quantidade_disponivel: float
    preco: Optional[float]
    tipo: TipoOfertaEnum
    status: StatusOfertaEnum
    data_expiracao: Optional[datetime]
    criado_em: datetime
    model_config = {"from_attributes": True}


# ── Parceria ──────────────────────────────────────────────────────────────────
class ParceriaCreate(BaseModel):
    oferta_id: int
    quantidade_retirada: float = Field(..., gt=0)


class ParceriaUpdate(BaseModel):
    status: Optional[StatusParceriaEnum] = None
    data_coleta: Optional[datetime] = None
    avaliacao: Optional[int] = Field(None, ge=1, le=5)
    observacoes: Optional[str] = None


class ParceriaOut(BaseModel):
    id: int
    oferta_id: int
    receptor_id: int
    quantidade_retirada: float
    status: StatusParceriaEnum
    data_coleta: Optional[datetime]
    avaliacao: Optional[int]
    criado_em: datetime
    model_config = {"from_attributes": True}


# ── Notificação ───────────────────────────────────────────────────────────────
class NotificacaoOut(BaseModel):
    id: int
    titulo: str
    corpo: str
    tipo: TipoNotificacaoEnum
    canal: CanalNotificacaoEnum
    lida: bool
    enviada_em: datetime
    model_config = {"from_attributes": True}


# ── Relatório ─────────────────────────────────────────────────────────────────
class RelatorioCreate(BaseModel):
    periodo_inicio: datetime
    periodo_fim: datetime


class RelatorioOut(BaseModel):
    id: int
    periodo_inicio: datetime
    periodo_fim: datetime
    total_kg_salvos: float
    total_co2_evitado: float
    valor_economizado: float
    parceiros_envolvidos: int
    criado_em: datetime
    model_config = {"from_attributes": True}


# ── Chatbot ───────────────────────────────────────────────────────────────────
class MensagemCreate(BaseModel):
    conteudo: str = Field(..., min_length=1, max_length=2000)
    sessao_id: str = Field(..., min_length=8, max_length=64)


class MensagemOut(BaseModel):
    id: int
    sessao_id: str
    conteudo: str
    tipo: str
    intencao: Optional[str]
    criado_em: datetime
    model_config = {"from_attributes": True}


class ChatbotResposta(BaseModel):
    resposta: str
    intencao: Optional[str]
    sessao_id: str
