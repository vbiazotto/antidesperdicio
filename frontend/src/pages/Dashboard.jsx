import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { produtoService, ofertaService, parceriaService } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Package, Tag, Handshake, Leaf } from 'lucide-react'

const COLORS = ['#1B4332','#52B788','#E76F51','#F4A261']

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ produtos: 0, ofertas: 0, parcerias: 0, kgSalvos: 0 })
  const [barData, setBarData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [prods, ofertas, parcerias] = await Promise.all([
          produtoService.listar(), ofertaService.listar(), parceriaService.minhas()
        ])
        const kgSalvos = parcerias.data.filter(p => p.status === 'concluida').reduce((s, p) => s + p.quantidade_retirada, 0)
        setStats({ produtos: prods.data.length, ofertas: ofertas.data.length, parcerias: parcerias.data.length, kgSalvos: kgSalvos.toFixed(1) })
        const statusCount = parcerias.data.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc }, {})
        setBarData(Object.entries(statusCount).map(([name, valor]) => ({ name, valor })))
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  const cards = [
    { label: 'Produtos',  value: stats.produtos,  icon: Package,  color: 'bg-primary-700' },
    { label: 'Ofertas',   value: stats.ofertas,   icon: Tag,      color: 'bg-primary-600' },
    { label: 'Coletas',   value: stats.parcerias, icon: Handshake,color: 'bg-accent'      },
    { label: 'Kg Salvos', value: stats.kgSalvos,  icon: Leaf,     color: 'bg-green-600'   },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-700">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Bem-vindo, <strong>{user?.nome}</strong>!</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${color} rounded-xl p-3`}><Icon className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{loading ? '—' : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Coletas por Status</h2>
          {barData.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">Nenhuma coleta ainda</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="valor" fill="#1B4332" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card bg-primary-700 text-white">
          <p className="text-primary-100 text-sm">Impacto Ambiental Estimado</p>
          <p className="text-4xl font-bold mt-2">{loading ? '—' : (stats.kgSalvos * 2.5).toFixed(1)} kg</p>
          <p className="text-primary-100 text-sm mt-1">de CO₂ evitado com suas coletas</p>
          <Leaf className="w-12 h-12 text-primary-600 opacity-50 mt-4" />
        </div>
      </div>
    </div>
  )
}
