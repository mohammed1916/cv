export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 4 || n > 2000) throw new Error('n is an integer from 4 to 2000 in this visualization.')
  return { n }
}

function digitsOf(n, base) {
  const digits = []
  let m = n
  while (m > 0) {
    digits.push(m % base)
    m = Math.floor(m / base)
  }
  return digits
}

export function buildTrace({ n }) {
  const frames = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('for (let base'), base: null, digits: [], mismatch: -1, result: null, message: `Test bases 2 through ${n - 2}.` })
  for (let base = 2; base <= n - 2; base++) {
    const digits = digitsOf(n, base)
    frames.push({ pythonLine: 3, phase: 'base', activeLine: L('const digits = digitsOf'), base, digits, mismatch: -1, result: null, message: `Write ${n} in base ${base}, most significant digit first: ${digits.slice().reverse().join(' ')}.` })
    let palindrome = true
    let mismatch = -1
    for (let i = 0; i < digits.length / 2; i++) {
      if (digits[i] !== digits[digits.length - 1 - i]) { palindrome = false; mismatch = i; break }
    }
    if (!palindrome) {
      frames.push({ pythonLine: 9, phase: 'fail', activeLine: L('return false'), base, digits, mismatch, result: false, message: `${digits.slice().reverse().join('')} in base ${base} is not a palindrome: the outer digits differ.` })
      frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return false'), base: null, digits: [], mismatch: -1, result: false, message: `${n} is not strictly palindromic.` })
      return { input: { n }, result: false, frames }
    }
    frames.push({ pythonLine: 8, phase: 'pass', activeLine: L('if (digits'), base, digits, mismatch: -1, result: null, message: `${digits.slice().reverse().join('')} in base ${base} reads the same both ways.` })
  }
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return true'), base: null, digits: [], mismatch: -1, result: true, message: `Every base from 2 to ${n - 2} gives a palindrome.` })
  return { input: { n }, result: true, frames }
}

export const code = `function isStrictlyPalindromic(n) {
  for (let base = 2; base <= n - 2; base++) {
    const digits = digitsOf(n, base) // least significant digit first
    if (digits.some((d, i) => d !== digits[digits.length - 1 - i] && i < digits.length / 2)) {
      return false
    }
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def is_strictly_palindromic(n):
    for base in range(2, n - 1):
        digits = []
        m = n
        while m:
            digits.append(m % base)
            m //= base
        if digits != digits[::-1]:
            return False
    return True
`
