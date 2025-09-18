export const toNum = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function computeJob(f: any) {
  const miles = toNum(f.milesToJob);
  const fuelRate = toNum(f.fuelRatePerMile);
  let fuelCost = toNum(f.fuelCost);
  if ((!fuelCost || fuelCost === 0) && fuelRate > 0) fuelCost = miles * fuelRate;

  const men = toNum(f.menCount);
  const days = toNum(f.days);
  const perDiem = toNum(f.hotelPerDiemPerManPerDay) || 125;
  let hotelTotal = toNum(f.hotelPerDiemTotal);
  if ((!hotelTotal || hotelTotal === 0) && perDiem > 0) hotelTotal = men * days * perDiem;

  const estDailyHrs = toNum(f.estDailyHoursInclTravel);
  const avgHr = toNum(f.avgHourlyRate);
  const labor = estDailyHrs * men * days * avgHr;

  const fullPrice = toNum(f.billingHours) * toNum(f.billingHourlyRate) + toNum(f.additionalChargedItems);

  const direct =
    labor +
    fuelCost +
    hotelTotal +
    toNum(f.materialCosts) +
    toNum(f.disposalCosts) +
    toNum(f.overheadPerDay) * days;

  const gp = fullPrice - direct;
  const gpPct = fullPrice > 0 ? gp / fullPrice : 0;

  return { fuelCost, hotelTotal, estTotalLaborCost: labor, fullJobPrice: fullPrice, totalDirectCost: direct, grossProfit: gp, grossProfitPct: gpPct };
}

