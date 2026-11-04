export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys variables and target.')
  const { variables, target } = input
  if (!Array.isArray(variables) || variables.length < 1 || variables.length > 6) throw new Error('variables needs 1 to 6 [a, b, c, m] lists.')
  variables.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== 4 || row.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) {
      throw new Error(`variables[${i}] must be [a, b, c, m] with integers from 1 to 1000.`)
    }
  })
  if (!Number.isInteger(target) || target < 0 || target > 1000) throw new Error('target is an integer from 0 to 1000.')
  return { variables, target }
}

const modpow = (base, exp, mod) => {
  let result = 1 % mod
  let b = base % mod
  let e = exp
  while (e > 0) {
    if (e & 1) result = (result * b) % mod
    b = (b * b) % mod
    e >>= 1
  }
  return result
}

export function buildTrace(input) {
  const { variables, target } = input
  const frames = []
  const result = []
  let at = -1
  let x = null
  let y = null
  const snap = (phase, activeLine, message, pythonLine) => frames.push({
    phase, activeLine, pythonLine, at, x, y, result: [...result], message,
  })

  snap('start', L('set the result list'), `Find the indexes where the result equals ${target}.`, 2)
  for (let i = 0; i < variables.length; i++) {
    at = i
    const [a, b, c, m] = variables[i]
    x = modpow(a, b, 10)
    snap('reduce', L('compute x as'), `x = ${a}^${b} mod 10 = ${x}.`, 4)
    y = modpow(x, c, m)
    snap('power', L('compute y as'), `y = ${x}^${c} mod ${m} = ${y}.`, 5)
    if (y === target) {
      result.push(i)
      snap('keep', L('if y equals target'), `y equals ${target}, so index ${i} is in the answer.`, 7)
    } else {
      snap('skip', L('if y equals target'), `y is ${y}, not ${target}, so index ${i} is out.`, 6)
    }
  }
  at = -1
  x = null
  y = null
  snap('done', L('return the result'), `Answer: [${result.join(', ')}].`, 8)
  return { input, result, frames }
}

export const code = `const result = [] // set the result list to empty
for (let i = 0; i < variables.length; i++) { // for each index i with variables [a, b, c, m]
  const [a, b, c, m] = variables[i]
  const x = modPow(a, b, 10) // compute x as a to the power b, modulo 10
  const y = modPow(x, c, m) // compute y as x to the power c, modulo m
  if (y === target) result.push(i) // if y equals target, add i to the result
}
return result // return the result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def good_indices(variables, target):
    result = []
    for i, (a, b, c, m) in enumerate(variables):
        x = pow(a, b, 10)
        y = pow(x, c, m)
        if y == target:
            result.append(i)
    return result
`
