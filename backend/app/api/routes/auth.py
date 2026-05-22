from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Usuario
from app.schemas.schemas import Token, UsuarioCreate, UsuarioOut
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=UsuarioOut, status_code=201)
def registrar(dados: UsuarioCreate, db: Session = Depends(get_db)):
    """Cria uma nova conta de usuário."""
    if db.query(Usuario).filter(Usuario.email == dados.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    usuario = Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=hash_password(dados.senha),
        perfil=dados.perfil,
        telefone=dados.telefone,
        localizacao=dados.localizacao,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Autentica e retorna token JWT."""
    usuario = db.query(Usuario).filter(Usuario.email == form.username).first()
    if not usuario or not verify_password(form.password, usuario.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos")
    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Conta desativada")
    token = create_access_token({"sub": str(usuario.id), "perfil": usuario.perfil})
    return {"access_token": token, "token_type": "bearer"}
