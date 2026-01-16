import type { Endpoint } from 'payload';

const SHOPIFY_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}.myshopify.com/api/2025-10/graphql.json`;
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// CORS headers helper
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

async function shopifyQuery(query: string, variables?: object) {
    if (!SHOPIFY_TOKEN) {
        throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured')
    }

    const response = await fetch(SHOPIFY_URL, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN
        },
        body: JSON.stringify({ query, variables })
    })

    if (!response) {
        throw new Error("No response from Shopify")
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Shopify HTTP Error:', response.status, errorText);
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    const json = await response.json()
    if (json.error) {
        console.error('Shopify Error:', json.errors);
        throw new Error(json.errors[0].message);
    }

    return json.data
}

export const shopifyCartEndpoints: Endpoint[] = [
    // OPTIONS handler for CORS preflight
    {
        path: "/shopify/cart/create",
        method: "options",
        handler: async () => {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
    },
    {
        path: "/shopify/cart/create",
        method: "post",
        handler: async (req) => {
            try {
                if (!req.json) {
                    return Response.json(
                        { error: "Invalid request" },
                        { status: 400, headers: corsHeaders }
                    );
                }
                const body = await req.json();
                const { lines } = body;

                const data = await shopifyQuery(`
                    mutation cartCreate($input: CartInput!) {
                        cartCreate(input: $input) {
                            cart {
                                id
                                checkoutUrl
                                lines(first: 10) {
                                    edges {
                                        node {
                                            id
                                            quantity
                                            merchandise {
                                                ... on ProductVariant {
                                                    id
                                                    title
                                                    priceV2 {
                                                        amount
                                                        currencyCode
                                                    }
                                                    product {
                                                        title
                                                        featuredImage {
                                                            url
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                cost {
                                    totalAmount {
                                        amount
                                        currencyCode
                                    }
                                    subtotalAmount {
                                        amount
                                        currencyCode
                                    }
                                }
                            }
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `, { input: { lines } });

                if (data?.cartCreate?.userErrors?.length > 0) {
                    return Response.json(
                        { error: data.cartCreate.userErrors[0].message },
                        { status: 400, headers: corsHeaders }
                    );
                }

                return Response.json(data.cartCreate.cart, { headers: corsHeaders });
            } catch (error) {
                console.error("Cart create error:", error);
                return Response.json(
                    { error: error instanceof Error ? error.message : "Failed to create cart" },
                    { status: 500, headers: corsHeaders }
                );
            }
        }
    },
    {
        path: "/shopify/cart/add",
        method: "options",
        handler: async () => {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
    },
    {
        path: "/shopify/cart/add",
        method: "post",
        handler: async (req) => {
            try {
                if (!req.json) {
                    return Response.json(
                        { error: "Invalid request" },
                        { status: 400, headers: corsHeaders }
                    );
                }
                const body = await req.json();
                const { cartId, lines } = body;

                if (!cartId) {
                    return Response.json(
                        { error: "Cart ID is required" },
                        { status: 400, headers: corsHeaders }
                    );
                }

                const data = await shopifyQuery(`
                    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
                        cartLinesAdd(cartId: $cartId, lines: $lines) {
                            cart {
                                id
                                checkoutUrl
                                lines(first: 10) {
                                    edges {
                                        node {
                                            id
                                            quantity
                                            merchandise {
                                                ... on ProductVariant {
                                                    id
                                                    title
                                                    priceV2 {
                                                        amount
                                                        currencyCode
                                                    }
                                                    product {
                                                        title
                                                        featuredImage {
                                                            url
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                cost {
                                    totalAmount {
                                        amount
                                        currencyCode
                                    }
                                }
                            }
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `, { cartId, lines });

                if (data?.cartLinesAdd?.userErrors?.length > 0) {
                    return Response.json(
                        { error: data.cartLinesAdd.userErrors[0].message },
                        { status: 400, headers: corsHeaders }
                    );
                }

                return Response.json(data.cartLinesAdd.cart, { headers: corsHeaders });
            } catch (error) {
                console.error("Cart add error:", error);
                return Response.json(
                    { error: error instanceof Error ? error.message : "Failed to add to cart" },
                    { status: 500, headers: corsHeaders }
                );
            }
        }
    },
    {
        path: "/shopify/cart/update",
        method: "options",
        handler: async () => {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
    },
    {
        path: "/shopify/cart/update",
        method: "post",
        handler: async (req) => {
            try {
                if (!req.json) {
                    return Response.json(
                        { error: "Invalid request" },
                        { status: 400, headers: corsHeaders }
                    );
                }
                const body = await req.json();
                const { cartId, lines } = body;

                if (!cartId) {
                    return Response.json(
                        { error: "Cart ID is required" },
                        { status: 400, headers: corsHeaders }
                    );
                }

                const data = await shopifyQuery(`
                    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
                        cartLinesUpdate(cartId: $cartId, lines: $lines) {
                            cart {
                                id
                                checkoutUrl
                                lines(first: 10) {
                                    edges {
                                        node {
                                            id
                                            quantity
                                            merchandise {
                                                ... on ProductVariant {
                                                    id
                                                    title
                                                    priceV2 {
                                                        amount
                                                        currencyCode
                                                    }
                                                    product {
                                                        title
                                                        featuredImage {
                                                            url
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                cost {
                                    totalAmount {
                                        amount
                                        currencyCode
                                    }
                                }
                            }
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `, { cartId, lines });

                if (data?.cartLinesUpdate?.userErrors?.length > 0) {
                    return Response.json(
                        { error: data.cartLinesUpdate.userErrors[0].message },
                        { status: 400, headers: corsHeaders }
                    );
                }

                return Response.json(data.cartLinesUpdate.cart, { headers: corsHeaders });
            } catch (error) {
                console.error("Cart update error:", error);
                return Response.json(
                    { error: error instanceof Error ? error.message : "Failed to update cart" },
                    { status: 500, headers: corsHeaders }
                );
            }
        }
    },
    {
        path: "/shopify/get-cart",
        method: "options",
        handler: async () => {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
    },
    {
        path: "/shopify/get-cart",
        method: "get",
        handler: async (req) => {
            try {
                const cartId = req.query?.id as string;

                if (!cartId) {
                    return Response.json(
                        { error: "Cart ID is required" },
                        { status: 400, headers: corsHeaders }
                    );
                }

                const data = await shopifyQuery(`
                    query getCart($cartId: ID!) {
                        cart(id: $cartId) {
                            id
                            checkoutUrl
                            lines(first: 10) {
                                edges {
                                    node {
                                        id
                                        quantity
                                        merchandise {
                                            ... on ProductVariant {
                                                id
                                                title
                                                priceV2 {
                                                    amount
                                                    currencyCode
                                                }
                                                product {
                                                    title
                                                    featuredImage {
                                                        url
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            cost {
                                totalAmount {
                                    amount
                                    currencyCode
                                }
                                subtotalAmount {
                                    amount
                                    currencyCode
                                }
                            }
                        }
                    }
                `, { cartId });

                if (!data?.cart) {
                    return Response.json(
                        { error: "Cart not found" },
                        { status: 404, headers: corsHeaders }
                    );
                }

                return Response.json(data.cart, { headers: corsHeaders });
            } catch (error) {
                console.error("Cart get error:", error);
                return Response.json(
                    { error: error instanceof Error ? error.message : "Failed to fetch cart" },
                    { status: 500, headers: corsHeaders }
                );
            }
        }
    }
];