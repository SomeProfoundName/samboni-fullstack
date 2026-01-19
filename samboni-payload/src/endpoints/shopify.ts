import type { Endpoint, PayloadHandler } from 'payload';

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

export const shopifyEndpoints: Endpoint[] = [
    {
        path: "/shopify/collections",
        method: "options",
        handler: async () => {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
    },
    {
        path: "/shopify/collections",
        method: "get",
        handler: async (req) => {
            try {
                const limit = Number(req.query?.limit) || 10
                const data = await shopifyQuery(`
                query($first: Int!) {
                collections(first: $first){
                    edges {
                        node {
                            id
                            title
                            handle
                            updatedAt
                            }
                        }
                    }
                }`, { first: limit })

                if (!data || !data.collections) {
                    return Response.json(
                        { error: "Could not find collection" },
                        { status: 500, headers: corsHeaders }
                    )
                }
                return Response.json(data.collections, { headers: corsHeaders })
            } catch (error) {
                console.error(error)
                return Response.json(
                    { error: error instanceof Error ? error.message : "Could not find collection" },
                    { status: 500, headers: corsHeaders }
                )
            }
        }
    },
    {
        path: "/shopify/products",
        method: "options",
        handler: async () => {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
    },
    {
        path: "/shopify/products",
        method: "get",
        handler: async (req) => {
            try {
                const limit = Number(req.query?.limit) || 12
                const data = await shopifyQuery(`
                query($first: Int!) {
                    products(first: $first) {
                        edges {
                            node {
                            id
                            title
                            handle
                            description
                            }
                        }
                    }
                }`, { first: limit })

                if (!data || !data.products) {
                    return Response.json(
                        { error: 'No products data returned from Shopify' },
                        { status: 500, headers: corsHeaders });
                }

                return Response.json(data.products, { headers: corsHeaders });
            } catch (error) {
                console.error('Products endpoint error:', error);
                return Response.json(
                    { error: error instanceof Error ? error.message : 'Failed to fetch products' },
                    { status: 500, headers: corsHeaders });
            }
        }
    },
    {
        path: "/shopify/collections/:handle/products",
        method: "options",
        handler: async () => {
            return new Response(null, { status: 204, headers: corsHeaders });
        }
    },
    {
        path: "/shopify/collections/:handle/products",
        method: "get",
        handler: async (req) => {
            try {
                const handle = req.routeParams?.handle;
                const limit = Number(req.query?.limit) || 12;

                if (!handle) {
                    return Response.json(
                        { error: "Collection handle is required" },
                        { status: 400, headers: corsHeaders }
                    );
                }

                const data = await shopifyQuery(`
                    query($handle: String!, $first: Int!) {
                        collection(handle: $handle) {
                            id
                            title
                            handle
                            products(first: $first) {
                                edges {
                                    node {
                                        id
                                        title
                                        handle
                                        description
                                        priceRange {
                                            minVariantPrice {
                                                amount
                                                currencyCode
                                            }
                                        }
                                        variants(first: 1) {
                                            edges {
                                                node {
                                                    id
                                                    title
                                                    availableForSale
                                                    quantityAvailable
                                                }
                                            }
                                        }
                                        images(first: 1) {
                                            edges {
                                                node {
                                                    url
                                                    altText
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `, { handle, first: limit });

                if (!data?.collection) {
                    return Response.json(
                        { error: "Collection not found" },
                        { status: 404, headers: corsHeaders }
                    );
                }

                return Response.json(data.collection.products, { headers: corsHeaders });
            } catch (error) {
                console.error("Collection products error:", error);
                return Response.json(
                    { error: error instanceof Error ? error.message : "Failed to fetch products" },
                    { status: 500, headers: corsHeaders }
                );
            }
        }
    }
]