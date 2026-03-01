const stripe = require('stripe')('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');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Získání dat z těla požadavku (včetně dopravy a zákazníka)
        const { items, customer, shipping_rate } = JSON.parse(event.body);

        // 2. Vytvoření Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            // Předvyplníme e-mail, který zákazník zadal v pokladně
            customer_email: customer ? customer.email : undefined,
            line_items: items.map(item => ({
                price: item.price,
                quantity: item.quantity,
            })),
            mode: 'payment',
            // 3. Přidání vybrané dopravy
            shipping_options: [
                {
                    shipping_rate: shipping_rate, // ID začínající na shr_...
                },
            ],
            // Pokud chceš, aby Stripe posbíral i fakturační adresu sám pro jistotu:
            billing_address_collection: 'auto',
            
            // Adresy pro návrat (localhost:8888 je port pro Netlify Dev)
            success_url: `${process.env.URL || 'http://localhost:8888'}/dekujeme/`,
            cancel_url: `${process.env.URL || 'http://localhost:8888'}/pokladna/`,
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