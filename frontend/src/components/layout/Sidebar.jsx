import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Package, Tag, Handshake, Bell, BarChart2, MessageCircle, LogOut, Leaf, UserCircle } from 'lucide-react'
import { notificacaoService } from '../../services/api'
import { usePolling } from '../../hooks/usePolling'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [naoLidas, setNaoLidas] = useState(0)

  const carregarNotifs = async () => {
    try {
      const r = await notificacaoService.listar()
      setNaoLidas(r.data.filter(n => !n.lida).length)
    } catch {}
  }

  useEffect(() => { carregarNotifs() }, [])
  usePolling(carregarNotifs, 10000)

  const nav = [
    { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
    { to: '/produtos',     icon: Package,         label: 'Meus Produtos' },
    { to: '/ofertas',      icon: Tag,             label: 'Ofertas'       },
    { to: '/parcerias',    icon: Handshake,       label: 'Coletas'       },
    { to: '/notificacoes', icon: Bell,            label: 'Notificações', badge: naoLidas },
    { to: '/relatorios',   icon: BarChart2,       label: 'Relatórios'    },
    { to: '/chatbot',      icon: MessageCircle,   label: 'AgroBot IA'    },
    { to: '/perfil',       icon: UserCircle,      label: 'Meu Perfil'    },
  ]

  return (
    <aside className="w-60 min-h-screen bg-primary-700 flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-primary-600">
        <Leaf className="text-primary-500 w-7 h-7" />
        <div>
          <p className="text-white font-bold text-sm">Anti-Desperdício</p>
          <p className="text-primary-500 text-xs">de Alimentos</p>
        </div>
      </div>
      <div className="px-5 py-4 border-b border-primary-600">
        <p className="text-white text-sm font-semibold truncate">{user?.nome}</p>
        <span className="inline-block mt-1 text-xs bg-primary-600 text-primary-100 px-2 py-0.5 rounded-full capitalize">{user?.perfil}</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-primary-100 hover:bg-primary-600 hover:text-white'}`
          }>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-primary-600">
        <button onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:bg-primary-600 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  )
}
