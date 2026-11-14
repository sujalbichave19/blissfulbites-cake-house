import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
const loginPanel=document.getElementById("login-panel"), dashboard=document.getElementById("dashboard"), message=document.getElementById("message"), reviewsEl=document.getElementById("reviews"), ordersEl=document.getElementById("orders");
let unsubscribe=null, unsubscribeOrders=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();const f=e.currentTarget;try{await signInWithEmailAndPassword(auth,f.email.value.trim(),f.password.value);message.textContent="";}catch(err){console.error(err);message.textContent="Login failed. Check your email and password.";}});
document.getElementById("logout").addEventListener("click",()=>signOut(auth));
onAuthStateChanged(auth,user=>{
 if(unsubscribe){unsubscribe();unsubscribe=null;}
 if(unsubscribeOrders){unsubscribeOrders();unsubscribeOrders=null;}
 if(!user){loginPanel.classList.remove("hidden");dashboard.classList.add("hidden");return;}
 loginPanel.classList.add("hidden");dashboard.classList.remove("hidden");document.getElementById("admin-email").textContent=user.email||"Admin";
 const q=query(collection(db,"reviews"),where("status","==","pending"),orderBy("createdAt","asc"));
 unsubscribe=onSnapshot(q,snapshot=>{
  if(snapshot.empty){reviewsEl.innerHTML='<div class="review">No pending reviews.</div>';return;}
  reviewsEl.innerHTML=snapshot.docs.map(d=>{const r=d.data();return `<article class="review" data-id="${esc(d.id)}"><div class="stars">${"★".repeat(Math.max(1,Math.min(5,Number(r.rating)||5)))}</div><h3>${esc(r.name)}</h3><p>${esc(r.message)}</p><button data-action="approve">Approve</button><button class="reject" data-action="reject">Reject</button><button class="reject" data-action="delete">Delete permanently</button></article>`}).join("");
 },err=>{console.error(err);message.textContent="Could not load reviews. Check admin access and Firestore rules.";});
 const ordersQuery=query(collection(db,"orders"),orderBy("createdAt","desc"));
 unsubscribeOrders=onSnapshot(ordersQuery,snap=>{
  if(snap.empty){ordersEl.innerHTML='<p class="muted">No customer orders yet.</p>';return;}
  ordersEl.innerHTML=snap.docs.map(d=>{const o=d.data();const items=(o.items||[]).map(i=>`${esc(i.name)} × ${Number(i.quantity)||1}`).join(", ");return `<article class="review" data-order-id="${esc(d.id)}"><h3>${esc(o.customerName||"Customer")} · ${esc(o.customerPhone||o.customerEmail||"")}</h3><p>${items}</p><p><strong>${o.total?"₹"+Number(o.total):"Custom enquiry"}</strong> · <span class="muted">${esc(o.status||"pending")}</span></p><label>Update status <select data-order-status><option value="pending" ${o.status==="pending"?"selected":""}>Pending</option><option value="confirmed" ${o.status==="confirmed"?"selected":""}>Confirmed</option><option value="preparing" ${o.status==="preparing"?"selected":""}>Preparing</option><option value="ready" ${o.status==="ready"?"selected":""}>Ready</option><option value="delivered" ${o.status==="delivered"?"selected":""}>Delivered</option><option value="cancelled" ${o.status==="cancelled"?"selected":""}>Cancelled</option></select></label><button data-order-save>Save status</button></article>`}).join("");
 },err=>{console.error(err);message.textContent="Could not load orders. Check admin UID and Firestore rules.";});
});
reviewsEl.addEventListener("click",async e=>{const action=e.target.dataset.action;if(!action)return;const card=e.target.closest("[data-id]");if(!card)return;const id=card.dataset.id;e.target.disabled=true;try{const ref=doc(db,"reviews",id);if(action==="approve")await updateDoc(ref,{status:"approved"});else if(action==="reject")await updateDoc(ref,{status:"rejected"});else if(action==="delete"&&confirm("Permanently delete this review?"))await deleteDoc(ref);}catch(err){console.error(err);message.textContent="Action failed. Confirm this account is an authorized admin.";}finally{e.target.disabled=false;}});

ordersEl.addEventListener("click",async e=>{if(!e.target.matches("[data-order-save]"))return;const card=e.target.closest("[data-order-id]"),id=card?.dataset.orderId,status=card?.querySelector("[data-order-status]")?.value;if(!id||!status)return;e.target.disabled=true;try{await updateDoc(doc(db,"orders",id),{status,updatedAt:new Date()});message.textContent="Order status updated.";}catch(err){console.error(err);message.textContent="Could not update order status.";}finally{e.target.disabled=false;}});
