export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.max(0, value))
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits }).format(value)
}

export function calculateSIP(monthlyInvestment: number, annualRate: number, years: number) {
  const months = years * 12
  const monthlyRate = annualRate / 12 / 100
  const invested = monthlyInvestment * months
  const maturity = monthlyRate === 0
    ? invested
    : monthlyInvestment * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate)
  return { maturity, invested, returns: maturity - invested }
}

export function calculateFD(principal: number, annualRate: number, years: number) {
  const maturity = principal * (1 + annualRate / 400) ** (4 * years)
  return { maturity, invested: principal, interest: maturity - principal }
}

export function calculatePercentage(original: number, percent: number) {
  const discount = original * percent / 100
  return { discount, finalAmount: original - discount, savedPercent: percent }
}

export function calculateSplit(total: number, people: number, tipPercent = 0) {
  const safePeople = Math.max(1, Math.floor(people))
  const tip = total * tipPercent / 100
  const grandTotal = total + tip
  return { tip, grandTotal, perPerson: grandTotal / safePeople, people: safePeople }
}

export function calculateEMI(principal: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 12 / 100
  const months = years * 12
  const emi = monthlyRate === 0
    ? principal / months
    : principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1)
  const total = emi * months
  return { emi, total, interest: total - principal, months }
}

export function calculateGST(amount: number, rate: number, inclusive: boolean) {
  if (!inclusive) {
    const gst = amount * rate / 100
    return { base: amount, gst, total: amount + gst }
  }
  const base = amount * 100 / (100 + rate)
  const gst = amount - base
  return { base, gst, total: amount }
}

export function calculateSalary(ctcAnnual: number) {
  const basic = ctcAnnual * 0.40
  const employerPf = Math.min(basic * 0.12, 21600)
  const professionalTax = 2500
  const employeePf = basic * 0.12
  const annualTaxable = Math.max(0, ctcAnnual - 75000)

  const slabTax =
    (Math.min(annualTaxable, 400000) * 0) +
    (Math.max(0, Math.min(annualTaxable, 800000) - 400000) * 0.05) +
    (Math.max(0, Math.min(annualTaxable, 1200000) - 800000) * 0.10) +
    (Math.max(0, Math.min(annualTaxable, 1600000) - 1200000) * 0.15) +
    (Math.max(0, Math.min(annualTaxable, 2000000) - 1600000) * 0.20) +
    (Math.max(0, Math.min(annualTaxable, 2400000) - 2000000) * 0.25) +
    (Math.max(0, annualTaxable - 2400000) * 0.30)

  const rebate = annualTaxable <= 1200000 ? slabTax : 0
  let incomeTax = Math.max(0, slabTax - rebate)

  // Approximate marginal relief around the 87A rebate limit.
  if (annualTaxable > 1200000 && annualTaxable <= 1275000) {
    incomeTax = Math.min(incomeTax, annualTaxable - 1200000)
  }

  const annualInHand = ctcAnnual - employeePf - professionalTax - incomeTax
  return {
    annualInHand,
    monthlyInHand: annualInHand / 12,
    employeePf,
    incomeTax,
    annualTaxable,
    slabTax,
  }
}

