import enum
from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float,
    ForeignKey, Integer, String, Text, func,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class PerfilEnum(str, enum.Enum):
    produtor = "produtor"
    ong = "ong"
    varejo = "varejo"
    admin = "admin"


class StatusProdutoEnum(str, enum.Enum):
    disponivel = "disponivel"
    reservado = "reservado"
    doado = "doado"
    expirado = "expirado"


class TipoOfertaEnum(str, enum.Enum):
    doacao = "doacao"
    venda_desconto = "venda_desconto"


class StatusOfertaEnum(str, enum.Enum):
    ativa = "ativa"
    reservada = "reservada"
    concluida = "concluida"
    expirada = "expirada"


class StatusParceriaEnum(str, enum.Enum):
    pendente = "pendente"
    confirmada = "confirmada"
    concluida = "concluida"
    cancelada = "cancelada"


class TipoNotificacaoEnum(str, enum.Enum):
    alerta_validade = "alerta_validade"
    nova_oferta = "nova_oferta"
    confirmacao_coleta = "confirmacao_coleta"
    sistema = "sistema"


class CanalNotificacaoEnum(str, enum.Enum):
    push = "push"
    email = "email"
    sms = "sms"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    perfil = Column(Enum(PerfilEnum), nullable=False, default=PerfilEnum.produtor)
    telefone = Column(String(20), nullable=True)
    localizacao = Column(String(255), nullable=True)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())

    produtos = relationship("Produto", back_populates="usuario")
    ofertas = relationship("Oferta", back_populates="produtor")
    parcerias_receptor = relationship("Parceria", back_populates="receptor", foreign_keys="Parceria.receptor_id")
    notificacoes = relationship("Notificacao", back_populates="usuario")
    mensagens = relationship("Mensagem", back_populates="usuario")
    relatorios = relationship("Relatorio", back_populates="gerado_por")


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    nome = Column(String(120), nullable=False)
    categoria = Column(String(80), nullable=True)
    quantidade = Column(Float, nullable=False)
    unidade = Column(String(20), default="kg")
    data_validade = Column(DateTime, nullable=True)
    data_colheita = Column(DateTime, nullable=True)
    descricao = Column(Text, nullable=True)
    status = Column(Enum(StatusProdutoEnum), default=StatusProdutoEnum.disponivel)
    criado_em = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario", back_populates="produtos")
    ofertas = relationship("Oferta", back_populates="produto")


class Oferta(Base):
    __tablename__ = "ofertas"

    id = Column(Integer, primary_key=True, index=True)
    produtor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    quantidade_disponivel = Column(Float, nullable=False)
    preco = Column(Float, nullable=True)
    tipo = Column(Enum(TipoOfertaEnum), nullable=False, default=TipoOfertaEnum.doacao)
    status = Column(Enum(StatusOfertaEnum), default=StatusOfertaEnum.ativa)
    data_expiracao = Column(DateTime, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())

    produtor = relationship("Usuario", back_populates="ofertas")
    produto = relationship("Produto", back_populates="ofertas")
    parcerias = relationship("Parceria", back_populates="oferta")


class Parceria(Base):
    __tablename__ = "parcerias"

    id = Column(Integer, primary_key=True, index=True)
    oferta_id = Column(Integer, ForeignKey("ofertas.id"), nullable=False)
    receptor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    quantidade_retirada = Column(Float, nullable=False)
    status = Column(Enum(StatusParceriaEnum), default=StatusParceriaEnum.pendente)
    data_coleta = Column(DateTime, nullable=True)
    avaliacao = Column(Integer, nullable=True)
    observacoes = Column(Text, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())

    oferta = relationship("Oferta", back_populates="parcerias")
    receptor = relationship("Usuario", back_populates="parcerias_receptor", foreign_keys=[receptor_id])


class Notificacao(Base):
    __tablename__ = "notificacoes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String(120), nullable=False)
    corpo = Column(Text, nullable=False)
    tipo = Column(Enum(TipoNotificacaoEnum), default=TipoNotificacaoEnum.sistema)
    canal = Column(Enum(CanalNotificacaoEnum), default=CanalNotificacaoEnum.push)
    lida = Column(Boolean, default=False)
    enviada_em = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario", back_populates="notificacoes")


class Relatorio(Base):
    __tablename__ = "relatorios"

    id = Column(Integer, primary_key=True, index=True)
    gerado_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    periodo_inicio = Column(DateTime, nullable=False)
    periodo_fim = Column(DateTime, nullable=False)
    total_kg_salvos = Column(Float, default=0.0)
    total_co2_evitado = Column(Float, default=0.0)
    valor_economizado = Column(Float, default=0.0)
    parceiros_envolvidos = Column(Integer, default=0)
    criado_em = Column(DateTime, server_default=func.now())

    gerado_por = relationship("Usuario", back_populates="relatorios")


class Mensagem(Base):
    __tablename__ = "mensagens"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    sessao_id = Column(String(64), nullable=False, index=True)
    conteudo = Column(Text, nullable=False)
    tipo = Column(String(10), default="entrada")
    intencao = Column(String(80), nullable=True)
    criado_em = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario", back_populates="mensagens")


class AgenteIA(Base):
    __tablename__ = "agentes_ia"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(80), nullable=False, default="AgroBot")
    versao_modelo = Column(String(50), nullable=False, default="gpt-4o-mini")
    tipo = Column(String(50), default="chatbot")
    prompt_base = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())
