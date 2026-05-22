# 🌱 Plataforma Anti-Desperdício de Alimentos

Sistema completo para conectar produtores, ONGs e varejos na redistribuição de excedentes alimentares, com assistente virtual inteligente (AgroBot).

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando

### 1. Clone ou extraia o projeto
```
antidesperdicio/
├── backend/
├── frontend/
└── docker-compose.yml
```

### 2. Suba tudo com um comando
```bash
docker compose up --build
```

Aguarde os containers subirem (primeira vez pode demorar ~2 min para baixar as imagens).

### 3. Acesse o sistema

| Serviço | URL |
|---------|-----|
| **Frontend** (interface web) | http://localhost:3000 |
| **API** (documentação Swagger) | http://localhost:8000/docs |
| **Banco de dados** | localhost:5432 |

---

## 🤖 Ativar o AgroBot com IA real (opcional)

Por padrão o chatbot funciona em **modo demo** com respostas pré-definidas.

Para ativar com IA real (OpenAI):

1. Abra o arquivo `backend/.env`
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
├── docker-compose.yml          # Orquestra todos os serviços
├── backend/
│   ├── Dockerfile
│   ├── .env                    # Configurações (banco, JWT, IA)
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # Entrypoint FastAPI
│       ├── core/               # Config e segurança (JWT)
│       ├── db/                 # Conexão com banco
│       ├── models/             # Tabelas (SQLAlchemy)
│       ├── schemas/            # Validação (Pydantic)
│       └── api/routes/         # Endpoints REST
│           ├── auth.py         # Login e registro
│           ├── usuarios.py     # Perfil
│           ├── ofertas.py      # Produtos e ofertas
│           ├── parcerias.py    # Coletas, notificações, relatórios
│           └── chatbot.py      # AgroBot IA
└── frontend/
    ├── Dockerfile
    ├── src/
    │   ├── pages/              # Telas da aplicação
    │   ├── services/api.js     # Chamadas ao backend
    │   └── contexts/           # Estado global (auth)
    └── package.json
```

---

## 🗂️ Endpoints principais da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Criar conta |
| POST | /api/auth/login | Login (retorna JWT) |
| GET | /api/usuarios/me | Meu perfil |
| POST | /api/produtos/ | Cadastrar produto |
| GET | /api/ofertas/ | Listar ofertas |
| POST | /api/parcerias/ | Solicitar coleta |
| POST | /api/relatorios/gerar | Gerar relatório |
| POST | /api/chatbot/mensagem | Enviar mensagem ao AgroBot |

Documentação completa em: **http://localhost:8000/docs**

---

## 🛑 Parar o projeto

```bash
docker compose down
```

Para parar **e apagar o banco de dados**:
```bash
docker compose down -v
```
