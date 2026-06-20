import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const noteId = body.noteId
    const titolo = body.titolo
    const prezzo = body.prezzo
    const fileUrl = body.fileUrl
    const buyerId = body.buyerId

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: titolo,
            },
            unit_amount: Math.round(prezzo * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.NEXT_PUBLIC_SITE_URL + '/esplora?success=true&noteId=' + noteId,
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL + '/esplora?canceled=true',
      metadata: {
        noteId: noteId,
        buyerId: buyerId,
        fileUrl: fileUrl
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nella creazione del pagamento' }, { status: 500 })
  }
}
