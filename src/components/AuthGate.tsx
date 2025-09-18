"use client";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

export default function AuthGate({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const [state, setState] = useState<{ loading: boolean; user: any; role?: string }>({ loading: true, user: null });

  useEffect(() =>
    onAuthStateChanged(auth, async (u) => {
      if (!u) return setState({ loading: false, user: null });
      let role = "manager";
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) role = (snap.data() as any).role || "manager";
      setState({ loading: false, user: u, role });
    })
  , []);

  if (state.loading) return <div>Loading…</div>;
  if (!state.user) return <AuthPanel />;

  if (requireAdmin && state.role !== "admin") return <div>Admins only.</div>;
  return <>{children}</>;
}

function AuthPanel() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [signingUp, setSU] = useState(false);
  const go = async () => signingUp ? createUserWithEmailAndPassword(auth, email, pw) : signInWithEmailAndPassword(auth, email, pw);
  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>{signingUp ? "Sign up" : "Log in"}</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <button onClick={go} className="primary">{signingUp ? "Create account" : "Login"}</button>
      <button onClick={()=>setSU(!signingUp)}>{signingUp ? "Have an account? Login" : "Create account"}</button>
    </div>
  );
}

export const LogoutBtn = () => <button onClick={()=>signOut(auth)}>Logout</button>;

