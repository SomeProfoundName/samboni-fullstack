import type { Endpoint, PayloadHandler } from 'payload';

const SHOPIFY_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}.myshopify.com/api/2025-10/graphql.json`;
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function shopifyQuery(query: string, variables?: object) {
  console.log('=== Shopify Query Debug ===');
  console.log('URL:', SHOPIFY_URL);
  console.log('Token exists:', !!SHOPIFY_TOKEN);

  if (!SHOPIFY_TOKEN) {
    throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(SHOPIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  console.log('Response status:', response?.status);
  console.log('Response ok:', response?.ok);

  if (!response) {
    throw new Error('No response from Shopify');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shopify HTTP Error:', response.status, errorText);
    throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  console.log('Shopify Response:', JSON.stringify(json, null, 2));

  if (json.errors) {
    console.error('Shopify Error:', json.errors);
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

export const shopifyEndpoints: Endpoint[] = [
  {
    path: '/shopify/products',
    method: 'get',
    handler: async (req) => {
      try {
        console.log('=== Products Endpoint Hit ===');
        const limit = Number(req.query?.limit) || 12;
        console.log('Limit:', limit);

        const data = await shopifyQuery(`
          query GetProducts($first: Int!) {
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
                  images(first: 3) {
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
        `, { first: limit });

        console.log('Returning products:', data?.products?.edges?.length || 0);

        if (!data || !data.products) {
          return Response.json({ error: 'No products data returned from Shopify' }, { status: 500 });
        }

        return Response.json(data.products);
      } catch (error) {
        console.error('Products endpoint error:', error);
        return Response.json(
          { error: error instanceof Error ? error.message : 'Failed to fetch products' },
          { status: 500 }
        );
      }
    },
  },
  {
    path: '/shopify/products/:handle',
    method: 'get',
    handler: async (req) => {
      try {
        const { handle } = req.routeParams;
        const data = await shopifyQuery(`
          query GetProduct($handle: String!) {
            productByHandle(handle: $handle) {
              id
              title
              handle
              description
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
              images(first: 10) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        `, { handle });

        if (!data.productByHandle) {
          return Response.json({ error: 'Product not found' }, { status: 404 });
        }

        return Response.json(data.productByHandle);
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : 'Failed to fetch product' },
          { status: 500 }
        );
      }
    },
  },
  {
    path: '/shopify/collections',
    method: 'get',
    handler: async (req) => {
      try {
        const data = await shopifyQuery(`
          query GetCollections {
            collections(first: 20) {
              edges {
                node {
                  id
                  title
                  handle
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        `);

        return Response.json(data.collections);
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : 'Failed to fetch collections' },
          { status: 500 }
        );
      }
    },
  },
];