const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Přidali jsme 'metadata', která posíláme z frontendu (VS, pobočka atd.)
        const { items, customer, shipping_rate, metadata } = JSON.parse(event.body);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: customer ? customer.email : undefined,
            line_items: items.map(item => ({
                price: item.price,
                quantity: item.quantity,
            })),
            mode: 'payment',
            shipping_options: [
                {
                    shipping_rate: shipping_rate,
                },
            ],
            // DŮLEŽITÉ: Tady předáváme info o pobočce a VS do Stripe, 
            // aby si je mohl přečíst webhook a poslat je v e-mailu.
            metadata: {
                vs: metadata.vs,
                pobocka: metadata.pobocka,
                doprava: metadata.doprava,
                email: customer.email,
                phone: customer.phone,
                billing_name: `${customer.billing_first_name} ${customer.billing_last_name}`
            },
            
            // ÚPRAVA: Přidáme do URL session_id, aby děkovná stránka věděla, že má smazat košík
            success_url: `https://pekseso.cz/dekujeme/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://pekseso.cz/pokladna/`,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ url: session.url }),
        };
    } catch (error) {
        console.error("Stripe Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};