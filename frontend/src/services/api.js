import axios from 'axios'

const api = axios.create({ baseURL: 'http://192.168.1.15:8000/api', headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authService = {
  login: (email, senha) => api.post('/auth/login',
    new URLSearchParams({ username: email, password: senha }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ),
  register: (dados) => api.post('/auth/register', dados),
}

export const usuarioService = {
  me: () => api.get('/usuarios/me'),
  atualizar: (dados) => api.put('/usuarios/me', dados),
}

export const produtoService = {
  listar: () => api.get('/produtos/'),
  criar: (dados) => api.post('/produtos/', dados),
  remover: (id) => api.delete(`/produtos/${id}`),
}

export const ofertaService = {
  listar: (params) => api.get('/ofertas/', { params }),
  criar: (dados) => api.post('/ofertas/', dados),
  cancelar: (id) => api.patch(`/ofertas/${id}/cancelar`),
}

export const parceriaService = {
  solicitar: (dados) => api.post('/parcerias/', dados),
  minhas: () => api.get('/parcerias/minhas'),
  atualizar: (id, dados) => api.patch(`/parcerias/${id}`, dados),
}

export const notificacaoService = {
  listar: () => api.get('/notificacoes/'),
  marcarLida: (id) => api.patch(`/notificacoes/${id}/lida`),
}

export const relatorioService = {
  gerar: (dados) => api.post('/relatorios/gerar', dados),
  listar: () => api.get('/relatorios/'),
}

export const chatbotService = {
  novaSessao: () => api.get('/chatbot/nova-sessao'),
  enviar: (dados) => api.post('/chatbot/mensagem', dados),
  historico: (sessaoId) => api.get(`/chatbot/historico/${sessaoId}`),
}

export default api
