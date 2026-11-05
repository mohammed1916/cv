const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.strength)) throw new Error('Use an object with strength.')
  const { strength } = input
  if (strength.length < 1 || strength.length > 12) throw new Error('strength has 1 to 12 wizards.')
  if (!strength.every(x => Number.isInteger(x) && x >= 1 && x <= 20)) throw new Error('Each strength is an integer from 1 to 20.')
  return { strength }
}

export function buildTrace({ strength }) {
  const n = strength.length
  const P = [0n]
  for (const x of strength) P.push(P[P.length - 1] + BigInt(x))
  const Q = [0n]
  for (const p of P) Q.push(Q[Q.length - 1] + p)
  const L = Array(n).fill(-1)
  const R = Array(n).fill(n)
  const stack = []
  const frames = []
  let total = 0n
  for (let i = 0; i < n; i++) {
    while (stack.length && strength[stack[stack.length - 1]] > strength[i]) R[stack.pop()] = i
    L[i] = stack.length ? stack[stack.length - 1] : -1
    stack.push(i)
  }
  for (let i = 0; i < n; i++) {
    const left = i - L[i]
    const right = R[i] - i
    const contribution = BigInt(strength[i]) * (BigInt(left) * (Q[R[i] + 1] - Q[i + 1]) - BigInt(right) * (Q[i + 1] - Q[L[i] + 1]))
    total += contribution
    frames.push({ phase: 'weakest', activeLine: CL('const contribution'), pythonLine: PL('contribution ='), i, l: L[i] + 1, r: R[i] - 1, contribution: Number(contribution), total: Number(total % MOD), message: `Wizard ${i} with strength ${strength[i]} is the weakest in groups from ${L[i] + 1} to ${R[i] - 1}. Its groups add ${contribution}.` })
  }
  const result = Number(total % MOD)
  frames.push({ phase: 'done', activeLine: CL('return total % MOD'), pythonLine: PL('return total % MOD'), i: -1, l: -1, r: -1, contribution: 0, total: result, message: `The sum of all group totals is ${total}, which is ${result} modulo 1000000007.` })
  return { input: { strength }, result, frames }
}

export const code = `function sumOfTotalStrength(strength) {
  const MOD = 1000000007n;
  const n = strength.length;
  const P = [0n];
  for (const x of strength) P.push(P[P.length - 1] + BigInt(x));
  const Q = [0n];
  for (const p of P) Q.push(Q[Q.length - 1] + p);
  const L = Array(n).fill(-1);
  const R = Array(n).fill(n);
  const stack = [];
  for (let i = 0; i < n; i++) {
    while (stack.length && strength[stack[stack.length - 1]] > strength[i]) R[stack.pop()] = i;
    L[i] = stack.length ? stack[stack.length - 1] : -1;
    stack.push(i);
  }
  let total = 0n;
  for (let i = 0; i < n; i++) {
    const left = BigInt(i - L[i]);
    const right = BigInt(R[i] - i);
    const contribution = BigInt(strength[i]) * (left * (Q[R[i] + 1] - Q[i + 1]) - right * (Q[i + 1] - Q[L[i] + 1]));
    total += contribution;
  }
  return total % MOD;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `MOD = 10**9 + 7


def sum_of_total_strength(strength):
    n = len(strength)
    P = [0]
    for x in strength:
        P.append(P[-1] + x)
    Q = [0]
    for p in P:
        Q.append(Q[-1] + p)
    L = [-1] * n
    R = [n] * n
    stack = []
    for i in range(n):
        while stack and strength[stack[-1]] > strength[i]:
            R[stack.pop()] = i
        L[i] = stack[-1] if stack else -1
        stack.append(i)
    total = 0
    for i in range(n):
        left = i - L[i]
        right = R[i] - i
        contribution = strength[i] * (left * (Q[R[i] + 1] - Q[i + 1]) - right * (Q[i + 1] - Q[L[i] + 1]))
        total += contribution
    return total % MOD
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
