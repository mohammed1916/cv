export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with "brackets" and "income".')
  const { brackets, income } = input
  if (!Array.isArray(brackets) || brackets.length < 1 || brackets.length > 10) throw new Error('brackets must hold 1 to 10 [upper, percent] pairs.')
  let previous = 0
  for (const pair of brackets) {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error('Each bracket is [upper, percent].')
    const [upper, percent] = pair
    if (!Number.isInteger(upper) || upper < 1 || upper > 100) throw new Error('Each upper bound is an integer from 1 to 100.')
    if (upper <= previous) throw new Error('Upper bounds must be strictly increasing.')
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) throw new Error('Each percent is an integer from 0 to 100.')
    previous = upper
  }
  if (!Number.isInteger(income) || income < 0 || income > previous) throw new Error('income must be an integer from 0 up to the last upper bound.')
  return { brackets, income }
}

export function buildTrace(input) {
  const { brackets, income } = input
  const frames = [{ phase: 'start', activeLine: L('set tax to 0'), index: -1, taxed: 0, tax: 0, message: `Income ${income} is taxed one bracket at a time.` }]
  let tax = 0
  let previous = 0
  brackets.forEach(([upper, percent], index) => {
    const taxed = Math.max(0, Math.min(income, upper) - previous)
    tax += taxed * percent / 100
    frames.push({ phase: 'bracket', activeLine: L('add taxed times percent'), index, taxed, tax, message: `Bracket ${index} covers income up to ${upper} at ${percent}%. ${taxed} is taxed here, so tax is ${tax}.` })
    previous = upper
  })
  frames.push({ phase: 'done', activeLine: L('return tax'), index: -1, taxed: 0, tax, message: `Total tax is ${tax}.` })
  return { input, result: tax, frames }
}

export const code = `calculate the tax on income with progressive brackets
  set tax to 0 and previous to 0
  for each bracket [upper, percent] in order
    the taxed part is the income between previous and upper
    add taxed times percent divided by 100 to tax
    set previous to upper
  return tax`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def calculate_tax(brackets, income):
    tax = 0
    previous = 0
    for upper, percent in brackets:
        taxed = max(0, min(income, upper) - previous)
        tax += taxed * percent / 100
        previous = upper
    return tax
`
