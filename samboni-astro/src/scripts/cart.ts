  const PAYLOAD_URL = import.meta.env.PUBLIC_PAYLOAD_URL;
  let cartId = localStorage.getItem('shopify_cart_id');

  // Helper function to generate cart item HTML
  function generateCartItemHTML(
    productTitle: string,
    productDescription: string,
    productPrice: string,
    quantity: number,
    lineId: string,
    productImage: string,
    quantityAvailable: number = 999
  ): string {
    const isAtLimit = quantity >= quantityAvailable;
    const increaseButtonDisabled = isAtLimit ? 'disabled' : '';
    const increaseButtonClass = isAtLimit ? 'btn-disabled' : 'btn-primary';

    return `
      <div class="card w-full card-sm cart-item" data-line-id="${lineId}" data-quantity-available="${quantityAvailable}">
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
                <div class="flex flex-col gap-1">
                  <div class="flex gap-2 items-center">
                    ${quantity === 1
                      ? `<button class="btn btn-xs sm:btn-sm rounded-full btn-error text-white remove-item" data-line-id="${lineId}">Remove from cart</button>`
                      : `<button class="btn btn-xs sm:btn-sm rounded-full btn-primary quantity-decrease" data-line-id="${lineId}">-</button>`
                    }
                    <p class="quantity-display min-w-6 text-center font-semibold">${quantity}</p>
                    <button class="btn btn-xs sm:btn-sm rounded-full ${increaseButtonClass} quantity-increase" data-line-id="${lineId}" ${increaseButtonDisabled}>+</button>
                  </div>
                  ${isAtLimit ? `<p class="text-xs text-warning">Max stock: ${quantityAvailable}</p>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Update cart UI by fetching rendered cart items
  async function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items')!;

    if (!cartId) {
      cartItemsContainer.innerHTML =
        '<p class="text-center text-gray-500">Your cart is empty</p>';
      document.getElementById('cart-count')!.textContent = '0';
      document.getElementById('cart-total')!.classList.add('hidden');
      document.getElementById('checkout-btn')!.classList.add('hidden');
      return;
    }

    try {
      // Fetch cart data for totals and count
      const cartResponse = await fetch(`${PAYLOAD_URL}/api/shopify/get-cart?id=${encodeURIComponent(cartId)}`);
      const cart = await cartResponse.json();

      if (!cart || !cart.lines?.edges || cart.lines.edges.length === 0) {
        cartItemsContainer.innerHTML =
          '<p class="text-center text-gray-500">Your cart is empty</p>';
        document.getElementById('cart-count')!.textContent = '0';
        document.getElementById('cart-total')!.classList.add('hidden');
        document.getElementById('checkout-btn')!.classList.add('hidden');
        return;
      }

      // Update cart count
      const totalItems = cart.lines.edges.reduce((sum: number, edge: any) =>
        sum + edge.node.quantity, 0);
      document.getElementById('cart-count')!.textContent = totalItems.toString();

      // Generate cart items HTML directly on the client
      const cartItemsHTML = cart.lines.edges.map((edge: any) => {
        const item = edge.node;
        const product = item.merchandise.product;
        const price = item.merchandise.priceV2;
        const imageUrl = product.featuredImage?.url || 'https://placehold.co/600x400';
        const quantityAvailable = item.merchandise.quantityAvailable || 999;

        return generateCartItemHTML(
          product.title,
          item.merchandise.title,
          `${price?.currencyCode || ''} ${price?.amount || '0.00'}`,
          item.quantity,
          item.id,
          imageUrl,
          quantityAvailable
        );
      }).join('');

      cartItemsContainer.innerHTML = cartItemsHTML;

      // Update total
      const totalAmount = cart.cost.totalAmount;
      document.getElementById('total-amount')!.textContent =
        `${totalAmount.currencyCode} ${totalAmount.amount}`;
      document.getElementById('cart-total')!.classList.remove('hidden');

      // Update checkout button
      const checkoutBtn = document.getElementById('checkout-btn') as HTMLAnchorElement;
      checkoutBtn.href = cart.checkoutUrl;
      checkoutBtn.classList.remove('hidden');

    } catch (error) {
      console.error('Failed to load cart:', error);
      cartItemsContainer.innerHTML =
        '<p class="text-center text-red-500">Failed to load cart</p>';
    }
  }

  // Update quantity for a cart line item
  async function updateQuantity(lineId: string, quantity: number) {
    if (!cartId || quantity < 1) return;

    try {
      const response = await fetch(`${PAYLOAD_URL}/api/shopify/cart/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          lines: [{ id: lineId, quantity }]
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update quantity');
      }

      // Refresh cart UI after update
      await updateCartUI();

    } catch (error) {
      console.error('Update quantity error:', error);
      alert('Failed to update quantity');
    }
  }

  // Remove an item from the cart
  async function removeFromCart(lineId: string) {
    if (!cartId) return;

    try {
      const response = await fetch(`${PAYLOAD_URL}/api/shopify/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          lineIds: [lineId]
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove item');
      }

      // Refresh cart UI after removal
      await updateCartUI();

    } catch (error) {
      console.error('Remove item error:', error);
      alert('Failed to remove item from cart');
    }
  }

  // Handle quantity increase/decrease button clicks
  document.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;

    // Handle quantity increase
    if (target.classList.contains('quantity-increase')) {
      const lineId = target.dataset.lineId;
      if (!lineId) return;

      const cartItem = target.closest('.cart-item') as HTMLElement;
      const quantityDisplay = cartItem?.querySelector('.quantity-display');
      if (!quantityDisplay) return;

      const currentQuantity = parseInt(quantityDisplay.textContent || '0');
      const quantityAvailable = parseInt(cartItem?.dataset.quantityAvailable || '999');

      // Check if we're at the stock limit
      if (currentQuantity >= quantityAvailable) {
        return; // Don't allow increasing beyond available stock
      }

      await updateQuantity(lineId, currentQuantity + 1);
      return;
    }

    // Handle quantity decrease
    if (target.classList.contains('quantity-decrease')) {
      const lineId = target.dataset.lineId;
      if (!lineId) return;

      const cartItem = target.closest('.cart-item');
      const quantityDisplay = cartItem?.querySelector('.quantity-display');
      if (!quantityDisplay) return;

      const currentQuantity = parseInt(quantityDisplay.textContent || '0');
      if (currentQuantity > 1) {
        await updateQuantity(lineId, currentQuantity - 1);
      }
      return;
    }

    // Handle remove item
    if (target.classList.contains('remove-item')) {
      const lineId = target.dataset.lineId;
      if (!lineId) return;

      await removeFromCart(lineId);
      return;
    }
  });

  // Handle "Add to Cart" button clicks
  document.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('add-to-cart-btn')) return;

    const variantId = target.dataset.variantId;
    if (!variantId) return;

    const originalText = target.textContent;
    target.textContent = 'Adding...';
    target.setAttribute('disabled', 'true');

    try {
      if (!cartId) {
        // Create new cart
        const response = await fetch(`${PAYLOAD_URL}/api/shopify/cart/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lines: [{ merchandiseId: variantId, quantity: 1 }]
          })
        });

        const cart = await response.json();

        if (!cart.id) {
          throw new Error(cart.error || 'Failed to create cart');
        }

        cartId = cart.id;
        if (cartId) {
          localStorage.setItem('shopify_cart_id', cartId);
        }
      } else {
        // Add to existing cart
        const response = await fetch(`${PAYLOAD_URL}/api/shopify/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartId,
            lines: [{ merchandiseId: variantId, quantity: 1 }]
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to add to cart');
        }
      }

      // Small delay to let Shopify process the cart update
      await new Promise(resolve => setTimeout(resolve, 500));
      await updateCartUI();

      // Open the cart drawer to show the added item
      const cartDrawer = document.getElementById('my-drawer-5') as HTMLInputElement;
      if (cartDrawer) {
        cartDrawer.checked = true;
      }

      target.textContent = 'Added!';
      setTimeout(() => {
        target.textContent = originalText;
        target.removeAttribute('disabled');
      }, 1000);

    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
      target.textContent = originalText;
      target.removeAttribute('disabled');
    }
  });

  // Load cart on page load
  updateCartUI();
