export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600">StudyNotes</span>
        <div className="flex gap-4">
          <button className="text-gray-600 hover:text-blue-600 text-sm">Accedi</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Registrati gratis
          </button>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-4 py-24">
        <span className="bg-blue-50 text-blue-600 text-sm px-4 py-1 rounded-full mb-6">
          📚 La piattaforma degli studenti italiani
        </span>
        <h1 className="text-5xl font-bold text-gray-900 max-w-3xl leading-tight mb-6">
          Condividi appunti, studia con l&apos;AI, trova il tuo tutor
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10">
          Carica i tuoi appunti, guadagna vendendo quelli che non usi,
          e lascia che l&apos;AI crei quiz e flashcard per te.
        </p>
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700">
            Inizia gratis
          </button>
          <button className="border border-gray-200 text-gray-700 px-8 py-3 rounded-lg text-lg hover:bg-gray-50">
            Scopri come funziona
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-16 py-16 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <div className="text-3xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">Vendi i tuoi appunti</h3>
          <p className="text-gray-500 text-sm">Carica i tuoi appunti e guadagna ogni volta che qualcuno li scarica.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <div className="text-3xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold mb-2">AI che studia con te</h3>
          <p className="text-gray-500 text-sm">Carica un PDF e l&apos;AI genera quiz, flashcard e schemi in automatico.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-100">
          <div className="text-3xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold mb-2">Ripetizioni online</h3>
          <p className="text-gray-500 text-sm">Prenota videochiamate con studenti più esperti nella tua materia.</p>
        </div>
      </section>
    </main>
  )
}