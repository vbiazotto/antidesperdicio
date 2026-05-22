import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Leaf, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [modo, setModo] = useState('login')
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'produtor' })
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setErro(''); setLoading(true)
    try {
      modo === 'login' ? await login(form.email, form.senha) : await register(form)
      navigate('/dashboard')
    } catch (err) {
      setErro(err.response?.data?.detail || 'Erro ao processar. Verifique os dados.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-full mb-4">
            <Leaf className="w-7 h-7 text-primary-500" />
          </div>
          <h1 className="text-white text-2xl font-bold">Anti-Desperdício</h1>
          <p className="text-primary-100 text-sm mt-1">Plataforma de Alimentos</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setModo(m); setErro('') }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${modo === m ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-4">
            {modo === 'register' && <>
              <div><label className="label">Nome</label><input className="input" value={form.nome} onChange={set('nome')} required /></div>
              <div><label className="label">Perfil</label>
                <select className="input" value={form.perfil} onChange={set('perfil')}>
                  <option value="produtor">Produtor Rural</option>
                  <option value="ong">ONG / Banco de Alimentos</option>
                  <option value="varejo">Supermercado / Varejo</option>
                </select>
              </div>
            </>}
            <div><label className="label">E-mail</label><input className="input" type="email" value={form.email} onChange={set('email')} required /></div>
            <div><label className="label">Senha</label>
              <div className="relative">
                <input className="input pr-10" type={showSenha ? 'text' : 'password'} value={form.senha} onChange={set('senha')} required minLength={6} />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-2.5 text-gray-400">
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {erro && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{erro}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
