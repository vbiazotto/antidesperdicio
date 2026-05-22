import { useState, useEffect, useRef } from 'react'
import { chatbotService } from '../services/api'
import { Send, Bot, User, RefreshCw } from 'lucide-react'

export default function Chatbot() {
  const [sessaoId, setSessaoId] = useState('')
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { iniciar() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const iniciar = async () => {
    try {
      const res = await chatbotService.novaSessao()
      setSessaoId(res.data.sessao_id)
      setMsgs([{ tipo:'saida', conteudo:'Olá! Sou o **AgroBot** 🌱. Como posso ajudar você hoje?' }])
    } catch { setSessaoId('demo-' + Date.now()) }
  }

  const enviar = async e => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const texto = input.trim(); setInput('')
    setMsgs(m => [...m, { tipo:'entrada', conteudo: texto }])
    setLoading(true)
    try {
      const res = await chatbotService.enviar({ conteudo: texto, sessao_id: sessaoId })
      setMsgs(m => [...m, { tipo:'saida', conteudo: res.data.resposta, intencao: res.data.intencao }])
    } catch {
      setMsgs(m => [...m, { tipo:'saida', conteudo:'Desculpe, não consegui processar. Tente novamente.' }])
    } finally { setLoading(false) }
  }

  const renderTexto = t => t.split(/\*\*(.*?)\*\*/g).map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)

  const sugestoes = ['Como cadastrar um produto?', 'Como publicar uma oferta?', 'Como encontrar parceiros?', 'Como gerar um relatório?']

  return (
    <div className="p-6 max-w-3xl mx-auto h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center"><Bot className="w-5 h-5 text-primary-500" /></div>
          <div><h1 className="text-lg font-bold text-primary-700">AgroBot IA</h1><p className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online</p></div>
        </div>
        <button onClick={() => { setMsgs([]); iniciar() }} className="btn-secondary text-sm flex items-center gap-2 py-1.5"><RefreshCw className="w-3.5 h-3.5" /> Nova conversa</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.tipo === 'entrada' ? 'justify-end' : 'justify-start'}`}>
            {m.tipo === 'saida' && <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"><Bot className="w-3.5 h-3.5 text-white" /></div>}
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.tipo === 'entrada' ? 'bg-primary-700 text-white rounded-br-sm' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'}`}>
              {renderTexto(m.conteudo)}
              {m.intencao && m.tipo === 'saida' && <span className="block mt-1 text-xs text-gray-400">intenção: {m.intencao.replace(/_/g,' ')}</span>}
            </div>
            {m.tipo === 'entrada' && <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-1"><User className="w-3.5 h-3.5 text-gray-500" /></div>}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center mr-2"><Bot className="w-3.5 h-3.5 text-white" /></div>
            <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {msgs.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {sugestoes.map(s => <button key={s} onClick={() => setInput(s)} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-primary-500 hover:text-primary-700 transition-colors">{s}</button>)}
        </div>
      )}

      <form onSubmit={enviar} className="flex gap-2">
        <input className="input flex-1" placeholder="Digite sua mensagem..." value={input} onChange={e => setInput(e.target.value)} disabled={loading} />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  )
}
