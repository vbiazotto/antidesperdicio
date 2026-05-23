import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Copy, CheckCheck, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

async function geocodificar(endereco) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
    const data = await res.json()
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {}
  return null
}

function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)
}

export default function MapaOferta({ enderecoProdutor, enderecoUsuario }) {
  const [coordP, setCoordP] = useState(null)
  const [coordU, setCoordU] = useState(null)
  const [distancia, setDistancia] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    async function carregar() {
      setLoading(true); setErro(false)
      const cp = await geocodificar(enderecoProdutor)
      if (!cp) { setErro(true); setLoading(false); return }
      setCoordP(cp)
      if (enderecoUsuario) {
        const cu = await geocodificar(enderecoUsuario)
        if (cu) { setCoordU(cu); setDistancia(calcularDistancia(cp.lat, cp.lng, cu.lat, cu.lng)) }
      }
      setLoading(false)
    }
    if (enderecoProdutor) carregar()
  }, [enderecoProdutor, enderecoUsuario])

  const copiar = () => {
    navigator.clipboard.writeText(enderecoProdutor)
    setCopiado(true); setTimeout(() => setCopiado(false), 2000)
  }

  if (loading) return (
    <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Carregando mapa...
      </div>
    </div>
  )

  if (erro || !coordP) return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <p className="text-gray-500 text-sm">📍 {enderecoProdutor}</p>
      <p className="text-xs text-gray-400 mt-1">Endereço não encontrado no mapa.</p>
    </div>
  )

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden border border-gray-200 h-52">
        <MapContainer center={[coordP.lat, coordP.lng]} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[coordP.lat, coordP.lng]}>
            <Popup><strong>📦 Produtor</strong><br />{enderecoProdutor}</Popup>
          </Marker>
          {coordU && (
            <Marker position={[coordU.lat, coordU.lng]}>
              <Popup><strong>📍 Você</strong><br />{enderecoUsuario}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Navigation className="w-4 h-4 text-primary-600 flex-shrink-0" />
          <p className="text-sm text-gray-600 truncate">{enderecoProdutor}</p>
          <button onClick={copiar} className="flex-shrink-0 text-gray-400 hover:text-primary-600 transition-colors" title="Copiar endereço">
            {copiado ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        {distancia && <span className="badge-green text-xs">📏 {distancia} km de distância</span>}
      </div>
    </div>
  )
}
