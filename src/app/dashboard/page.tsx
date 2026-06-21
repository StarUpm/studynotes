'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <div className="flex gap-4 items-center">
          <Link href="/esplora" className="text-sm text-gray-500 hover:text-blue-600">Esplora appunti</Link>
          <Link href="/tutor" className="text-sm text-gray-500 hover:text-blue-600">Trova tutor</Link>
          <Link href="/modifica-profilo" className="text-sm text-gray-500 hover:text-blue-600">Il mio profilo</Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">Esci</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Benvenuto! 👋</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Appunti caricati</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Guadagni</p>
            <p className="text-3xl font-bold text-gray-900">€0</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Quiz completati</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">Ripetizioni</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link href="/upload" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 cursor-pointer block">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Carica appunti</h3>
            <p className="text-sm text-gray-500">Vendi i tuoi appunti e guadagna</p>
          </Link>
          <Link href="/esplora" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 cursor-pointer block">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Esplora appunti</h3>
            <p className="text-sm text-gray-500">Trova appunti di altri studenti</p>
          </Link>
          <Link href="/quiz" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 cursor-pointer block">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-2">Genera quiz AI</h3>
            <p className="text-sm text-gray-500">Crea quiz dai tuoi appunti</p>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/tutor" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 cursor-pointer block">
            <div className="text-3xl mb-4">🎓</div>
            <h3 className="font-semibold text-gray-900 mb-2">Trova un tutor</h3>
            <p className="text-sm text-gray-500">Prenota ripetizioni online</p>
          </Link>
          <Link href="/diventa-tutor" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 cursor-pointer block">
            <div className="text-3xl mb-4">👨‍🏫</div>
            <h3 className="font-semibold text-gray-900 mb-2">Diventa tutor</h3>
            <p className="text-sm text-gray-500">Offri ripetizioni e guadagna</p>
          </Link>
          <Link href="/sessioni" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 cursor-pointer block">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Le mie sessioni</h3>
            <p className="text-sm text-gray-500">Gestisci le tue prenotazioni</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
