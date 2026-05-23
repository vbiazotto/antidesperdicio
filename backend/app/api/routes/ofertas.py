from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Produto, Oferta, Usuario, StatusOfertaEnum
from app.schemas.schemas import ProdutoCreate, ProdutoOut, OfertaCreate, OfertaOut, OfertaOutDetalhada
from app.core.security import get_current_user_id

# ── Produtos ──────────────────────────────────────────────────────────────────
router_produtos = APIRouter(prefix="/produtos", tags=["Produtos"])

@router_produtos.post("/", response_model=ProdutoOut, status_code=201)
def criar_produto(dados: ProdutoCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    produto = Produto(**dados.model_dump(), usuario_id=user_id)
    db.add(produto); db.commit(); db.refresh(produto)
    return produto

@router_produtos.get("/", response_model=List[ProdutoOut])
def listar_meus_produtos(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return db.query(Produto).filter(Produto.usuario_id == user_id).all()

@router_produtos.get("/{produto_id}", response_model=ProdutoOut)
def detalhar_produto(produto_id: int, db: Session = Depends(get_db)):
    produto = db.get(Produto, produto_id)
    if not produto: raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router_produtos.delete("/{produto_id}", status_code=204)
def remover_produto(produto_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    produto = db.get(Produto, produto_id)
    if not produto or produto.usuario_id != user_id: raise HTTPException(status_code=404, detail="Produto não encontrado ou sem permissão")
    db.delete(produto); db.commit()

# ── Ofertas ───────────────────────────────────────────────────────────────────
router_ofertas = APIRouter(prefix="/ofertas", tags=["Ofertas"])

@router_ofertas.post("/", response_model=OfertaOut, status_code=201)
def criar_oferta(dados: OfertaCreate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    produto = db.get(Produto, dados.produto_id)
    if not produto or produto.usuario_id != user_id: raise HTTPException(status_code=404, detail="Produto não encontrado ou sem permissão")
    oferta = Oferta(**dados.model_dump(), produtor_id=user_id)
    db.add(oferta); db.commit(); db.refresh(oferta)
    return oferta

@router_ofertas.get("/", response_model=List[OfertaOutDetalhada])
def listar_ofertas(
    tipo: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Oferta)
    if tipo: query = query.filter(Oferta.tipo == tipo)
    if status: query = query.filter(Oferta.status == status)
    else: query = query.filter(Oferta.status == StatusOfertaEnum.ativa)
    ofertas = query.order_by(Oferta.criado_em.desc()).all()

    # Enriquece com dados do produtor
    result = []
    for o in ofertas:
        produtor = db.get(Usuario, o.produtor_id)
        item = OfertaOutDetalhada.model_validate(o)
        if produtor:
            item.localizacao_produtor = produtor.localizacao
            item.nome_produtor = produtor.nome
        result.append(item)
    return result

@router_ofertas.get("/{oferta_id}", response_model=OfertaOutDetalhada)
def detalhar_oferta(oferta_id: int, db: Session = Depends(get_db)):
    oferta = db.get(Oferta, oferta_id)
    if not oferta: raise HTTPException(status_code=404, detail="Oferta não encontrada")
    produtor = db.get(Usuario, oferta.produtor_id)
    item = OfertaOutDetalhada.model_validate(oferta)
    if produtor:
        item.localizacao_produtor = produtor.localizacao
        item.nome_produtor = produtor.nome
    return item

@router_ofertas.patch("/{oferta_id}/cancelar", response_model=OfertaOut)
def cancelar_oferta(oferta_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    oferta = db.get(Oferta, oferta_id)
    if not oferta or oferta.produtor_id != user_id: raise HTTPException(status_code=404, detail="Oferta não encontrada ou sem permissão")
    oferta.status = StatusOfertaEnum.expirada
    db.commit(); db.refresh(oferta)
    return oferta
