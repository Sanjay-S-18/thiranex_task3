// Reusable HTML Components Generator
const Components = {
  
  // Product Card Component
  productCard(product) {
    const isOutOfStock = product.countInStock <= 0;
    const badgeHTML = isOutOfStock 
      ? `<span class="product-badge product-badge-outofstock">Out of Stock</span>`
      : `<span class="product-badge">New</span>`;

    return `
      <div class="product-card" data-id="${product._id}">
        <div class="product-img-wrapper">
          <img class="product-img" src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x400/171b2d/a5b4fc?text=No+Image'">
          ${badgeHTML}
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          <div class="product-footer">
            <span class="product-price">$${product.price.toFixed(2)}</span>
            <button class="btn btn-primary btn-sm view-product-btn" data-id="${product._id}">
              <i class="fa-solid fa-arrow-right"></i> View Details
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Product Detailed View
  productDetail(product) {
    const isOutOfStock = product.countInStock <= 0;
    const stockClass = isOutOfStock ? 'status-out' : 'status-instock';
    const stockText = isOutOfStock ? 'Out of Stock' : `In Stock (${product.countInStock} available)`;
    
    return `
      <div class="product-detail">
        <div class="detail-img-container">
          <img class="detail-img" src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x400/171b2d/a5b4fc?text=No+Image'">
        </div>
        <div class="detail-info">
          <span class="detail-category">${product.category}</span>
          <h1 class="detail-title">${product.name}</h1>
          <span class="detail-price">$${product.price.toFixed(2)}</span>
          <p class="detail-desc">${product.description}</p>
          
          <div class="stock-status ${stockClass}">
            <i class="fa-solid ${isOutOfStock ? 'fa-circle-xmark' : 'fa-circle-check'}"></i>
            <span>${stockText}</span>
          </div>

          <div class="detail-actions">
            <button class="btn btn-secondary" id="back-to-catalog">
              <i class="fa-solid fa-arrow-left"></i> Back to Shop
            </button>
            <button class="btn btn-primary add-to-cart-action" data-id="${product._id}" ${isOutOfStock ? 'disabled' : ''}>
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // Shopping Cart Component
  cart(cartItems, totalPrice) {
    if (!cartItems || cartItems.length === 0) {
      return `
        <div class="empty-cart-state glass-card">
          <i class="fa-solid fa-bag-shopping"></i>
          <h2>Your Cart is Empty</h2>
          <p class="mb-2">Explore our collections and add products to start shopping.</p>
          <button class="btn btn-primary" id="cart-empty-shop-btn">Go to Shop</button>
        </div>
      `;
    }

    const itemsHTML = cartItems.map(item => `
      <div class="cart-item" data-id="${item.product}">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.name}</h4>
          <span class="cart-item-price">$${item.price.toFixed(2)}</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn qty-minus" data-id="${item.product}"><i class="fa-solid fa-minus"></i></button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn qty-plus" data-id="${item.product}"><i class="fa-solid fa-plus"></i></button>
        </div>
        <button class="btn-remove remove-cart-item-btn" data-id="${item.product}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');

    return `
      <div class="catalog-header">
        <h2 class="catalog-title">Shopping Cart</h2>
      </div>
      <div class="cart-layout">
        <div class="cart-items-container">
          ${itemsHTML}
        </div>
        <div class="summary-card glass-card">
          <h3 class="summary-title">Order Summary</h3>
          <div class="summary-row">
            <span>Items Total</span>
            <span>$${totalPrice.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div class="summary-row total">
            <span>Total Cost</span>
            <span>$${totalPrice.toFixed(2)}</span>
          </div>
          <button class="btn btn-primary btn-block mt-2" id="checkout-start-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>
    `;
  },

  // Checkout Component
  checkout(cartItems, totalPrice) {
    const itemsListHTML = cartItems.map(item => `
      <div class="summary-row" style="font-size: 0.9rem;">
        <span style="max-width: 70%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${item.name} <strong style="color: var(--color-primary)">x${item.qty}</strong>
        </span>
        <span>$${(item.price * item.qty).toFixed(2)}</span>
      </div>
    `).join('');

    return `
      <div class="catalog-header">
        <h2 class="catalog-title">Secure Checkout</h2>
      </div>
      <div class="checkout-grid">
        <div class="glass-card">
          <h3 class="mb-1" style="font-family: var(--font-family-title)">Shipping Address</h3>
          <form id="checkout-shipping-form">
            <div class="form-group mb-1">
              <label for="shipping-address">Street Address</label>
              <textarea id="shipping-address" required rows="2" placeholder="123 Main St, Apt 4B"></textarea>
            </div>
            <div class="form-group mb-1">
              <label for="shipping-city">City</label>
              <input type="text" id="shipping-city" required placeholder="New York">
            </div>
            <div class="form-group mb-1">
              <label for="shipping-postal">Postal Code</label>
              <input type="text" id="shipping-postal" required placeholder="10001">
            </div>
            <div class="form-group mb-2">
              <label for="shipping-country">Country</label>
              <input type="text" id="shipping-country" required placeholder="United States">
            </div>

            <h3 class="mb-1 mt-2" style="font-family: var(--font-family-title)">Payment Details</h3>
            <div class="form-group mb-1">
              <label for="card-number">Card Number (Simulated)</label>
              <input type="text" id="card-number" required placeholder="4111 2222 3333 4444">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="mb-2">
              <div class="form-group">
                <label for="card-expiry">Expiry Date</label>
                <input type="text" id="card-expiry" required placeholder="MM/YY">
              </div>
              <div class="form-group">
                <label for="card-cvv">CVV</label>
                <input type="password" id="card-cvv" required placeholder="•••">
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block">Place Simulated Order</button>
          </form>
        </div>

        <div class="summary-card glass-card" style="height: fit-content;">
          <h3 class="summary-title">Your Order</h3>
          <div class="items-summary mb-2" style="max-height: 180px; overflow-y: auto;">
            ${itemsListHTML}
          </div>
          <div class="summary-row total">
            <span>Total Price</span>
            <span>$${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  },

  // User Dashboard / Orders Table
  userDashboard(orders) {
    if (!orders || orders.length === 0) {
      return `
        <div class="catalog-header">
          <h2 class="catalog-title">My Orders</h2>
        </div>
        <div class="glass-card text-center" style="padding: 4rem 2rem; text-align: center;">
          <i class="fa-solid fa-box-open" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 1.5rem;"></i>
          <h3>No Orders Placed Yet</h3>
          <p class="mb-2">You haven't ordered any equipment yet.</p>
          <button class="btn btn-primary" id="dashboard-shop-btn">Browse Catalog</button>
        </div>
      `;
    }

    const rowsHTML = orders.map(order => {
      const statusClass = `badge-${order.status.toLowerCase()}`;
      const itemsText = order.orderItems.map(item => `${item.name} (${item.qty})`).join(', ');

      return `
        <tr>
          <td><strong style="color: var(--color-primary); font-size: 0.8rem;">#${order._id.substring(order._id.length - 8)}</strong></td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${itemsText}</td>
          <td>$${order.totalPrice.toFixed(2)}</td>
          <td><span class="badge-status ${statusClass}">${order.status}</span></td>
        </tr>
      `;
    }).join('');

    return `
      <div class="catalog-header">
        <h2 class="catalog-title">Order History</h2>
      </div>
      <div class="responsive-table-wrapper">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items Ordered</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;
  },

  // Admin Dashboard Component
  adminDashboard(products, orders) {
    return `
      <div class="catalog-header">
        <h2 class="catalog-title">Admin Management Panel</h2>
      </div>
      
      <div class="dashboard-layout">
        <div class="dashboard-sidebar">
          <button class="sidebar-tab active" data-pane="pane-products">
            <i class="fa-solid fa-cubes"></i> Products CRUD
          </button>
          <button class="sidebar-tab" data-pane="pane-orders">
            <i class="fa-solid fa-truck-ramp-box"></i> Manage Orders
          </button>
          <button class="sidebar-tab" id="admin-create-new-product-btn">
            <i class="fa-solid fa-plus"></i> Add New Product
          </button>
        </div>

        <div class="dashboard-content-area">
          <!-- Products Pane -->
          <div class="dashboard-pane active" id="pane-products">
            <h3 class="mb-1" style="font-family: var(--font-family-title)">Catalog Products</h3>
            <div class="responsive-table-wrapper">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${products.map(p => `
                    <tr>
                      <td style="color: #fff; font-weight: 500;">${p.name}</td>
                      <td>${p.category}</td>
                      <td>$${p.price.toFixed(2)}</td>
                      <td>${p.countInStock}</td>
                      <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm admin-edit-prod-btn" data-id="${p._id}" style="margin-right: 0.5rem;">
                          <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm admin-delete-prod-btn" data-id="${p._id}">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Orders Pane -->
          <div class="dashboard-pane" id="pane-orders">
            <h3 class="mb-1" style="font-family: var(--font-family-title)">Customer Orders</h3>
            <div class="responsive-table-wrapper">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Status Operations</th>
                  </tr>
                </thead>
                <tbody>
                  ${orders.map(o => {
                    const statusClass = `badge-${o.status.toLowerCase()}`;
                    return `
                      <tr>
                        <td><strong style="color: var(--color-primary); font-size: 0.8rem;">#${o._id.substring(o._id.length - 8)}</strong></td>
                        <td>${o.user ? o.user.name : 'Unknown User'}</td>
                        <td>$${o.totalPrice.toFixed(2)}</td>
                        <td><span class="badge-status ${statusClass}">${o.status}</span></td>
                        <td>
                          <select class="admin-order-status-select" data-id="${o._id}" style="padding: 0.25rem 0.5rem; background: var(--bg-primary); border: 1px solid var(--glass-border); color: #fff; border-radius: 4px;">
                            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                          </select>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Create or Edit Product Form Component
  adminProductForm(product = null) {
    const isEdit = !!product;
    const title = isEdit ? 'Edit Catalog Product' : 'Add New Catalog Product';
    
    return `
      <div class="catalog-header">
        <h2 class="catalog-title">${title}</h2>
        <button class="btn btn-secondary btn-sm" id="admin-form-back-btn">
          <i class="fa-solid fa-arrow-left"></i> Cancel
        </button>
      </div>

      <div class="glass-card admin-form-container">
        <form id="admin-product-submit-form">
          <div class="form-group mb-1">
            <label for="prod-name">Product Name</label>
            <input type="text" id="prod-name" required value="${isEdit ? product.name : ''}" placeholder="e.g. Apex Keyboard">
          </div>

          <div class="form-group mb-1">
            <label for="prod-price">Price ($)</label>
            <input type="number" id="prod-price" required step="0.01" value="${isEdit ? product.price : ''}" placeholder="e.g. 99.99">
          </div>

          <div class="form-group mb-1">
            <label for="prod-category">Category</label>
            <select id="prod-category" required>
              <option value="Electronics" ${isEdit && product.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
              <option value="Audio" ${isEdit && product.category === 'Audio' ? 'selected' : ''}>Audio</option>
              <option value="Wearables" ${isEdit && product.category === 'Wearables' ? 'selected' : ''}>Wearables</option>
              <option value="Office" ${isEdit && product.category === 'Office' ? 'selected' : ''}>Office</option>
            </select>
          </div>

          <div class="form-group mb-1">
            <label for="prod-stock">Stock Count</label>
            <input type="number" id="prod-stock" required value="${isEdit ? product.countInStock : ''}" placeholder="e.g. 10">
          </div>

          <div class="form-group mb-1">
            <label for="prod-image">Image URL</label>
            <input type="text" id="prod-image" value="${isEdit ? product.image : ''}" placeholder="Image URL (Unsplash, etc.)">
          </div>

          <div class="form-group mb-2">
            <label for="prod-desc">Product Description</label>
            <textarea id="prod-desc" required rows="4" placeholder="Full technical product description details...">${isEdit ? product.description : ''}</textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            ${isEdit ? 'Save Product Details' : 'Add Product to Shop'}
          </button>
        </form>
      </div>
    `;
  }
};
