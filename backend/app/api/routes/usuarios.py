from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Usuario
from app.schemas.schemas import UsuarioOut, UsuarioUpdate
from app.core.security import get_current_user_id

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.get("/me", response_model=UsuarioOut)
def meu_perfil(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    usuario = db.get(Usuario, user_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario


@router.put("/me", response_model=UsuarioOut)
def atualizar_perfil(dados: UsuarioUpdate, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    usuario = db.get(Usuario, user_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    for campo, valor in dados.model_dump(exclude_none=True).items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return usuario
