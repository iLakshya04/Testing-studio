import { describe, expect, it } from 'vitest'
import {
  calculateEMI,
  calculateFD,
  calculateGST,
  calculatePercentage,
  calculateSalary,
  calculateSplit,
  calculateSIP,
  formatINR,
} from './utils'

describe('calculateEMI', () => {
  it('calculates a 20-year loan EMI', () => {
    const result = calculateEMI(1500000, 8.5, 20)
    expect(result.emi).toBeCloseTo(13017.35, 0)
    expect(result.months).toBe(240)
  })
})

describe('calculateGST', () => {
  it('adds GST to an exclusive amount', () => {
    expect(calculateGST(10000, 18, false)).toEqual({
      base: 10000,
      gst: 1800,
      total: 11800,
    })
  })

  it('extracts GST from an inclusive amount', () => {
    const result = calculateGST(11800, 18, true)
    expect(result.base).toBeCloseTo(10000)
    expect(result.gst).toBeCloseTo(1800)
  })
})

describe('calculateSalary', () => {
  it('returns a positive estimate for annual CTC', () => {
    const result = calculateSalary(1200000)
    expect(result.monthlyInHand).toBeGreaterThan(0)
    expect(result.monthlyInHand).toBeLessThan(100000)
  })

  it('uses the 87A rebate for taxable income up to 12 lakh', () => {
    const result = calculateSalary(1275000)
    expect(result.annualTaxable).toBeCloseTo(1200000)
    expect(result.incomeTax).toBe(0)
  })

  describe('calculateSIP', () => {
    it('returns invested value and estimated returns', () => {
      const result = calculateSIP(10000, 12, 10)
      expect(result.invested).toBe(1200000)
      expect(result.maturity).toBeGreaterThan(result.invested)
      expect(result.returns).toBeCloseTo(result.maturity - result.invested)
    })
  })

  describe('calculateFD', () => {
    it('compounds quarterly', () => {
      const result = calculateFD(500000, 7, 5)
      expect(result.maturity).toBeGreaterThan(result.invested)
    })
  })

  describe('calculatePercentage', () => {
    it('calculates savings and the final price', () => {
      expect(calculatePercentage(2999, 25)).toEqual({
        discount: 749.75,
        finalAmount: 2249.25,
        savedPercent: 25,
      })
    })
  })
})

describe('calculateSplit', () => {
  it('adds the tip and divides the grand total', () => {
    expect(calculateSplit(2400, 4, 10)).toEqual({
      tip: 240,
      grandTotal: 2640,
      perPerson: 660,
      people: 4,
    })
  })
})

describe('formatINR', () => {
  it('uses Indian currency formatting', () => {
    expect(formatINR(150000)).toContain('1,50,000')
  })
})
