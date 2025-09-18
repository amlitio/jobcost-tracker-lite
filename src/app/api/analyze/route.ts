import { NextResponse } from "next/server";
import { collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { getApps, initializeApp } from "firebase/app";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

function kpis(jobs:any[]) {
  if(!jobs.length) return { totalRevenue:0, avgGrossProfitPct:0, avgDirectCostPct:0, profitTrend:[] as number[] };
  const totalRevenue = jobs.reduce((s,j)=>s+(j.fullJobPrice||0),0);
  const totalGP = jobs.reduce((s,j)=>s+(j.grossProfit||0),0);
  const avgGrossProfitPct = totalRevenue>0 ? totalGP/totalRevenue : 0;
  const totalDirectCost = jobs.reduce((s,j)=>s+(j.totalDirectCost||0),0);
  const avgDirectCostPct = totalRevenue>0 ? totalDirectCost/totalRevenue : 0;
  const last = jobs.slice(0,10).reverse();
  const profitTrend = last.map((j)=>Number(((j.grossProfitPct||0)*100).toFixed(2)));
  return { totalRevenue, avgGrossProfitPct, avgDirectCostPct, profitTrend };
}

export async function POST() {
  // Fetch recent jobs
  const qy = query(collection(db,"jobs"), orderBy("createdAt","desc"));
  const snap = await getDocs(qy);
  const jobs = snap.docs.map(d=>d.data());

  const metrics = kpis(jobs);

  const prompt = `
You are an ops finance analyst for a hydro-excavation contractor.
Analyze these jobs (JSON). Provide:
1) KPIs: avg gross profit %, total revenue, average direct cost %, profit trend (last 10 points)
2) Top cost drivers and notable trends
3) Three concrete exec recommendations to improve margins

JSON:
${JSON.stringify(jobs)}
`.trim();

  // Try Gemini first
  const gemKey = process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  let insights = "";

  if (gemKey) {
    try {
      const genAI = new GoogleGenerativeAI(gemKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const r = await model.generateContent(prompt);
      insights = r.response.text();
    } catch(e:any) {
      insights = "";
    }
  }
  if (!insights && openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const r = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });
      insights = r.choices?.[0]?.message?.content || "";
    } catch(e:any) {
      insights = "";
    }
  }
  if (!insights) {
    insights = `Fallback KPIs: Avg GP% ${(metrics.avgGrossProfitPct*100).toFixed(1)} | Avg Direct Cost% ${(metrics.avgDirectCostPct*100).toFixed(1)} | Trend: ${metrics.profitTrend.join(", ")}
Recommendations:
1) Raise billing rate or add surcharge when milesToJob > 200 or hotel/per diem applies > 3 nights.
2) Add approval gate for GP% < 30%; scrutinize OH/day and travel hours.
3) Track fuel and disposal vs. estimate; add automatic variance alert at ±10%.`;
  }

  return NextResponse.json({ kpis: metrics, insights });
}
