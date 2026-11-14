import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
const app=initializeApp(firebaseConfig), auth=getAuth(app), db=getFirestore(app);
const loginPanel=document.getElementById("login-panel"), dashboard=document.getElementById("dashboard"), message=document.getElementById("message"), reviewsEl=document.getElementById("reviews");
let unsubscribe=null;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();const f=e.currentTarget;try{await signInWithEmailAndPassword(auth,f.email.value.trim(),f.password.value);message.textContent="";}catch(err){console.error(err);message.textContent="Login failed. Check your email and password.";}});
document.getElementById("logout").addEventListener("click",()=>signOut(auth));
onAuthStateChanged(auth,user=>{
 if(unsubscribe){unsubscribe();unsubscribe=null;}
 if(!user){loginPanel.classList.remove("hidden");dashboard.classList.add("hidden");return;}
 loginPanel.classList.add("hidden");dashboard.classList.remove("hidden");document.getElementById("admin-email").textContent=user.email||"Admin";
 const q=query(collection(db,"reviews"),where("status","==","pending"),orderBy("createdAt","asc"));
 unsubscribe=onSnapshot(q,snapshot=>{
  if(snapshot.empty){reviewsEl.innerHTML='<div class="review">No pending reviews.</div>';return;}
  reviewsEl.innerHTML=snapshot.docs.map(d=>{const r=d.data();return `<article class="review" data-id="${esc(d.id)}"><div class="stars">${"★".repeat(Math.max(1,Math.min(5,Number(r.rating)||5)))}</div><h3>${esc(r.name)}</h3><p>${esc(r.message)}</p><button data-action="approve">Approve</button><button class="reject" data-action="reject">Reject</button><button class="reject" data-action="delete">Delete permanently</button></article>`}).join("");
 },err=>{console.error(err);message.textContent="Could not load reviews. Check admin access and Firestore rules.";});
});
reviewsEl.addEventListener("click",async e=>{const action=e.target.dataset.action;if(!action)return;const card=e.target.closest("[data-id]");if(!card)return;const id=card.dataset.id;e.target.disabled=true;try{const ref=doc(db,"reviews",id);if(action==="approve")await updateDoc(ref,{status:"approved"});else if(action==="reject")await updateDoc(ref,{status:"rejected"});else if(action==="delete"&&confirm("Permanently delete this review?"))await deleteDoc(ref);}catch(err){console.error(err);message.textContent="Action failed. Confirm this account is an authorized admin.";}finally{e.target.disabled=false;}});
