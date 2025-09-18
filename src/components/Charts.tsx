"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
export function ProfitTrend({ data }: { data: { name: string, gp: number }[] }) {
  return (
    <div style={{ width:"100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis domain={[0,100]}/>
          <Tooltip/>
          <Line type="monotone" dataKey="gp" stroke="#22c55e" strokeWidth={2} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export function CostPie({ data }: { data: { name:string, value:number }[] }) {
  const COLORS = ["#10b981","#06b6d4","#f59e0b","#ef4444","#8b5cf6","#22c55e"];
  return (
    <div style={{ width:"100%", height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} outerRadius={100} label>
            {data.map((_, i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
          </Pie>
          <Tooltip/><Legend/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

