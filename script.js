// Frontend demo only: products/prices are placeholders and no order is stored on a server.
const WHATSAPP_NUMBER = "917057741901"; // India country code + phone number, digits only.

const products = [
  {
    id: 1, name: "Chocolate Dream Cake", category: "Chocolate", tag: "  Bestseller",
    description: "Rich chocolate layers with a smooth chocolate finish.",
    price: 349, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2, name: "Doremon", category: "Cartoon", tag: "Celebration",
    description: "A cheerful cake for your favourite person's special day.",
    price: 1199, image: "https://gurgaonbakers.com/wp-content/uploads/2026/04/doraemon-birthday-cake-gurgaon.jpg"
  },
  {
    id: 3, name: "Elegant Wedding Cake", category: "Wedding", tag: "Made to order",
    description: "An elegant centrepiece for a beautiful celebration.",
    price: 1399, image: "https://gurgaonbakers.com/wp-content/uploads/2025/10/less-cream-wedding-cake.jpg"
  },
  {
    id: 4, name: "Red Velvet", category: "Birthday", tag: "Customer favourite",
    description: "A soft, sweet look inspired by strawberry celebrations.",
    price: 599, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQireF-2boJcMyOfTIiht6c_S9XTN8Ue_BZ6RMV9mjtJh2HZStVeZK-h5G3&s=10"
  },
  {
    id: 5, name: "Truffle Overload", category: "Birthday", tag: "Truffle cake",
    description: "A little treat for sharing or gifting someone special.",
    price: 349, image: "https://content2.udora.com/data/flowers/1000x1000/26/1752666268_36818026.jpg"
  },
  {
    id: 6, name: "Midnight Chocolate", category: "Chocolate", tag: "Chocolate lovers",
    description: "A decadent chocolate-inspired design for sweet occasions.",
    price: 699, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToUjXJQ06tKAT3Zt97muXRa86ylaIlTG0yIhC8iMLY9Ajb3Uz5KJS3kUM&s=10"
  },
  {
    id: 7, name: "Golden Anniversary", category: "Wedding", tag: "Customisable",
    description: "A refined design for anniversaries and milestone moments.",
    price: 1799, image: "https://www.justbake.in/uploads1/50th-anniversary-cake-2609300525.jpg?v=1790745933"
  },
  {
    id: 8, name: "Vanilla Cake", category: "Birthday", tag: "Made to order",
    description: "A light, elegant cake with a timeless celebration style.",
    price: 299, image: "https://cakthe.com/wp-content/uploads/2026/06/vanilla-cake-recipe-1-1024x576.webp"
  },
  {
    id: 9, name: "Doremon Cake", category: "Cartoon", tag: "Customisable",
    description: "A light, elegant cake with a timeless celebration style.",
    price: 599, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrG7f2ud4I7C25N3hvAixhXHz-7iI6YNe1U9T2JkPIIFP7O2F8cpMD0UXq&s=10"
  },
  {
    id: 10, name: "Red Velvet", category: "Wedding", tag: "Made to order",
    description: "A light, elegant cake with a timeless celebration style.",
    price: 1399, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdyUymLAAtyWU3bKotmMD4yhuQhi52vbPs-5CGdk2jZ_ltOK3rmb0gFy3R&s=10"
  },
  {
    id: 11, name: "Chota Bheem", category: "Birthday", tag: "Customisable",
    description: "A light, elegant cake with a timeless celebration style.",
    price: 999, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWTEWtcwFdPlVcwQx3wjqsnJSoRX9LCdDHduBwe-QhDUhCH6AkwP4Jqko&s=10"
  },
  {
    id: 12, name: "Rasmalai Cake", category: "Birthday", tag: "Made to order",
    description: "A light, elegant cake with a timeless celebration style.",
    price: 349, image: "https://bakewithshivesh.com/wp-content/uploads/2021/04/IMG_3929-scaled.jpg"
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
