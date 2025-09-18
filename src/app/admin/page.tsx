"use client";
import AuthGate, { LogoutBtn } from "@/components/AuthGate";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import React, { useEffect, useMemo, useState } from "react";
import { ProfitTrend, CostPie } from "@/components/Charts";

export default function AdminPage(){
  return <AuthGate requireAdmin><Admin/></AuthGate>;
}

function Admin(){
  const [rows, setRows] = useState<any[]>([]);
  const [ai, setAI] = useState<{kpis:any, insights:string}|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ (async()=>{
    const qy = query(collection(db,"jobs"), orderBy("createdAt","desc"));
    const snap = await getDocs(qy);
    setRows(snap.docs.map(d=>({ id:d.id, ...d.data() })));
  })(); },[]);

  const trend = useMemo(()=>{
    const recent = [...rows].reverse().slice(0,20);
    return recent.map((r,i)=>({ name:r.jobName?.slice(0,10) || `#${i+1}`, gp:Number(((r.grossProfitPct||0)*100).toFixed(2)) }));
  },[rows]);

  const pie = useMemo(()=>{
    if(!rows.length) return [];
    const j = rows[0];
    return [
      { name: "Labor", value: j.estTotalLaborCost || 0 },
      { name: "Fuel", value: j.fuelCost || 0 },
      { name: "Hotel/PerDiem", value: j.hotelPerDiemTotal || 0 },
      { name: "Materials", value: j.materialCosts || 0 },
      { name: "Disposal", value: j.disposalCosts || 0 },
      { name: "Overhead", value: (j.overheadPerDay||0) * (j.days||0) }
    ];
  },[rows]);

  const analyze = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/analyze", { method:"POST" });
      const data = await r.json(); setAI(data);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <h2>Admin Dashboard</h2>
        <button className="primary" onClick={analyze}>{loading? "Analyzing…" : "Analyze (AI)"}</button>
        <LogoutBtn/>
      </div>

      <div className="grid grid-2" style={{ marginTop:12 }}>
        <div className="card"><h3>Profit Trend</h3><ProfitTrend data={trend}/></div>
        <div className="card"><h3>Latest Job Cost Breakdown</h3><CostPie data={pie}/></div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>All Jobs</h3>
        <table className="table">
          <thead><tr><th>Job</th><th>Full Price</th><th>GP%</th><th>Date</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id}>
                <td>{r.jobName}</td>
                <td>${(r.fullJobPrice||0).toFixed(2)}</td>
                <td>{((r.grossProfitPct||0)*100).toFixed(2)}%</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ai && (
        <div className="card" style={{ marginTop:12 }}>
          <h3>AI Analysis</h3>
          <p>
            <b>Total Revenue:</b> ${ai.kpis.totalRevenue.toFixed(2)} &nbsp;|&nbsp;
            <b>Avg GP%:</b> {(ai.kpis.avgGrossProfitPct*100).toFixed(2)}% &nbsp;|&nbsp;
            <b>Avg Direct Cost%:</b> {(ai.kpis.avgDirectCostPct*100).toFixed(2)}%
          </p>
          <pre style={{ whiteSpace:"pre-wrap" }}>{ai.insights}</pre>
        </div>
      )}
    </>
  );
}

