"use client";
import React, { useMemo, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { computeJob, toNum } from "@/lib/calc";

export default function JobForm() {
  const [f, setF] = useState<any>({
    jobName: "", milesToJob: 0, fuelRatePerMile: 0, fuelCost: 0,
    menCount: 0, days: 0, hotelPerDiemPerManPerDay: 125, hotelPerDiemTotal: 0,
    estDailyHoursInclTravel: 0, avgHourlyRate: 0,
    billingHours: 0, billingHourlyRate: 0, additionalChargedItems: 0,
    materialCosts: 0, disposalCosts: 0,
    overheadPerDay: 0, percentAssumptionA: 0.8, percentAssumptionB: 0.015
  });

  const calc = useMemo(()=>computeJob(f),[f]);
  const update = (k:string)=>(e:any)=>setF((s:any)=>({...s,[k]:e.target.value}));

  const save = async () => {
    const user = auth.currentUser;
    if(!user) return alert("Login required");
    const payload:any = { ...f };
    Object.keys(payload).forEach(k => payload[k] = toNum(payload[k]) || payload[k]);
    const c = computeJob(payload);
    await addDoc(collection(db, "jobs"), { ...payload, ...c, createdBy: user.uid, createdAt: Date.now() });
    window.location.href = "/";
  };

  return (
    <>
      <div className="card grid grid-2">
        <h3 style={{ gridColumn: "1 / -1" }}>New Job</h3>
        <div><label>Job Name/Number</label><input value={f.jobName} onChange={update("jobName")} /></div>
        <div><label>Miles to Job</label><input type="number" value={f.milesToJob} onChange={update("milesToJob")} /></div>
        <div><label>Fuel Rate (per mile)</label><input type="number" value={f.fuelRatePerMile} onChange={update("fuelRatePerMile")} /></div>
        <div><label>Fuel Cost (override)</label><input type="number" value={f.fuelCost} onChange={update("fuelCost")} /></div>
        <div><label># of Men</label><input type="number" value={f.menCount} onChange={update("menCount")} /></div>
        <div><label># Days</label><input type="number" value={f.days} onChange={update("days")} /></div>
        <div><label>Hotel & Per Diem ($/man/day)</label><input type="number" value={f.hotelPerDiemPerManPerDay} onChange={update("hotelPerDiemPerManPerDay")} /></div>
        <div><label>Hotel & Per Diem (override total)</label><input type="number" value={f.hotelPerDiemTotal} onChange={update("hotelPerDiemTotal")} /></div>
        <div><label>Est Daily Hrs incl Travel</label><input type="number" value={f.estDailyHoursInclTravel} onChange={update("estDailyHoursInclTravel")} /></div>
        <div><label>Avg Hourly Rate</label><input type="number" value={f.avgHourlyRate} onChange={update("avgHourlyRate")} /></div>
        <div><label>Billing Hours</label><input type="number" value={f.billingHours} onChange={update("billingHours")} /></div>
        <div><label>Billing Hourly Rate</label><input type="number" value={f.billingHourlyRate} onChange={update("billingHourlyRate")} /></div>
        <div><label>Additional Charged Items</label><input type="number" value={f.additionalChargedItems} onChange={update("additionalChargedItems")} /></div>
        <div><label>Material Costs</label><input type="number" value={f.materialCosts} onChange={update("materialCosts")} /></div>
        <div><label>Disposal Costs</label><input type="number" value={f.disposalCosts} onChange={update("disposalCosts")} /></div>
        <div><label>OH per Day</label><input type="number" value={f.overheadPerDay} onChange={update("overheadPerDay")} /></div>
      </div>

      <div className="card grid grid-3" style={{ marginTop: 12 }}>
        <div><b>Est Total Labor Cost</b><div className="badge">${calc.estTotalLaborCost.toFixed(2)}</div></div>
        <div><b>Full Job Price</b><div className="badge">${calc.fullJobPrice.toFixed(2)}</div></div>
        <div><b>Total Direct Cost</b><div className="badge">${calc.totalDirectCost.toFixed(2)}</div></div>
        <div><b>Fuel Cost</b><div className="badge">${calc.fuelCost.toFixed(2)}</div></div>
        <div><b>Hotel/Per Diem</b><div className="badge">${calc.hotelTotal.toFixed(2)}</div></div>
        <div><b>Gross Profit</b><div className="badge">${calc.grossProfit.toFixed(2)}</div></div>
        <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
          <span className="badge">Gross Profit %: {(calc.grossProfitPct * 100).toFixed(2)}%</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="primary" onClick={save}>Save Job</button>
        <a className="badge" href="/">Cancel</a>
      </div>
    </>
  );
}

