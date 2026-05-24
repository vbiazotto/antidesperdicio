from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import (
    Parceria, Oferta, Notificacao, Relatorio,
    StatusParceriaEnum, StatusOfertaEnum,
    TipoNotificacaoEnum, CanalNotificacaoEnum
)
from app.schemas.schemas import (
    ParceriaCreate, ParceriaOut, ParceriaUpdate,
    NotificacaoOut, RelatorioCreate, RelatorioOut
)
from app.core.security import get_current_user_id

# ── Parcerias ─────────────────────────────────────────────────────────────────
router_parcerias = APIRouter(prefix="/parcerias", tags=["Parcerias"])


@router_parcerias.post("/", response_model=ParceriaOut, status_code=201)
def solicitar_coleta(
    dados: ParceriaCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    oferta = db.get(Oferta, dados.oferta_id)
    if not oferta or oferta.status != StatusOfertaEnum.ativa:
        raise HTTPException(status_code=404, detail="Oferta indisponível")
    if oferta.produtor_id == user_id:
        raise HTTPException(status_code=400, detail="Produtor não pode ser receptor da própria oferta")
    if dados.quantidade_retirada > oferta.quantidade_disponivel:
        raise HTTPException(status_code=400, detail="Quantidade excede o disponível")

    # Cria a parceria
    parceria = Parceria(**dados.model_dump(), receptor_id=user_id)
    oferta.status = StatusOfertaEnum.reservada
    db.add(parceria)

    # Busca nome do receptor para a notificação
    from app.models.models import Usuario
    receptor = db.get(Usuario, user_id)
    nome_receptor = receptor.nome if receptor else "Um usuário"

    # Notifica o PRODUTOR que alguém reservou a oferta
    notif_produtor = Notificacao(
        usuario_id=oferta.produtor_id,
        titulo="🎉 Nova reserva de coleta!",
        corpo=f"{nome_receptor} reservou sua oferta (Produto #{oferta.produto_id}) — {dados.quantidade_retirada} unidades. Aguarde a confirmação de coleta.",
        tipo=TipoNotificacaoEnum.confirmacao_coleta,
        canal=CanalNotificacaoEnum.push,
    )
    db.add(notif_produtor)

    # Notifica o RECEPTOR confirmando a solicitação
    notif_receptor = Notificacao(
        usuario_id=user_id,
        titulo="✅ Coleta solicitada com sucesso!",
        corpo=f"Sua solicitação de coleta para a oferta #{oferta.id} foi registrada. O produtor será notificado.",
        tipo=TipoNotificacaoEnum.confirmacao_coleta,
        canal=CanalNotificacaoEnum.push,
    )
    db.add(notif_receptor)

    db.commit()
    db.refresh(parceria)
    return parceria


@router_parcerias.get("/minhas", response_model=List[ParceriaOut])
def minhas_parcerias(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return db.query(Parceria).filter(Parceria.receptor_id == user_id).all()


@router_parcerias.patch("/{parceria_id}", response_model=ParceriaOut)
def atualizar_parceria(
    parceria_id: int,
    dados: ParceriaUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    parceria = db.get(Parceria, parceria_id)
    if not parceria or parceria.receptor_id != user_id:
        raise HTTPException(status_code=404, detail="Parceria não encontrada ou sem permissão")

    for campo, valor in dados.model_dump(exclude_none=True).items():
        setattr(parceria, campo, valor)

    if dados.status == StatusParceriaEnum.concluida:
        parceria.oferta.status = StatusOfertaEnum.concluida

        # Notifica o produtor que a coleta foi concluída
        notif = Notificacao(
            usuario_id=parceria.oferta.produtor_id,
            titulo="📦 Coleta concluída!",
            corpo=f"A coleta da oferta #{parceria.oferta_id} foi concluída com sucesso. {parceria.quantidade_retirada} unidades foram redistribuídas!",
            tipo=TipoNotificacaoEnum.confirmacao_coleta,
            canal=CanalNotificacaoEnum.push,
        )
        db.add(notif)

    elif dados.status == StatusParceriaEnum.confirmada:
        # Notifica o produtor que a coleta foi confirmada pelo receptor
        notif = Notificacao(
            usuario_id=parceria.oferta.produtor_id,
            titulo="🤝 Coleta confirmada!",
            corpo=f"O receptor confirmou a coleta da oferta #{parceria.oferta_id}.",
            tipo=TipoNotificacaoEnum.confirmacao_coleta,
            canal=CanalNotificacaoEnum.push,
        )
        db.add(notif)

    db.commit()
    db.refresh(parceria)
    return parceria


# ── Notificações ──────────────────────────────────────────────────────────────
router_notificacoes = APIRouter(prefix="/notificacoes", tags=["Notificações"])


@router_notificacoes.get("/", response_model=List[NotificacaoOut])
def listar_notificacoes(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return (
        db.query(Notificacao)
        .filter(Notificacao.usuario_id == user_id)
        .order_by(Notificacao.enviada_em.desc())
        .limit(50)
        .all()
    )


@router_notificacoes.patch("/{notif_id}/lida", response_model=NotificacaoOut)
def marcar_lida(
    notif_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    notif = db.get(Notificacao, notif_id)
    if not notif or notif.usuario_id != user_id:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    notif.lida = True
    db.commit()
    db.refresh(notif)
    return notif


# ── Relatórios ────────────────────────────────────────────────────────────────
router_relatorios = APIRouter(prefix="/relatorios", tags=["Relatórios"])


@router_relatorios.post("/gerar", response_model=RelatorioOut, status_code=201)
def gerar_relatorio(
    dados: RelatorioCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    parcerias = (
        db.query(Parceria)
        .join(Oferta)
        .filter(
            Oferta.produtor_id == user_id,
            Parceria.status == StatusParceriaEnum.concluida,
            Parceria.data_coleta >= dados.periodo_inicio,
            Parceria.data_coleta <= dados.periodo_fim,
        )
        .all()
    )
    total_kg = sum(p.quantidade_retirada for p in parcerias)
    relatorio = Relatorio(
        gerado_por_id=user_id,
        periodo_inicio=dados.periodo_inicio,
        periodo_fim=dados.periodo_fim,
        total_kg_salvos=total_kg,
        total_co2_evitado=round(total_kg * 2.5, 2),
        valor_economizado=round(total_kg * 4.5, 2),
        parceiros_envolvidos=len({p.receptor_id for p in parcerias}),
    )
    db.add(relatorio)
    db.commit()
    db.refresh(relatorio)
    return relatorio


@router_relatorios.get("/", response_model=List[RelatorioOut])
def meus_relatorios(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    return (
        db.query(Relatorio)
        .filter(Relatorio.gerado_por_id == user_id)
        .order_by(Relatorio.criado_em.desc())
        .all()
    )
