import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usuarioService } from '../services/api'
import { User, MapPin, Phone, Save, CheckCircle } from 'lucide-react'

export default function Perfil() {
  const { user, login } = useAuth()
  const [form, setForm] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || '',
    localizacao: user?.localizacao || '',
  })
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const salvar = async e => {
    e.preventDefault()
    setLoading(true); setErro(''); setSucesso(false)
    try {
      await usuarioService.atualizar(form)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao salvar')
    } finally { setLoading(false) }
  }

  const perfilLabel = { produtor: 'Produtor Rural', ong: 'ONG / Banco de Alimentos', varejo: 'Supermercado / Varejo', admin: 'Administrador' }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Meu Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Atualize suas informações e endereço</p>
      </div>

      {/* Card info */}
      <div className="card mb-6 flex items-center gap-4">
        <div className="w-14 h-14 bg-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-800 text-lg">{user?.nome}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full capitalize">
            {perfilLabel[user?.perfil] || user?.perfil}
          </span>
        </div>
      </div>

      {/* Formulário */}
      <div className="card">
        <form onSubmit={salvar} className="space-y-5">
          <div>
            <label className="label flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" /> Nome completo
            </label>
            <input className="input" value={form.nome} onChange={set('nome')} required />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> Telefone
            </label>
            <input className="input" placeholder="(11) 99999-9999" value={form.telefone} onChange={set('telefone')} />
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> Endereço / Localização
            </label>
            <input
              className="input"
              placeholder="Ex: Rua das Flores, 123, São Paulo, SP"
              value={form.localizacao}
              onChange={set('localizacao')}
            />
            <p className="text-xs text-gray-400 mt-1">
              Este endereço será usado para calcular a distância até as ofertas no mapa.
            </p>
          </div>

          {erro && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{erro}</div>}

          {sucesso && (
            <div className="bg-green-50 text-green-700 text-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Perfil atualizado com sucesso!
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
