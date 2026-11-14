import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const root = document.getElementById("bb-reviews");
if (!root) console.warn("BlissfulBites reviews: #bb-reviews element was not found.");

if (root) {
  const list = root.querySelector("#bb-review-list");
  const form = root.querySelector("#bb-review-form");
  const status = root.querySelector("#bb-review-status");
  const stars = [...root.querySelectorAll(".bb-star-picker button")];
  let selectedRating = 5;

  function setRating(value) {
    selectedRating = value;
    stars.forEach((button, index) => {
      button.classList.toggle("is-selected", index < value);
      button.setAttribute("aria-pressed", String(index < value));
    });
  }
  stars.forEach((button, index) => button.addEventListener("click", () => setRating(index + 1)));
  setRating(5);

  function safeText(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
  function displayDate(value) {
    if (!value?.toDate) return "Customer review";
    return value.toDate().toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"});
  }

  // Public query intentionally requests only approved reviews.
  const reviewsQuery = query(collection(db, "reviews"), where("status", "==", "approved"), orderBy("createdAt", "desc"), limit(12));
  onSnapshot(reviewsQuery, snapshot => {
    if (snapshot.empty) {
      list.innerHTML = '<div class="bb-review-empty">Be the first to share your cake experience!</div>';
      return;
    }
    list.innerHTML = snapshot.docs.map(doc => {
      const review = doc.data();
      const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
      return `<article class="bb-review-card"><div class="bb-stars" aria-label="${rating} out of 5 stars">${"★".repeat(rating)}${"☆".repeat(5-rating)}</div><p>${safeText(review.message)}</p><div class="bb-review-meta"><strong>${safeText(review.name)}</strong> · ${safeText(displayDate(review.createdAt))}</div></article>`;
    }).join("");
  }, error => {
    console.error(error);
    list.innerHTML = '<div class="bb-review-empty">Reviews are temporarily unavailable. Please try again later.</div>';
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const message = form.elements.message.value.trim();
    if (name.length < 2 || name.length > 50 || message.length < 10 || message.length > 600) {
      status.textContent = "Enter a name (2–50 characters) and a review (10–600 characters).";
      return;
    }
    const submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    status.textContent = "Submitting your review…";
    try {
      console.log("Review data:", {
  name,
  message,
  rating: selectedRating,
  ratingType: typeof selectedRating
}); 
      await addDoc(collection(db, "reviews"), {
        name, message, rating: selectedRating, status: "approved", createdAt: serverTimestamp()
      });
      form.reset();
      setRating(5);
      status.textContent = "Thank you! Your review has been published successfully.";
    } catch (error) {
      console.error(error);
      status.textContent = "Could not submit your review. Please try again later.";
    } finally {
      submit.disabled = false;
    }
  });
}
