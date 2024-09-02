export const rem2px = (rem: number) =>
  rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
export const sleep = (ms: number) => new Promise((next) => setTimeout(next, ms))
