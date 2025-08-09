export function isValidIranianMobile(mobile: string): boolean {
  return /^\+98 9\d{2} \d{3} \d{4}$/.test(mobile)
}

export function isValidIranianNationalId(nationalId: string): boolean {
  if (!/^\d{10}$/.test(nationalId)) return false
  const check = +nationalId[9]
  let sum = 0
  for (let i = 0; i < 9; ++i) {
    sum += +nationalId[i] * (10 - i)
  }
  const remainder = sum % 11
  return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder)
}
