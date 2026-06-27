import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { piano, userId, email } = body

    if (!piano || !userId || !email) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 })
    }

    const priceMap: Record<string, string> = {
      mensile: process.env.STRIPE_PRICE_MENSILE as string,
      trimestrale: process.env.STRIPE_PRICE_TRIMESTRALE as string,
      annuale: process.env.STRIPE_PRICE_ANNUALE as string,
    }

    const priceId = priceMap[piano]
    if (!priceId) {
      return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/premium/successo?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/premium`,
      metadata: { userId, piano },
      subscription_data: {
        metadata: { userId, piano }
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Errore Stripe:', error)
    return NextResponse.json({ error: 'Errore nella creazione del pagamento' }, { status: 500 })
  }
}
