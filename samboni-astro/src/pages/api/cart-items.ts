import type { APIRoute } from 'astro';

const PAYLOAD_URL = import.meta.env.PUBLIC_PAYLOAD_URL;

// Helper function to generate CartProductCard HTML
function generateCartItemHTML(
  productTitle: string,
  productDescription: string,
  productPrice: string,
  quantity: number,
  lineId: string,
  productImage: string
): string {
  return `
    <div class="card w-full card-sm cart-item" data-line-id="${lineId}">
      <div class="card-body p-3 sm:p-4">
        <div class="grid grid-cols-1 sm:grid-cols-[35%_65%] md:grid-cols-[30%_70%] gap-3 sm:gap-4">
          <div class="w-full">
            <img class="w-full aspect-square object-cover rounded-lg" src="${productImage}" alt="${productTitle}">
          </div>
          <div class="flex flex-col gap-2">
            <h2 class="card-title text-base sm:text-lg">${productTitle}</h2>
            <p class="text-xs sm:text-sm text-gray-600 line-clamp-2">${productDescription}</p>
            <p class="font-bold text-sm sm:text-base">${productPrice}</p>
            <div class="flex items-center gap-2 sm:gap-3 mt-auto">
              <p class="text-xs sm:text-sm">Quantity:</p>
              <div class="flex gap-2 items-center">
                <button class="btn btn-xs sm:btn-sm btn-circle btn-primary quantity-decrease" data-line-id="${lineId}">-</button>
                <p class="quantity-display min-w-6 text-center font-semibold">${quantity}</p>
                <button class="btn btn-xs sm:btn-sm btn-circle btn-primary quantity-increase" data-line-id="${lineId}">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const cartId = url.searchParams.get('cartId');

  if (!cartId) {
    return new Response(
      '<p class="text-center text-gray-500">Your cart is empty</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  try {
    const response = await fetch(`${PAYLOAD_URL}/api/shopify/get-cart?id=${encodeURIComponent(cartId)}`);
    const cart = await response.json();

    if (!cart || !cart.lines?.edges || cart.lines.edges.length === 0) {
      return new Response(
        '<p class="text-center text-gray-500">Your cart is empty</p>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Generate CartProductCard HTML for each item
    const cartItemsHTML = cart.lines.edges.map((edge: any) => {
      const item = edge.node;
      const product = item.merchandise.product;
      const price = item.merchandise.priceV2;
      const imageUrl = product.featuredImage?.url || 'https://placehold.co/600x400';

      return generateCartItemHTML(
        product.title,
        item.merchandise.title,
        `${price.currencyCode} ${price.amount}`,
        item.quantity,
        item.id,
        imageUrl
      );
    });

    return new Response(
      cartItemsHTML.join(''),
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Failed to load cart:', error);
    return new Response(
      '<p class="text-center text-red-500">Failed to load cart</p>',
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}
