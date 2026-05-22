// ── PRODUTOS ──────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { produtoService } from '../services/api'
import { Plus, Package, Trash2, X } from 'lucide-react'

export function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nome:'', categoria:'', quantidade:'', unidade:'kg', data_validade:'' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))
  const load = () => produtoService.listar().then(r => setProdutos(r.data)).catch(()=>{})
  useEffect(() => { load() }, [])

  const criar = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await produtoService.criar({ ...form, quantidade: parseFloat(form.quantidade), data_validade: form.data_validade || null })
      setShowModal(false); setForm({ nome:'', categoria:'', quantidade:'', unidade:'kg', data_validade:'' }); load()
    } finally { setLoading(false) }
  }

  const statusColor = s => ({ disponivel:'badge-green', reservado:'badge-orange', doado:'badge-blue', expirado:'badge-gray' })[s] || 'badge-gray'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-primary-700">Meus Produtos</h1><p className="text-gray-500 text-sm mt-1">Gerencie seu estoque de excedentes</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Novo Produto</button>
      </div>
      <div className="space-y-3">
        {produtos.length === 0 ? (
          <div className="card text-center py-10 text-gray-400"><Package className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>Nenhum produto cadastrado</p></div>
        ) : produtos.map(p => (
          <div key={p.id} className="card flex items-center gap-4">
            <div className="flex-1">
              <div className="flex gap-2 mb-1"><span className={statusColor(p.status)}>{p.status}</span>{p.categoria && <span className="badge-gray">{p.categoria}</span>}</div>
              <p className="font-semibold text-gray-800">{p.nome}</p>
              <p className="text-sm text-gray-500">{p.quantidade} {p.unidade}{p.data_validade && ` · Val: ${new Date(p.data_validade).toLocaleDateString('pt-BR')}`}</p>
            </div>
            <button onClick={() => produtoService.remover(p.id).then(load)} className="text-gray-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-primary-700">Novo Produto</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <form onSubmit={criar} className="space-y-4">
              <div><label className="label">Nome</label><input className="input" value={form.nome} onChange={set('nome')} required /></div>
              <div><label className="label">Categoria</label><input className="input" placeholder="Ex: Frutas, Legumes" value={form.categoria} onChange={set('categoria')} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Quantidade</label><input className="input" type="number" min="0.1" step="0.1" value={form.quantidade} onChange={set('quantidade')} required /></div>
                <div><label className="label">Unidade</label><select className="input" value={form.unidade} onChange={set('unidade')}><option value="kg">kg</option><option value="unidade">unidade</option><option value="caixa">caixa</option></select></div>
              </div>
              <div><label className="label">Data de validade</label><input className="input" type="datetime-local" value={form.data_validade} onChange={set('data_validade')} /></div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Salvando...' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
