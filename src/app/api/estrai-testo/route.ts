import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nessun file ricevuto' }, { status: 400 })
    }

    const nomeFile = file.name.toLowerCase()
    const buffer = Buffer.from(await file.arrayBuffer())

    let testoEstratto = ''

    if (nomeFile.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      testoEstratto = data.text
    } else if (nomeFile.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer: buffer })
      testoEstratto = result.value
    } else if (nomeFile.endsWith('.txt')) {
      testoEstratto = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Formato file non supportato per ora. Usa PDF, DOCX o TXT' }, { status: 400 })
    }

    if (testoEstratto.length < 20) {
      return NextResponse.json({ error: 'Non e stato possibile estrarre testo da questo file' }, { status: 400 })
    }

    return NextResponse.json({ testo: testoEstratto.substring(0, 15000) })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella lettura del file: ' + String(error) }, { status: 500 })
  }
}
