import type { Context } from '@netlify/functions';
import Stripe from 'stripe';

// Creates a Stripe Checkout Session for the "Essencial" or "Rede"
// subscription plan and returns its hosted URL. The frontend
// (public/js/app.js) redirects the browser to that URL.
//
// Required environment variables (set in Netlify: Site configuration ->
// Environment variables — never commit real values to the repo):
//   STRIPE_SECRET_KEY        sk_live_... or sk_test_...
//   STRIPE_PRICE_ESSENCIAL   price_... for the "Essencial" recurring price
//   STRIPE_PRICE_REDE        price_... for the "Rede" recurring price
//
// Both prices are recurring (monthly) Prices in the Stripe Dashboard under
// Products. Trials are granted without requiring a card upfront
// (payment_method_collection: 'if_required'), matching the landing page's
// "7 dias grátis, sem cartão" offer.

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 });
  }

  const secretKey = Netlify.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    return Response.json(
      { error: 'STRIPE_SECRET_KEY não configurada no ambiente da função.' },
      { status: 500 }
    );
  }

  const PRICE_IDS: Record<string, string | undefined> = {
    essencial: Netlify.env.get('STRIPE_PRICE_ESSENCIAL'),
    rede: Netlify.env.get('STRIPE_PRICE_REDE'),
  };

  let payload: { plan?: string; email?: string };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  const { plan, email } = payload;
  const priceId = plan ? PRICE_IDS[plan] : undefined;
  if (!priceId) {
    return Response.json(
      { error: `Plano "${plan}" não configurado. Defina STRIPE_PRICE_${String(plan).toUpperCase()} no ambiente.` },
      { status: 400 }
    );
  }

  const stripe = new Stripe(secretKey);
  const origin = req.headers.get('origin') || new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      payment_method_collection: 'if_required',
      customer_email: email || undefined,
      allow_promotion_codes: true,
      success_url: `${origin}/sucesso.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#precos`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao criar sessão de checkout.';
    return Response.json({ error: message }, { status: 500 });
  }
};
