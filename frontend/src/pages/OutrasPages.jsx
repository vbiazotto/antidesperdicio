import { useEffect, useState } from 'react'
import { parceriaService, notificacaoService, relatorioService } from '../services/api'
import { Handshake, Bell, BarChart2, Leaf, DollarSign, Users, Wind } from 'lucide-react'

const statusBadge = { pendente:'badge-orange', confirmada:'badge-blue', concluida:'badge-green', cancelada:'badge-gray' }

export function Parcerias() {
  const [parcerias, setParcerias] = useState([])
  const load = () => parceriaService.minhas().then(r => setParcerias(r.data)).catch(()=>{})
  useEffect(() => { load() }, [])

  const atualizar = async (id, status) => {
    const dados = { status }
    if (status === 'concluida') dados.data_coleta = new Date().toISOString()
    await parceriaService.atualizar(id, dados).catch(()=>{})
    load()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-primary-700">Minhas Coletas</h1><p className="text-gray-500 text-sm mt-1">Acompanhe as solicitações</p></div>
      <div className="space-y-3">
        {parcerias.length === 0 ? (
          <div className="card text-center py-10 text-gray-400"><Handshake className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Nenhuma coleta registrada</p></div>
        ) : parcerias.map(p => (
          <div key={p.id} className="card flex items-center justify-between gap-4">
            <div>
              <span className={statusBadge[p.status] || 'badge-gray'}>{p.status}</span>
              <p className="font-semibold text-gray-800 mt-1">Oferta #{p.oferta_id}</p>
              <p className="text-sm text-gray-500">{p.quantidade_retirada} unidades{p.data_coleta && ` · ${new Date(p.data_coleta).toLocaleDateString('pt-BR')}`}</p>
            </div>
            <div className="flex gap-2">
              {p.status === 'pendente' && <button onClick={() => atualizar(p.id, 'confirmada')} className="btn-secondary text-sm py-1.5">Confirmar</button>}
              {p.status === 'confirmada' && <button onClick={() => atualizar(p.id, 'concluida')} className="btn-primary text-sm py-1.5">Concluir</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Notificacoes() {
  const [notifs, setNotifs] = useState([])
  const load = () => notificacaoService.listar().then(r => setNotifs(r.data)).catch(()=>{})
  useEffect(() => { load() }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-primary-700">Notificações</h1></div>
      <div className="space-y-3">
        {notifs.length === 0 ? (
          <div className="card text-center py-10 text-gray-400"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Nenhuma notificação</p></div>
        ) : notifs.map(n => (
          <div key={n.id} className={`card flex items-start justify-between gap-4 ${!n.lida ? 'border-l-4 border-primary-500' : ''}`}>
            <div className="flex-1">
              <p className="font-semibold text-sm">{n.titulo}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.corpo}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.enviada_em).toLocaleString('pt-BR')}</p>
            </div>
            {!n.lida && <button onClick={() => notificacaoService.marcarLida(n.id).then(load)} className="text-xs text-primary-600 hover:underline">Marcar lida</button>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Relatorios() {
  const [relatorios, setRelatorios] = useState([])
  const [form, setForm] = useState({ periodo_inicio:'', periodo_fim:'' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const load = () => relatorioService.listar().then(r => setRelatorios(r.data)).catch(()=>{})
  useEffect(() => { load() }, [])

  const gerar = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await relatorioService.gerar({ periodo_inicio: new Date(form.periodo_inicio).toISOString(), periodo_fim: new Date(form.periodo_fim).toISOString() })
      setMsg('Relatório gerado!'); load()
    } catch { setMsg('Erro ao gerar') } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-primary-700">Relatórios de Impacto</h1></div>
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Gerar Relatório</h2>
        <form onSubmit={gerar} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-40"><label className="label">Data inicial</label><input className="input" type="date" value={form.periodo_inicio} onChange={e => setForm(f => ({...f, periodo_inicio: e.target.value}))} required /></div>
          <div className="flex-1 min-w-40"><label className="label">Data final</label><input className="input" type="date" value={form.periodo_fim} onChange={e => setForm(f => ({...f, periodo_fim: e.target.value}))} required /></div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2"><BarChart2 className="w-4 h-4" />{loading ? 'Gerando...' : 'Gerar'}</button>
        </form>
        {msg && <p className="text-green-600 text-sm mt-2">{msg}</p>}
      </div>
      <div className="space-y-4">
        {relatorios.map(r => (
          <div key={r.id} className="card">
            <p className="text-sm text-gray-400 mb-3">{new Date(r.periodo_inicio).toLocaleDateString('pt-BR')} — {new Date(r.periodo_fim).toLocaleDateString('pt-BR')}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Leaf,       color:'bg-green-100 text-green-600',  val:`${r.total_kg_salvos.toFixed(1)} kg`, label:'Alimentos salvos' },
                { icon: Wind,       color:'bg-blue-100 text-blue-600',    val:`${r.total_co2_evitado.toFixed(1)} kg`, label:'CO₂ evitado' },
                { icon: DollarSign, color:'bg-orange-100 text-orange-600',val:`R$ ${r.valor_economizado.toFixed(2)}`, label:'Economizado' },
                { icon: Users,      color:'bg-purple-100 text-purple-600',val:r.parceiros_envolvidos, label:'Parceiros' },
              ].map(({ icon: Icon, color, val, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`${color} p-2 rounded-lg`}><Icon className="w-5 h-5" /></div>
                  <div><p className="text-lg font-bold text-gray-800">{val}</p><p className="text-xs text-gray-500">{label}</p></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
