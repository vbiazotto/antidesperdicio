import { useEffect, useState } from 'react'
import { ofertaService, produtoService, parceriaService } from '../services/api'
import { Plus, Tag, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const statusBadge = { ativa:'badge-green', reservada:'badge-orange', concluida:'badge-gray', expirada:'badge-gray' }

export default function Ofertas() {
  const { user } = useAuth()
  const [ofertas, setOfertas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [filtro, setFiltro] = useState('ativa')
  const [form, setForm] = useState({ produto_id:'', quantidade_disponivel:'', tipo:'doacao', preco:'' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const load = async () => {
    const [o, p] = await Promise.all([ofertaService.listar({ status: filtro }), produtoService.listar()])
    setOfertas(o.data); setProdutos(p.data)
  }
  useEffect(() => { load() }, [filtro])

  const criar = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await ofertaService.criar({ produto_id: parseInt(form.produto_id), quantidade_disponivel: parseFloat(form.quantidade_disponivel), tipo: form.tipo, preco: form.tipo === 'venda_desconto' ? parseFloat(form.preco) : null })
      setShowModal(false); setForm({ produto_id:'', quantidade_disponivel:'', tipo:'doacao', preco:'' }); load()
    } catch (err) { setMsg(err.response?.data?.detail || 'Erro ao criar oferta') } finally { setLoading(false) }
  }

  const solicitar = async (ofertaId, qtd) => {
    try { await parceriaService.solicitar({ oferta_id: ofertaId, quantidade_retirada: qtd }); setMsg('Coleta solicitada!'); load() }
    catch (err) { setMsg(err.response?.data?.detail || 'Erro') }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-primary-700">Ofertas</h1><p className="text-gray-500 text-sm mt-1">Publique ou encontre alimentos disponíveis</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Nova Oferta</button>
      </div>
      {msg && <div className="mb-4 bg-green-50 text-green-700 text-sm rounded-lg px-4 py-2 flex justify-between">{msg}<button onClick={() => setMsg('')}><X className="w-4 h-4" /></button></div>}
      <div className="flex gap-2 mb-4">
        {['ativa','reservada','concluida'].map(s => (
          <button key={s} onClick={() => setFiltro(s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filtro === s ? 'bg-primary-700 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {ofertas.length === 0 ? (
          <div className="card text-center py-10 text-gray-400"><Tag className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Nenhuma oferta encontrada</p></div>
        ) : ofertas.map(o => (
          <div key={o.id} className="card flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex gap-2 mb-1"><span className={statusBadge[o.status] || 'badge-gray'}>{o.status}</span><span className="badge-blue">{o.tipo === 'doacao' ? 'Doação' : 'Venda c/ desconto'}</span></div>
              <p className="font-semibold text-gray-800">Produto #{o.produto_id}</p>
              <p className="text-sm text-gray-500">{o.quantidade_disponivel} unidades{o.preco ? ` · R$ ${o.preco.toFixed(2)}` : ' · Gratuito'}</p>
            </div>
            {o.status === 'ativa' && o.produtor_id !== user?.id && (
              <button onClick={() => solicitar(o.id, o.quantidade_disponivel)} className="btn-accent text-sm py-1.5 px-3">Solicitar Coleta</button>
            )}
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-primary-700">Nova Oferta</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <form onSubmit={criar} className="space-y-4">
              <div><label className="label">Produto</label>
                <select className="input" value={form.produto_id} onChange={set('produto_id')} required>
                  <option value="">Selecione</option>
                  {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.quantidade} {p.unidade})</option>)}
                </select>
              </div>
              <div><label className="label">Tipo</label><select className="input" value={form.tipo} onChange={set('tipo')}><option value="doacao">Doação gratuita</option><option value="venda_desconto">Venda com desconto</option></select></div>
              <div><label className="label">Quantidade</label><input className="input" type="number" min="0.1" step="0.1" value={form.quantidade_disponivel} onChange={set('quantidade_disponivel')} required /></div>
              {form.tipo === 'venda_desconto' && <div><label className="label">Preço (R$)</label><input className="input" type="number" min="0.01" step="0.01" value={form.preco} onChange={set('preco')} required /></div>}
              {msg && <p className="text-red-500 text-sm">{msg}</p>}
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button><button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Salvando...' : 'Publicar'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
