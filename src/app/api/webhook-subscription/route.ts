import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature non valida' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const piano = session.metadata?.piano
      const subscriptionId = session.subscription as string

      if (userId && piano) {
        const scadenza = new Date()
        if (piano === 'mensile') scadenza.setMonth(scadenza.getMonth() + 1)
        else if (piano === 'trimestrale') scadenza.setMonth(scadenza.getMonth() + 3)
        else if (piano === 'annuale') scadenza.setFullYear(scadenza.getFullYear() + 1)

        await supabase.from('profiles').update({
          piano_premium: piano,
          premium_attivo: true,
          premium_scadenza: scadenza.toISOString(),
          stripe_subscription_id: subscriptionId
        }).eq('id', userId)

        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifica`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            utente_id: userId,
            tipo: 'acquisto',
            titolo: '👑 Benvenuto in Klass Premium!',
            messaggio: `Il tuo piano ${piano} è attivo. Goditi tutte le funzionalità senza limiti!`,
            link: '/premium'
          })
        })
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId

      if (userId) {
        await supabase.from('profiles').update({
          piano_premium: null,
          premium_attivo: false,
          premium_scadenza: null,
          stripe_subscription_id: null
        }).eq('id', userId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel webhook' }, { status: 500 })
  }
}
