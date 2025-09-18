"use client";
import AuthGate, { LogoutBtn } from "@/components/AuthGate";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import React, { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  return (
    <AuthGate>
      <Dash />
    </AuthGate>
  );
}

function Dash() {
  const [rows, setRows] = useState<any[]>([]);
  const [qTxt, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const uid = auth.currentUser!.uid;
      const q = query(collection(db, "jobs"), where("createdBy", "==", uid), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const filtered = useMemo(() => rows.filter(r => (r.jobName||"").toLowerCase().includes(qTxt.toLowerCase())), [rows, qTxt]);

  const exportCSV = () => {
    const headers = ["Job Name","Full Price","Gross Profit %","Date"];
    const lines = filtered.map(r => [r.jobName, r.fullJobPrice?.toFixed(2), ((r.grossProfitPct||0)*100).toFixed(2)+"%", new Date(r.createdAt).toLocaleString()].join(","));
    const blob = new Blob([headers.join(",")+"\n"+lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="jobs.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <h2>My Jobs</h2>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <input placeholder="Search…" value={qTxt} onChange={e=>setQ(e.target.value)} />
        <button onClick={exportCSV}>Export CSV</button>
        <a className="primary" href="/new">New Job</a>
        <LogoutBtn />
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <table className="table">
          <thead><tr><th>Job</th><th>Full Price</th><th>GP%</th><th>Date</th></tr></thead>
          <tbody>
          {filtered.map(r=>(
            <tr key={r.id}>
              <td>{r.jobName}</td>
              <td>${(r.fullJobPrice||0).toFixed(2)}</td>
              <td>{((r.grossProfitPct||0)*100).toFixed(2)}%</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {!filtered.length && <tr><td colSpan={4} style={{ textAlign:"center", color:"#94a3b8" }}>No jobs yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

