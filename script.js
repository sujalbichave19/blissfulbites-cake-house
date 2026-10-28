// Frontend demo only: products/prices are placeholders and no order is stored on a server.
const WHATSAPP_NUMBER = "917057741901"; // India country code + phone number, digits only.

const products = [
  {
    id: 1, name: "Chocolate Dream Cake", category: "Chocolate", tag: "Bestseller",
    description: "Rich chocolate layers with a smooth chocolate finish.",
    price: 699, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2, name: "Classic Celebration", category: "Birthday", tag: "Celebration",
    description: "A cheerful cake for your favourite person's special day.",
    price: 799, image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3, name: "Elegant Wedding Cake", category: "Wedding", tag: "Made to order",
    description: "An elegant centrepiece for a beautiful celebration.",
    price: 2499, image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4, name: "Strawberry Blush", category: "Birthday", tag: "Customer favourite",
    description: "A soft, sweet look inspired by strawberry celebrations.",
    price: 899, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5, name: "Cupcake Moments", category: "Cupcakes", tag: "Box of 6",
    description: "A little treat for sharing or gifting someone special.",
    price: 349, image: "https://images.unsplash.com/photo-1426869884541-df7117556757?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6, name: "Midnight Chocolate", category: "Chocolate", tag: "Chocolate lovers",
    description: "A decadent chocolate-inspired design for sweet occasions.",
    price: 999, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7, name: "Golden Anniversary", category: "Wedding", tag: "Customisable",
    description: "A refined design for anniversaries and milestone moments.",
    price: 1599, image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8, name: "Vanilla Garden Cake", category: "Birthday", tag: "Made to order",
    description: "A light, elegant cake with a timeless celebration style.",
    price: 749, image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=700&q=80"
  }
];

let activeCategory = "All";
let cart = [];
const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");
let toastTimer;

function money(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
function safeText(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}
function renderProducts() {
  const query = document.getElementById("cakeSearch").value.trim().toLowerCase();
  const visible = products.filter(p => {
    const categoryMatch = activeCategory === "All" ||
      p.category === activeCategory ||
      (activeCategory === "Birthday" && p.category === "Birthday");
    const queryMatch = `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
  if (!visible.length) {
    productGrid.innerHTML = '<div class="no-results">No cakes matched your search. Try another name or category.</div>';
    return;
  }
  productGrid.innerHTML = visible.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${safeText(p.name)}" loading="lazy">
        <span class="product-tag">${safeText(p.tag)}</span>
      </div>
      <div class="product-info">
        <p class="product-category">${safeText(p.category)}</p>
        <h3>${safeText(p.name)}</h3>
        <p class="product-description">${safeText(p.description)}</p>
        <div class="product-bottom">
          <span class="product-price">${money(p.price)}*</span>
          <button class="add-button" data-add="${p.id}" aria-label="Add ${safeText(p.name)} to bag">+</button>
        </div>
      </div>
    </article>
  `).join("");
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function addToCart(id) {
  const item = cart.find(entry => entry.id === id);
  if (item) item.quantity += 1;
  else cart.push({ id, quantity: 1 });
  renderCart();
  showToast("Added to your cake bag.");
}
function changeQuantity(id, delta) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += delta;
  cart = cart.filter(entry => entry.quantity > 0);
  renderCart();
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  cartCount.textContent = count;
  cartTotal.textContent = money(total);
  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your bag is waiting for something sweet.</p>';
    return;
  }
  cartItems.innerHTML = cart.map(item => {
    const p = products.find(product => product.id === item.id);
    return `<div class="cart-item">
      <img src="${p.image}" alt="">
      <div><h3>${safeText(p.name)}</h3><p>${money(p.price)} each</p>
        <div class="quantity-controls">
          <button data-quantity="${p.id}" data-delta="-1" aria-label="Remove one ${safeText(p.name)}">−</button>
          <span>${item.quantity}</span>
          <button data-quantity="${p.id}" data-delta="1" aria-label="Add one ${safeText(p.name)}">+</button>
        </div>
      </div>
      <span class="cart-item-price">${money(p.price * item.quantity)}</span>
    </div>`;
  }).join("");
}
function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartOverlay.hidden = false;
  document.body.classList.add("cart-open");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartOverlay.hidden = true;
  document.body.classList.remove("cart-open");
}
function sendWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
document.getElementById("cakeSearch").addEventListener("input", renderProducts);
document.getElementById("filterChips").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".chip").forEach(chip => chip.classList.toggle("active", chip === button));
  renderProducts();
});
document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-quantity]");
  if (button) changeQuantity(Number(button.dataset.quantity), Number(button.dataset.delta));
});
document.getElementById("checkoutWhatsApp").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Add a cake to your bag first.");
    return;
  }
  const lines = cart.map(item => {
    const p = products.find(product => product.id === item.id);
    return `• ${p.name} × ${item.quantity} — ${money(p.price * item.quantity)}`;
  });
  const total = cart.reduce((sum, item) => sum + products.find(p => p.id === item.id).price * item.quantity, 0);
  const message = `Hello The BlissfulBites Cake House! I'd like to enquire about this order:\n\n${lines.join("\n")}\n\nEstimated subtotal: ${money(total)}\n\nPlease confirm availability, final pricing and pickup arrangements. I understand this is an enquiry, not a confirmed order.`;
  sendWhatsApp(message);
});
document.getElementById("customOrderForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = [
    "Hello The BlissfulBites Cake House! I'd like to enquire about a custom cake.",
    "",
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Occasion: ${data.get("occasion")}`,
    `Required date: ${data.get("date")}`,
    `Flavour: ${data.get("flavour") || "Not specified"}`,
    `Size / servings: ${data.get("size") || "Not specified"}`,
    `Design details: ${data.get("details") || "Not specified"}`,
    "",
    "Please confirm availability, final price and pickup arrangements. I understand this is an enquiry, not a confirmed booking."
  ].join("\n");
  sendWhatsApp(message);
});
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));
document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();

// Keep date input from accepting past dates.
const dateInput = document.querySelector('input[name="date"]');
if (dateInput) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = localToday;
}
