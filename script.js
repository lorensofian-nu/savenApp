/**
 * ==========================================================================
 * SAVEN - JOYERÍA EN ORO 18K | LÓGICA DE NEGOCIO & REACTIVIDAD
 * Proyecto SENATIC · IE Municipal María Concepción Loperena (Cúcuta)
 * Aprendices: Emmanuel Núñez & Samuel Vergara
 * ==========================================================================
 */

// Datos iniciales de Joyas en Oro 18K (Ley 750)
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    title: 'Cadena Tejido Gucci Oro 18K (200g)',
    category: 'Cadenas',
    price: 68500000,
    weight: '200g',
    purity: 'Oro 18K (Ley 750)',
    description: 'Imponente cadena de oro amarillo macizo de 18 quilates con el legendario tejido Gucci italiano. Acabado pulido con broche de seguridad tipo cajón.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    availability: 'En stock',
    colors: 'Dorado tradicional 18K',
    freeShipping: true,
    specialOffer: false
  },
  {
    id: 'p2',
    title: 'Candonga Mercocha en Oro 18K',
    category: 'Candongas',
    price: 3850000,
    weight: '11.4g',
    purity: 'Oro 18K (Ley 750)',
    description: 'Tradicionales aretes tipo candongas mercocha elaborados artesanalmente en oro de 18 quilates con fina filigrana calada y bordes ondeados.',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    availability: 'En stock',
    colors: 'Dorado tradicional 18K, Oro rosa',
    freeShipping: true,
    specialOffer: true
  },
  {
    id: 'p3',
    title: 'Anillo Solitario Diamante Oro 18K',
    category: 'Anillos',
    price: 9400000,
    weight: '6.8g',
    purity: 'Oro 18K (Ley 750)',
    description: 'Exquisito anillo solitario de compromiso forjado en oro amarillo de 18 quilates con una corona de 6 uñas sosteniendo un diamante natural corte brillante.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    availability: 'En stock',
    colors: 'Dorado tradicional 18K, Oro blanco',
    freeShipping: true,
    specialOffer: false
  },
  {
    id: 'p4',
    title: 'Pulsera Cubana Miami Oro 18K (45g)',
    category: 'Pulseras',
    price: 15400000,
    weight: '45.0g',
    purity: 'Oro 18K (Ley 750)',
    description: 'Brazalete cubano cerrado con eslabones pulidos ultra planos y broche de cajón con doble seguro de ocho lateral. Oro 18K ley 750 garantizado.',
    image: 'https://images.unsplash.com/photo-1611591475870-716d9e0cf5c8?auto=format&fit=crop&w=600&q=80',
    availability: 'En stock',
    colors: 'Dorado tradicional 18K',
    freeShipping: true,
    specialOffer: true
  },
  {
    id: 'p5',
    title: 'Dije Cruz Facetada Esmeralda 18K',
    category: 'Dijes',
    price: 4950000,
    weight: '14.2g',
    purity: 'Oro 18K (Ley 750)',
    description: 'Dije de cruz con acabado diamantado que captura la luz, coronado en el centro con una esmeralda natural colombiana de Muzo certificada.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    availability: 'En stock',
    colors: 'Dorado tradicional 18K, Bicolor',
    freeShipping: true,
    specialOffer: false
  }
];

// Estado global de la aplicación
let products = JSON.parse(localStorage.getItem('saven_p_list')) || DEFAULT_PRODUCTS;
let favorites = JSON.parse(localStorage.getItem('saven_f_list')) || ['p1', 'p2'];
let cart = JSON.parse(localStorage.getItem('saven_c_list')) || [];
let currentUser = JSON.parse(localStorage.getItem('saven_c_user')) || { name: 'Samuel Vergara', role: 'joyero' };
let currentCategory = 'Todos';
let onlyFavoritesActive = false;
let isMobileView = false;
let currentPhotoUrl = DEFAULT_PRODUCTS[0].image;

// Inicialización de la App
window.addEventListener('DOMContentLoaded', () => {
  // Animación de la barra de carga en Splash
  let prog = 0;
  const bar = document.getElementById('splashProgressBar');
  const timer = setInterval(() => {
    prog += 10;
    if (bar) bar.style.width = prog + '%';
    if (prog >= 100) clearInterval(timer);
  }, 100);

  updateUserGreeting();
  renderProducts();
  updateCartBadge();
  updateFavBadge();
  setupModalBackdropListeners();

  // Soporte para navegación directa por hash en la URL (#auth, #hub, #catalog, #publish)
  const initialHash = window.location.hash.replace('#', '');
  if (['splash', 'auth', 'hub', 'catalog', 'publish'].includes(initialHash)) {
    navigateTo(initialHash);
  }
  
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['splash', 'auth', 'hub', 'catalog', 'publish'].includes(hash)) {
      navigateTo(hash);
    }
  });
});

/* --------------------------------------------------------------------------
   1. NAVEGACIÓN ENTRE PANTALLAS
   -------------------------------------------------------------------------- */
function navigateTo(screenId) {
  // Ocultar todas las pantallas
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  
  // Mostrar la pantalla destino
  const target = document.getElementById('screen-' + screenId);
  if (target) {
    target.classList.remove('hidden');
  }

  // Actualizar botones de navegación superior
  document.querySelectorAll('.sena-nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('navBtn-' + screenId);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  try {
    history.replaceState(null, '', '#' + screenId);
  } catch (e) {}

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* --------------------------------------------------------------------------
   2. SIMULADOR DE TELÉFONO MÓVIL
   -------------------------------------------------------------------------- */
function toggleMobileView() {
  const container = document.getElementById('appContainer');
  const text = document.getElementById('viewModeText');
  isMobileView = !isMobileView;

  if (isMobileView) {
    container.classList.add('mobile-view');
    if (text) text.innerText = 'Modo Completo';
    showToast('📱 Modo Móvil Activado');
  } else {
    container.classList.remove('mobile-view');
    if (text) text.innerText = 'Modo Móvil';
    showToast('🖥️ Modo Completo Activado');
  }
}

/* --------------------------------------------------------------------------
   3. AUTENTICACIÓN: LOGIN & REGISTRO
   -------------------------------------------------------------------------- */
function switchAuthTab(tab) {
  const formLog = document.getElementById('loginForm');
  const formReg = document.getElementById('registerForm');
  const btnLog = document.getElementById('tabBtnLogin');
  const btnReg = document.getElementById('tabBtnRegister');

  if (tab === 'login') {
    formLog.classList.remove('hidden');
    formReg.classList.add('hidden');
    btnLog.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-amber-400 text-zinc-950 transition';
    btnReg.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-zinc-400 hover:text-white transition';
  } else {
    formLog.classList.add('hidden');
    formReg.classList.remove('hidden');
    btnReg.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-amber-400 text-zinc-950 transition';
    btnLog.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-zinc-400 hover:text-white transition';
  }
}

function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  const eyeIcon = document.getElementById('loginPassEye');
  if (field) {
    const isPass = field.type === 'password';
    field.type = isPass ? 'text' : 'password';
    if (eyeIcon) {
      eyeIcon.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    }
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const userVal = document.getElementById('loginUser').value.trim();
  currentUser = { name: userVal || 'Samuel Vergara', role: 'joyero' };
  localStorage.setItem('saven_c_user', JSON.stringify(currentUser));
  updateUserGreeting();
  showToast(`¡Bienvenido a SAVEN, ${currentUser.name}!`);
  navigateTo('hub');
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  currentUser = { name: name || 'Cliente SAVEN', role: 'cliente' };
  localStorage.setItem('saven_c_user', JSON.stringify(currentUser));
  updateUserGreeting();
  showToast(`¡Cuenta creada con éxito!`);
  navigateTo('hub');
}

function quickLogin(name, role) {
  currentUser = { name: name, role: role };
  localStorage.setItem('saven_c_user', JSON.stringify(currentUser));
  updateUserGreeting();
  showToast(`Sesión iniciada como: ${name}`);
  navigateTo('hub');
}

function handleLogout() {
  currentUser = { name: 'Invitado', role: 'cliente' };
  localStorage.removeItem('saven_c_user');
  showToast('Has cerrado sesión correctamente');
  navigateTo('auth');
}

function updateUserGreeting() {
  const greetingEl = document.getElementById('userGreeting');
  const barEl = document.getElementById('userDisplayBar');
  if (greetingEl) {
    const firstName = currentUser.name.split(' ')[0].toUpperCase();
    greetingEl.innerText = `BUENOS DÍAS, ${firstName}`;
  }
  if (barEl) {
    barEl.innerText = currentUser.name;
  }
}

/* --------------------------------------------------------------------------
   4. CATÁLOGO DE PRODUCTOS (COMPRA)
   -------------------------------------------------------------------------- */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const query = (document.getElementById('searchJewelryInput')?.value || '').toLowerCase().trim();
  
  const filtered = products.filter(p => {
    if (currentCategory !== 'Todos' && p.category !== currentCategory) return false;
    if (onlyFavoritesActive && !favorites.includes(p.id)) return false;
    if (query) {
      return p.title.toLowerCase().includes(query) || 
             p.description.toLowerCase().includes(query) || 
             p.category.toLowerCase().includes(query);
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-zinc-500">
        <i class="fa-solid fa-gem text-4xl mb-3 text-amber-500/30"></i>
        <h4 class="text-sm font-bold text-zinc-300">No se encontraron piezas</h4>
        <p class="text-xs text-zinc-500 mt-1">Intenta con otra búsqueda o selecciona la categoría "Todos"</p>
        <button onclick="setCategoryFilter('Todos')" class="mt-4 px-4 py-2 bg-zinc-900 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold">
          Ver Todo el Catálogo
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isFav = favorites.includes(p.id);
    const formattedPrice = new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(p.price);

    return `
      <div class="product-card">
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          <span class="product-purity-badge">
            <i class="fa-solid fa-award mr-1 text-amber-400"></i> ${p.purity}
          </span>
          <button onclick="toggleFav('${p.id}')" class="product-fav-btn" title="Guardar en favoritos" aria-label="Favorito">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
          </button>
        </div>

        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span class="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">${p.category} · ${p.weight}</span>
            <h4 class="text-sm font-bold text-amber-200 mt-1 line-clamp-1">${p.title}</h4>
            <p class="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">${p.description}</p>
          </div>

          <div class="mt-4 pt-3 border-t border-zinc-800">
            <div class="flex justify-between items-baseline mb-2">
              <span class="text-[11px] text-zinc-500 uppercase tracking-wider">Precio Oro 18K</span>
              <span class="text-base font-bold font-mono text-amber-400">${formattedPrice}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button onclick="openProductDetail('${p.id}')" class="py-2.5 px-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 rounded-xl text-xs font-bold uppercase tracking-wider transition">
                DESCRIPCIÓN
              </button>
              <button onclick="addToCart('${p.id}')" class="py-2.5 px-2 gold-btn rounded-xl text-xs font-bold uppercase tracking-wider">
                COMPRAR
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setCategoryFilter(cat) {
  currentCategory = cat;
  document.querySelectorAll('.category-pill').forEach(btn => {
    if (btn.innerText === cat) {
      btn.className = 'category-pill active';
    } else {
      btn.className = 'category-pill';
    }
  });
  renderProducts();
}

function filterProducts() {
  renderProducts();
}

function toggleFavoritesFilter() {
  onlyFavoritesActive = !onlyFavoritesActive;
  const btn = document.getElementById('favFilterBtn');
  if (btn) {
    if (onlyFavoritesActive) {
      btn.classList.add('bg-amber-400', 'text-black', 'font-bold');
      btn.classList.remove('bg-zinc-900', 'text-zinc-300');
      showToast('Mostrando solo tus Joyas Favoritas ⭐');
    } else {
      btn.classList.remove('bg-amber-400', 'text-black', 'font-bold');
      btn.classList.add('bg-zinc-900', 'text-zinc-300');
    }
  }
  renderProducts();
}

function toggleFav(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    showToast('Joya eliminada de favoritos');
  } else {
    favorites.push(id);
    showToast('⭐ ¡Joya añadida a favoritos!');
  }
  localStorage.setItem('saven_f_list', JSON.stringify(favorites));
  updateFavBadge();
  renderProducts();
}

function updateFavBadge() {
  const b = document.getElementById('favCountBadge');
  if (b) b.innerText = favorites.length;
}

function openProductDetail(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  document.getElementById('modalDetailTitle').innerText = p.title;
  document.getElementById('modalDetailImg').src = p.image;
  document.getElementById('modalDetailDesc').innerText = p.description;
  document.getElementById('modalDetailWeight').innerText = p.weight;
  document.getElementById('modalDetailAvail').innerText = p.availability;
  document.getElementById('modalDetailColors').innerText = p.colors;
  document.getElementById('modalDetailPrice').innerText = new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    maximumFractionDigits: 0 
  }).format(p.price);

  const addBtn = document.getElementById('modalDetailAddBtn');
  addBtn.onclick = () => {
    addToCart(p.id);
    closeModal('modalDescription');
  };

  openModal('modalDescription');
}

/* --------------------------------------------------------------------------
   5. CARRITO DE COMPRAS
   -------------------------------------------------------------------------- */
function addToCart(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  const existing = cart.find(item => item.product.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product: p, quantity: 1 });
  }

  localStorage.setItem('saven_c_list', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
  showToast(`🛒 "${p.title}" añadida al carrito`);
}

function updateCartBadge() {
  const b = document.getElementById('cartCountBadge');
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (b) b.innerText = total;
}

function renderCart() {
  const c = document.getElementById('cartItemsContainer');
  const totalEl = document.getElementById('cartTotalPrice');
  if (!c) return;

  if (cart.length === 0) {
    c.innerHTML = `
      <div class="py-16 text-center text-zinc-500">
        <i class="fa-solid fa-cart-shopping text-4xl mb-3 text-zinc-700"></i>
        <h5 class="text-sm font-bold text-zinc-300">Tu carrito está vacío</h5>
        <p class="text-xs text-zinc-500 mt-1">Explora las joyas en oro 18K y añade tus favoritas</p>
      </div>
    `;
    if (totalEl) totalEl.innerText = '$0';
    return;
  }

  let subtotal = 0;
  c.innerHTML = cart.map(item => {
    subtotal += item.product.price * item.quantity;
    const formattedItemPrice = new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(item.product.price);

    return `
      <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center gap-3">
        <img src="${item.product.image}" class="w-14 h-14 rounded-lg object-cover border border-amber-900/30" alt="${item.product.title}">
        <div class="flex-1 min-w-0">
          <h5 class="text-xs font-bold text-white truncate">${item.product.title}</h5>
          <span class="text-[11px] font-mono text-amber-400 font-semibold">${formattedItemPrice}</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <button onclick="changeCartQty('${item.product.id}', -1)" class="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center justify-center font-bold" aria-label="Disminuir">-</button>
          <span class="font-bold font-mono px-1">${item.quantity}</span>
          <button onclick="changeCartQty('${item.product.id}', 1)" class="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center justify-center font-bold" aria-label="Aumentar">+</button>
        </div>
      </div>
    `;
  }).join('');

  if (totalEl) {
    totalEl.innerText = new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(subtotal);
  }
}

function changeCartQty(id, delta) {
  const idx = cart.findIndex(i => i.product.id === id);
  if (idx !== -1) {
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) {
      cart.splice(idx, 1);
    }
  }
  localStorage.setItem('saven_c_list', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function simulateOrderCheckout() {
  if (cart.length === 0) {
    showToast('⚠️ Agrega al menos una joya antes de comprar.');
    return;
  }
  const orderId = 'SAV-' + Math.floor(100000 + Math.random() * 900000);
  alert(`💎 ¡COMPRA PROCESADA CON ÉXITO!\n\nNúmero de Pedido: ${orderId}\nSe ha emitido el Certificado Digital de Oro 18K Ley 750 y programado el despacho asegurado desde Cúcuta.`);
  cart = [];
  localStorage.setItem('saven_c_list', JSON.stringify(cart));
  updateCartBadge();
  closeModal('modalCart');
  showToast('¡Pedido completado con éxito!');
}

/* --------------------------------------------------------------------------
   6. PUBLICACIÓN DE JOYAS (VENTA)
   -------------------------------------------------------------------------- */
function selectSampleImage() {
  const samplePhotos = [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1611591475870-716d9e0cf5c8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  ];
  currentPhotoUrl = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
  const img = document.getElementById('publishPreviewImg');
  const icon = document.getElementById('previewPlaceholderIcon');
  if (img && icon) {
    img.src = currentPhotoUrl;
    img.classList.remove('hidden');
    icon.classList.add('hidden');
  }
  showToast('Foto de muestra en Oro 18K seleccionada');
}

function handleFileSelected(e) {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentPhotoUrl = event.target.result;
      const img = document.getElementById('publishPreviewImg');
      const icon = document.getElementById('previewPlaceholderIcon');
      if (img && icon) {
        img.src = currentPhotoUrl;
        img.classList.remove('hidden');
        icon.classList.add('hidden');
      }
      showToast('Foto cargada exitosamente');
    };
    reader.readAsDataURL(file);
  }
}

function handlePublishSubmit(e) {
  e.preventDefault();

  const newJewel = {
    id: 'p-' + Date.now(),
    title: document.getElementById('pubTitle').value.trim(),
    category: document.getElementById('pubCategory').value,
    price: parseFloat(document.getElementById('pubPrice').value),
    weight: (document.getElementById('pubWeight').value || '10') + 'g',
    purity: 'Oro 18K (Ley 750)',
    description: document.getElementById('pubDescription').value.trim(),
    image: currentPhotoUrl,
    availability: document.getElementById('pubAvailability').value,
    colors: document.getElementById('pubColors').value,
    freeShipping: document.getElementById('checkFreeShipping').checked,
    specialOffer: document.getElementById('checkSpecialOffer').checked
  };

  products.unshift(newJewel);
  localStorage.setItem('saven_p_list', JSON.stringify(products));
  renderProducts();

  showToast('✨ ¡Joya en Oro 18K publicada con éxito!');
  navigateTo('catalog');
}

function handleCustomSubmit(e) {
  e.preventDefault();
  alert('💎 ¡Solicitud de personalización recibida!\nUn joyero orfebre de Cúcuta se comunicará a tu número de contacto con la propuesta 3D preliminar.');
  closeModal('modalCustom');
  showToast('Propuesta de diseño enviada al taller');
}

/* --------------------------------------------------------------------------
   7. GESTIÓN DE MODALES Y MENÚ LATERAL
   -------------------------------------------------------------------------- */
function openModal(id) {
  if (id === 'modalCart') {
    const overlay = document.getElementById('modalCartOverlay');
    const drawer = document.getElementById('modalCart');
    if (overlay && drawer) {
      overlay.classList.add('active');
      drawer.classList.add('active');
      renderCart();
    }
    return;
  }

  const m = document.getElementById(id);
  if (m) {
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  if (id === 'modalCart') {
    const overlay = document.getElementById('modalCartOverlay');
    const drawer = document.getElementById('modalCart');
    if (overlay && drawer) {
      overlay.classList.remove('active');
      drawer.classList.remove('active');
    }
    return;
  }

  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function openSideMenu() {
  const overlay = document.getElementById('sideMenuOverlay');
  const drawer = document.getElementById('sideMenuDrawer');
  if (overlay && drawer) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeSideMenu() {
  const overlay = document.getElementById('sideMenuOverlay');
  const drawer = document.getElementById('sideMenuDrawer');
  if (overlay && drawer) {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setupModalBackdropListeners() {
  // Cerrar al hacer clic en el backdrop de cualquier modal
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        const childDrawer = overlay.querySelector('.drawer-right, .drawer-left');
        if (childDrawer) {
          childDrawer.classList.remove('active');
        }
        document.body.style.overflow = '';
      }
    });
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => {
        m.classList.remove('active');
        const childDrawer = m.querySelector('.drawer-right, .drawer-left');
        if (childDrawer) {
          childDrawer.classList.remove('active');
        }
      });
      document.body.style.overflow = '';
    }
  });
}

/* --------------------------------------------------------------------------
   8. NOTIFICACIONES TOAST DE LUJO
   -------------------------------------------------------------------------- */
function showToast(message) {
  const existing = document.querySelector('.saven-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'saven-toast';
  toast.innerHTML = `<i class="fa-solid fa-gem text-amber-400"></i> <span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('active');
  });

  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
