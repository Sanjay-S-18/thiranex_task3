// Core Application Controller & State Management
const App = {
  // Application State
  state: {
    user: null,
    cart: [],
    currentView: 'catalog', // catalog | detail | cart | checkout | dashboard | admin | admin-form
    currentProductId: null, // For detail view and admin form edit
    categoryFilter: 'All',
    searchQuery: '',
    productsCache: []
  },

  // Initialize App
  init() {
    this.loadUserFromStorage();
    this.loadCartFromStorage();
    this.registerEventListeners();
    this.navigate('catalog');
  },

  // --- STATE CONTROLLERS ---
  loadUserFromStorage() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.state.user = JSON.parse(userStr);
        this.updateAuthUI();
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  },

  loadCartFromStorage() {
    const cartStr = localStorage.getItem('cart');
    if (cartStr) {
      try {
        this.state.cart = JSON.parse(cartStr);
      } catch (e) {
        this.state.cart = [];
      }
    }
    this.updateCartBadge();
  },

  saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.state.cart));
    this.updateCartBadge();
  },

  // --- TOAST NOTIFICATIONS ---
  showToast(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' 
      ? '<i class="fa-solid fa-circle-check" style="color: #10b981"></i>' 
      : '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444"></i>';

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        ${icon}
        <span>${message}</span>
      </div>
      <button class="toast-close">&times;</button>
    `;

    // Toast Close Button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 4000);
  },

  // --- CART OPERATIONS ---
  addToCart(product) {
    const existingItem = this.state.cart.find(item => item.product === product._id);
    
    if (existingItem) {
      if (existingItem.qty >= product.countInStock) {
        this.showToast(`Cannot add more. Only ${product.countInStock} items available in stock.`, 'error');
        return;
      }
      existingItem.qty += 1;
    } else {
      this.state.cart.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        qty: 1
      });
    }

    this.saveCartToStorage();
    this.showToast(`"${product.name}" added to cart!`);
  },

  removeFromCart(productId) {
    this.state.cart = this.state.cart.filter(item => item.product !== productId);
    this.saveCartToStorage();
    this.showToast('Item removed from cart.');
    
    if (this.state.currentView === 'cart') {
      this.renderCart();
    }
  },

  changeQuantity(productId, delta) {
    const item = this.state.cart.find(item => item.product === productId);
    if (!item) return;

    // Check stock limit for addition
    if (delta > 0) {
      const cachedProd = this.state.productsCache.find(p => p._id === productId);
      if (cachedProd && item.qty >= cachedProd.countInStock) {
        this.showToast(`Maximum stock reached (${cachedProd.countInStock} items).`, 'error');
        return;
      }
    }

    item.qty += delta;

    if (item.qty <= 0) {
      this.removeFromCart(productId);
    } else {
      this.saveCartToStorage();
      if (this.state.currentView === 'cart') {
        this.renderCart();
      }
    }
  },

  updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const totalCount = this.state.cart.reduce((sum, item) => sum + item.qty, 0);
    badge.innerText = totalCount;
  },

  // --- ROUTER & NAVIGATION ---
  async navigate(view, params = null) {
    this.state.currentView = view;
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = `
      <div class="loader-container">
        <div class="spinner"></div>
        <p>Loading view...</p>
      </div>
    `;

    // Dropdowns clean up
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));

    try {
      switch (view) {
        case 'catalog':
          await this.renderCatalog();
          break;
        case 'detail':
          await this.renderProductDetail(params);
          break;
        case 'cart':
          this.renderCart();
          break;
        case 'checkout':
          this.renderCheckout();
          break;
        case 'dashboard':
          await this.renderUserDashboard();
          break;
        case 'admin':
          await this.renderAdminDashboard();
          break;
        case 'admin-form':
          await this.renderAdminProductForm(params);
          break;
        default:
          await this.renderCatalog();
      }
    } catch (error) {
      mainView.innerHTML = `
        <div class="glass-card text-center" style="padding: 4rem 2rem; text-align: center; max-width: 500px; margin: 2rem auto;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: #ef4444; margin-bottom: 1.5rem;"></i>
          <h3>Failed to load content</h3>
          <p class="mb-2">${error.message}</p>
          <button class="btn btn-primary" onclick="App.navigate('catalog')">Back to Shop</button>
        </div>
      `;
    }
  },

  // --- VIEW RENDERERS ---

  // 1. Catalog Page
  async renderCatalog() {
    const products = await API.products.getAll(this.state.searchQuery, this.state.categoryFilter);
    this.state.productsCache = products; // Cache for stock verification

    const mainView = document.getElementById('main-view');
    
    let titleText = this.state.categoryFilter === 'All' ? 'All Products' : this.state.categoryFilter;
    if (this.state.searchQuery) {
      titleText = `Search results for "${this.state.searchQuery}"`;
    }

    if (!products || products.length === 0) {
      mainView.innerHTML = `
        <div class="catalog-header">
          <h2 class="catalog-title">${titleText}</h2>
        </div>
        <div class="glass-card text-center" style="padding: 6rem 2rem; text-align: center;">
          <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 1.5rem;"></i>
          <h3>No Products Found</h3>
          <p>Try refining your search query or selecting a different category.</p>
        </div>
      `;
      return;
    }

    const cardsHTML = products.map(p => Components.productCard(p)).join('');

    mainView.innerHTML = `
      <div class="catalog-header">
        <h2 class="catalog-title">${titleText}</h2>
      </div>
      <div class="product-grid">
        ${cardsHTML}
      </div>
    `;
  },

  // 2. Product Detail Page
  async renderProductDetail(productId) {
    this.state.currentProductId = productId;
    const product = await API.products.getById(productId);
    
    // Cache check
    if (!this.state.productsCache.find(p => p._id === productId)) {
      this.state.productsCache.push(product);
    }

    const mainView = document.getElementById('main-view');
    mainView.innerHTML = Components.productDetail(product);
  },

  // 3. Cart Page
  renderCart() {
    const mainView = document.getElementById('main-view');
    const total = this.state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    mainView.innerHTML = Components.cart(this.state.cart, total);
  },

  // 4. Checkout Page
  renderCheckout() {
    if (!this.state.user) {
      this.showToast('Please login to check out products.', 'error');
      document.getElementById('auth-modal').classList.remove('hidden');
      this.navigate('cart');
      return;
    }

    if (this.state.cart.length === 0) {
      this.navigate('cart');
      return;
    }

    const mainView = document.getElementById('main-view');
    const total = this.state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    mainView.innerHTML = Components.checkout(this.state.cart, total);
  },

  // 5. User Orders History Page
  async renderUserDashboard() {
    if (!this.state.user) {
      this.navigate('catalog');
      return;
    }

    const orders = await API.orders.getMyOrders();
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = Components.userDashboard(orders);
  },

  // 6. Admin Panel
  async renderAdminDashboard() {
    if (!this.state.user || this.state.user.role !== 'admin') {
      this.showToast('Access Denied. Admins Only.', 'error');
      this.navigate('catalog');
      return;
    }

    const products = await API.products.getAll();
    const orders = await API.orders.getAll();

    const mainView = document.getElementById('main-view');
    mainView.innerHTML = Components.adminDashboard(products, orders);
    this.registerAdminTabEvents();
  },

  // 7. Add/Edit Product Forms
  async renderAdminProductForm(productId = null) {
    if (!this.state.user || this.state.user.role !== 'admin') {
      this.navigate('catalog');
      return;
    }

    const mainView = document.getElementById('main-view');
    
    if (productId) {
      const product = await API.products.getById(productId);
      mainView.innerHTML = Components.adminProductForm(product);
      this.state.currentProductId = productId;
    } else {
      mainView.innerHTML = Components.adminProductForm();
      this.state.currentProductId = null;
    }
  },

  // --- UI UPDATERS ---
  updateAuthUI() {
    const loginNav = document.getElementById('login-nav-btn');
    const userMenu = document.getElementById('user-menu-wrapper');
    const userDisplay = document.getElementById('user-display-name');
    const adminLink = document.getElementById('menu-admin-btn');

    if (this.state.user) {
      loginNav.classList.add('hidden');
      userMenu.classList.remove('hidden');
      userDisplay.innerText = this.state.user.name.split(' ')[0];

      if (this.state.user.role === 'admin') {
        adminLink.classList.remove('hidden');
      } else {
        adminLink.classList.add('hidden');
      }
    } else {
      loginNav.classList.remove('hidden');
      userMenu.classList.add('hidden');
      adminLink.classList.add('hidden');
    }
  },

  // --- EVENT LISTENERS & EVENT DELEGATION ---
  registerEventListeners() {
    // 1. Navigation Home
    document.getElementById('nav-home-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.state.searchQuery = '';
      this.state.categoryFilter = 'All';
      document.getElementById('search-input').value = '';
      this.navigate('catalog');
    });

    // 2. Search Box
    document.getElementById('search-btn').addEventListener('click', () => {
      this.state.searchQuery = document.getElementById('search-input').value.trim();
      this.navigate('catalog');
    });

    document.getElementById('search-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.state.searchQuery = e.target.value.trim();
        this.navigate('catalog');
      }
    });

    // 3. Category Filter
    document.getElementById('category-trigger').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('category-list').classList.toggle('show');
    });

    document.getElementById('category-list').addEventListener('click', (e) => {
      e.preventDefault();
      const cat = e.target.dataset.category;
      if (cat) {
        this.state.categoryFilter = cat;
        this.state.searchQuery = '';
        document.getElementById('search-input').value = '';
        this.navigate('catalog');
      }
    });

    // 4. Cart Nav Button
    document.getElementById('cart-nav-btn').addEventListener('click', () => {
      this.navigate('cart');
    });

    // 5. User Dropdown Menu Toggle
    document.getElementById('user-menu-wrapper').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('user-dropdown').classList.toggle('show');
    });

    // Click outside to close menus
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
    });

    // 6. User Dropdown Clicks
    document.getElementById('menu-orders-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('dashboard');
    });

    document.getElementById('menu-admin-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('admin');
    });

    document.getElementById('menu-logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.state.user = null;
      this.updateAuthUI();
      this.showToast('Logged out successfully.');
      this.navigate('catalog');
    });

    // 7. Modal Auth open and close
    const authModal = document.getElementById('auth-modal');
    document.getElementById('login-nav-btn').addEventListener('click', () => {
      authModal.classList.remove('hidden');
      document.getElementById('login-tab').classList.remove('hidden');
      document.getElementById('register-tab').classList.add('hidden');
    });

    document.getElementById('auth-close-btn').addEventListener('click', () => {
      authModal.classList.add('hidden');
    });

    document.getElementById('switch-to-register').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-tab').classList.add('hidden');
      document.getElementById('register-tab').classList.remove('hidden');
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-tab').classList.add('hidden');
      document.getElementById('login-tab').classList.remove('hidden');
    });

    // 8. Auth Forms submissions
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const data = await API.auth.login(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
        
        this.state.user = { name: data.name, email: data.email, role: data.role };
        this.updateAuthUI();
        authModal.classList.add('hidden');
        this.showToast(`Welcome back, ${data.name}!`);

        // Refresh view if logged in on checkout block
        if (this.state.currentView === 'cart') {
          this.navigate('checkout');
        } else {
          this.navigate('catalog');
        }
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;

      try {
        const data = await API.auth.register(name, email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));
        
        this.state.user = { name: data.name, email: data.email, role: data.role };
        this.updateAuthUI();
        authModal.classList.add('hidden');
        this.showToast('Account registered successfully!');
        this.navigate('catalog');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });

    // 9. DYNAMIC EVENT DELEGATION (on Main Area clicks)
    const mainView = document.getElementById('main-view');
    mainView.addEventListener('click', async (e) => {
      const target = e.target;

      // Card / Catalog buttons
      if (target.classList.contains('view-product-btn') || target.closest('.view-product-btn')) {
        const btn = target.classList.contains('view-product-btn') ? target : target.closest('.view-product-btn');
        this.navigate('detail', btn.dataset.id);
        return;
      }

      // Add to Cart from Detail Page
      if (target.classList.contains('add-to-cart-action')) {
        const id = target.dataset.id;
        const cachedProd = this.state.productsCache.find(p => p._id === id);
        if (cachedProd) {
          this.addToCart(cachedProd);
        } else {
          // Fetch product if not cached (safety fallback)
          const p = await API.products.getById(id);
          this.addToCart(p);
        }
        return;
      }

      // Back to shop buttons
      if (target.id === 'back-to-catalog' || target.id === 'cart-empty-shop-btn' || target.id === 'dashboard-shop-btn') {
        this.state.categoryFilter = 'All';
        this.navigate('catalog');
        return;
      }

      // Cart controls
      if (target.closest('.qty-minus')) {
        const id = target.closest('.qty-minus').dataset.id;
        this.changeQuantity(id, -1);
        return;
      }

      if (target.closest('.qty-plus')) {
        const id = target.closest('.qty-plus').dataset.id;
        this.changeQuantity(id, 1);
        return;
      }

      if (target.closest('.remove-cart-item-btn')) {
        const id = target.closest('.remove-cart-item-btn').dataset.id;
        this.removeFromCart(id);
        return;
      }

      // Checkout controls
      if (target.id === 'checkout-start-btn') {
        this.navigate('checkout');
        return;
      }

      // Admin side panel buttons
      if (target.id === 'admin-create-new-product-btn') {
        this.navigate('admin-form');
        return;
      }

      if (target.id === 'admin-form-back-btn') {
        this.navigate('admin');
        return;
      }

      if (target.classList.contains('admin-edit-prod-btn') || target.closest('.admin-edit-prod-btn')) {
        const btn = target.classList.contains('admin-edit-prod-btn') ? target : target.closest('.admin-edit-prod-btn');
        this.navigate('admin-form', btn.dataset.id);
        return;
      }

      if (target.classList.contains('admin-delete-prod-btn') || target.closest('.admin-delete-prod-btn')) {
        const btn = target.classList.contains('admin-delete-prod-btn') ? target : target.closest('.admin-delete-prod-btn');
        if (confirm('Are you sure you want to remove this product?')) {
          try {
            await API.products.delete(btn.dataset.id);
            this.showToast('Product deleted.');
            this.navigate('admin');
          } catch (err) {
            this.showToast(err.message, 'error');
          }
        }
        return;
      }
    });

    // 10. Dynamic submit handlers (via delegation checking form IDs)
    mainView.addEventListener('submit', async (e) => {
      e.preventDefault();
      const target = e.target;

      // Checkout form submit
      if (target.id === 'checkout-shipping-form') {
        const address = document.getElementById('shipping-address').value;
        const city = document.getElementById('shipping-city').value;
        const postalCode = document.getElementById('shipping-postal').value;
        const country = document.getElementById('shipping-country').value;
        
        const total = this.state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        const orderData = {
          orderItems: this.state.cart,
          shippingAddress: { address, city, postalCode, country },
          paymentMethod: 'Credit Card',
          totalPrice: total
        };

        try {
          await API.orders.create(orderData);
          this.state.cart = [];
          this.saveCartToStorage();
          this.showToast('Order placed successfully! Tracking active.');
          this.navigate('dashboard');
        } catch (err) {
          this.showToast(err.message, 'error');
        }
        return;
      }

      // Admin CRUD Submit
      if (target.id === 'admin-product-submit-form') {
        const name = document.getElementById('prod-name').value;
        const price = parseFloat(document.getElementById('prod-price').value);
        const category = document.getElementById('prod-category').value;
        const countInStock = parseInt(document.getElementById('prod-stock').value);
        const image = document.getElementById('prod-image').value || 'https://placehold.co/600x400/171b2d/a5b4fc?text=No+Image';
        const description = document.getElementById('prod-desc').value;

        const prodObj = { name, price, category, countInStock, image, description };

        try {
          if (this.state.currentProductId) {
            await API.products.update(this.state.currentProductId, prodObj);
            this.showToast('Product updated successfully.');
          } else {
            await API.products.create(prodObj);
            this.showToast('Product created successfully.');
          }
          this.navigate('admin');
        } catch (err) {
          this.showToast(err.message, 'error');
        }
        return;
      }
    });
  },

  // Admin Tab selection event binding
  registerAdminTabEvents() {
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (!sidebar) return;

    sidebar.addEventListener('click', (e) => {
      const tab = e.target.closest('.sidebar-tab');
      if (!tab || !tab.dataset.pane) return;

      // Remove active states
      sidebar.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.dashboard-pane').forEach(p => p.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
      const pane = document.getElementById(tab.dataset.pane);
      if (pane) pane.classList.add('active');
    });

    // Bind Status select updates
    document.querySelectorAll('.admin-order-status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const orderId = e.target.dataset.id;
        const newStatus = e.target.value;

        try {
          await API.orders.updateStatus(orderId, newStatus);
          this.showToast(`Order status updated to "${newStatus}"`);
          this.navigate('admin');
        } catch (err) {
          this.showToast(err.message, 'error');
        }
      });
    });
  }
};

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
