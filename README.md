# 🌱 Plataforma Anti-Desperdício de Alimentos

Sistema completo para conectar produtores, ONGs e varejos na redistribuição de excedentes alimentares, com assistente virtual inteligente (AgroBot).

---

## 🔗 Links do Projeto

| Serviço | URL |
|---------|-----|
| **Frontend (Netlify)** | https://antidesperdicio.netlify.app |
| **API / Backend (Railway)** | https://antidesperdicio-production.up.railway.app |
| **Documentação da API (Swagger)** | https://antidesperdicio-production.up.railway.app/docs |
| **Repositório GitHub** | https://github.com/vbiazotto/antidesperdicio |

---

## 👤 Logins de Teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | admin@antidesperdicio.com | admin123 |
| Produtor | produtor@teste.com | 123456 |
| ONG | ong@teste.com | 123456 |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando

### 1. Clone o repositório
```bash
git clone https://github.com/vbiazotto/antidesperdicio.git
cd antidesperdicio
```

### 2. Suba tudo com um comando
```bash
docker compose up --build
```

Aguarde os containers subirem (primeira vez pode demorar ~2 min).

### 3. Acesse o sistema

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **API Docs** | http://localhost:8000/docs |

---

## 🤖 Ativar o AgroBot com IA real (opcional)

Por padrão o chatbot funciona em **modo demo** com respostas pré-definidas.

Para ativar com IA real (OpenAI):

1. Abra `backend/.env`
2. Adicione sua chave:
```
OPENAI_API_KEY=sk-...sua-chave-aqui...
```
3. Reinicie o backend:
```bash
docker compose restart backend
```

---

## 📁 Estrutura do projeto

```
antidesperdicio/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .env
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── core/          # Config e segurança (JWT)
│       ├── db/            # Conexão com banco
│       ├── models/        # Tabelas (SQLAlchemy)
│       ├── schemas/       # Validação (Pydantic)
│       └── api/routes/    # Endpoints REST
└── frontend/
    ├── Dockerfile
    └── src/
        ├── pages/         # Telas da aplicação
        ├── components/    # Componentes reutilizáveis
        ├── services/      # Chamadas ao backend
        └── contexts/      # Estado global (auth)
```

---

## 🗂️ Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Criar conta |
| POST | /api/auth/login | Login (retorna JWT) |
| GET  | /api/usuarios/me | Meu perfil |
| POST | /api/produtos/ | Cadastrar produto |
| GET  | /api/ofertas/ | Listar ofertas |
| POST | /api/parcerias/ | Solicitar coleta |
| POST | /api/relatorios/gerar | Gerar relatório |
| POST | /api/chatbot/mensagem | Enviar mensagem ao AgroBot |

---

## 🛑 Parar o projeto

```bash
docker compose down
```

Para parar **e apagar o banco local**:
```bash
docker compose down -v
```
