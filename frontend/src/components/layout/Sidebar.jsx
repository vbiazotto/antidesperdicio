import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Package, Tag, Handshake, Bell, BarChart2, MessageCircle, LogOut, Leaf, UserCircle } from 'lucide-react'

const nav = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/produtos',     icon: Package,         label: 'Meus Produtos' },
  { to: '/ofertas',      icon: Tag,             label: 'Ofertas'       },
  { to: '/parcerias',    icon: Handshake,       label: 'Coletas'       },
  { to: '/notificacoes', icon: Bell,            label: 'Notificações'  },
  { to: '/relatorios',   icon: BarChart2,       label: 'Relatórios'    },
  { to: '/chatbot',      icon: MessageCircle,   label: 'AgroBot IA'    },
  { to: '/perfil',       icon: UserCircle,      label: 'Meu Perfil'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-primary-100 hover:bg-primary-600 hover:text-white'}`
          }>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
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
