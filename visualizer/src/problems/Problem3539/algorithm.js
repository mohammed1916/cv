const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with m, k and nums.')
  const { m, k, nums } = input
  if (!Number.isInteger(m) || m < 1 || m > 6) throw new Error('m is 1 to 6 in this visualization.')
  if (!Number.isInteger(k) || k < 1 || k > m) throw new Error('k is between 1 and m.')
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6) throw new Error('nums has 1 to 6 entries in this visualization.')
  for (const value of nums) {
    if (!Number.isInteger(value) || value < 1 || value > 100000000) throw new Error('Each entry of nums is 1 to 100000000.')
  }
  return { m, k, nums }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'No index placed: no copies used, no carry, no set bits.' },
  { id: 'layer', label: 'Next bit', description: 'Index i decides how many copies of 2^i the sequence holds.' },
  { id: 'state', label: 'Expand', description: 'From one state, try every number of copies of this index.' },
  { id: 'advance', label: 'Advance', description: 'The new states become the current states.' },
  { id: 'finish', label: 'Check', description: 'Leftover carry adds its own set bits; both totals must match.' },
  { id: 'done', label: 'Result', description: 'Sum the weights of the accepted states.' },
]

export const code = `sum of products over magical sequences
  start with one state: 0 copies used, carry 0, 0 set bits, weight 1
  for each index i, the bit position 2^i
    for each state (used, carry, bits) with its weight
      try t = 0 up to the remaining positions
        t copies plus carry gives total; its low bit stays at this position
        add weight × C(remaining, t) × nums[i]^t to the state it reaches
    the new states replace the old ones
  for each final state, count the set bits still in its carry
    keep it if all m are used and the bits total k
  return the sum of the kept weights`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `from math import comb


def magical_sum(m, k, nums):
    MOD = 10**9 + 7
    states = {(0, 0, 0): 1}
    for value in nums:
        following = {}
        for (used, carry, bits), ways in states.items():
            left = m - used
            for t in range(left + 1):
                total = t + carry
                new_bits = bits + (total & 1)
                if new_bits > k:
                    continue
                key = (used + t, total >> 1, new_bits)
                gain = ways * comb(left, t) * pow(value, t, MOD)
                following[key] = (following.get(key, 0) + gain) % MOD
        states = following
    answer = 0
    for (used, carry, bits), ways in states.items():
        if used == m and bits + bin(carry).count('1') == k:
            answer = (answer + ways) % MOD
    return answer
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

function binomial(n, r) {
  let out = 1
  for (let i = 1; i <= r; i++) out = (out * (n - r + i)) / i
  return out
}

function powerMod(base, exponent) {
  let out = 1n
  for (let i = 0; i < exponent; i++) out = (out * BigInt(base)) % MOD
  return out
}

export function popcount(value) {
  let count = 0
  for (let v = value; v > 0; v = Math.floor(v / 2)) count += v % 2
  return count
}

const stateKey = (used, carry, bits) => `${used},${carry},${bits}`
const listStates = states => [...states.values()].map(s => ({ used: s.used, carry: s.carry, bits: s.bits, ways: Number(s.ways) }))

export function buildTrace({ m, k, nums }) {
  const frames = []
  let states = new Map([[stateKey(0, 0, 0), { used: 0, carry: 0, bits: 0, ways: 1n }]])
  frames.push({
    phase: 'start', activeLine: L('start with one state'), pythonLine: P('states = {(0, 0, 0): 1}'), index: -1, current: listStates(states), following: [], active: null, transitions: [],
    message: `Nothing placed yet. One empty state with weight 1; m = ${m} positions and k = ${k} set bits are the targets.`,
  })
  for (let index = 0; index < nums.length; index++) {
    const value = nums[index]
    const following = new Map()
    const current = listStates(states)
    frames.push({
      phase: 'layer', activeLine: L('for each index i'), pythonLine: P('for value in nums'), index, current, following: [], active: null, transitions: [],
      message: `Index ${index} stands for 2^${index} and multiplies the product by ${value} per copy.`,
    })
    for (const state of states.values()) {
      const { used, carry, bits, ways } = state
      const left = m - used
      const transitions = []
      for (let t = 0; t <= left; t++) {
        const total = t + carry
        const low = total & 1
        const newBits = bits + low
        const nextCarry = total >> 1
        const row = { t, choose: binomial(left, t), total, low, nextCarry, newBits, pruned: newBits > k, gain: null }
        if (!row.pruned) {
          const gain = (ways * BigInt(row.choose) % MOD) * powerMod(value, t) % MOD
          const key = stateKey(used + t, nextCarry, newBits)
          const entry = following.get(key) ?? { used: used + t, carry: nextCarry, bits: newBits, ways: 0n }
          entry.ways = (entry.ways + gain) % MOD
          following.set(key, entry)
          row.gain = Number(gain)
        }
        transitions.push(row)
      }
      const open = transitions.filter(row => !row.pruned).length
      frames.push({
        phase: 'state', activeLine: L('add weight'), pythonLine: P('following[key] ='), index, current, following: listStates(following),
        active: { used, carry, bits, ways: Number(ways), left }, transitions,
        message: `From ${used} used, carry ${carry}, ${bits} bits: ${open} choice${open === 1 ? '' : 's'} of t stay within ${k} bits${open < transitions.length ? `; ${transitions.length - open} exceed it and are dropped` : ''}.`,
      })
    }
    states = following
    frames.push({
      phase: 'advance', activeLine: L('new states replace'), pythonLine: P('states = following'), index, current: listStates(states), following: [], active: null, transitions: [],
      message: `After index ${index} there ${states.size === 1 ? 'is 1 state' : `are ${states.size} states`}.`,
    })
  }
  const final = listStates(states)
  let answer = 0n
  const checks = []
  for (const state of final) {
    const carryBits = popcount(state.carry)
    const accepted = state.used === m && state.bits + carryBits === k
    if (accepted) answer = (answer + BigInt(state.ways)) % MOD
    checks.push({ ...state, carryBits, accepted })
    const reason = state.used !== m
      ? `only ${state.used} of ${m} positions used`
      : state.bits + carryBits === k
        ? `${state.bits} + ${carryBits} = ${k} set bits`
        : `${state.bits} + ${carryBits} set bits, not ${k}`
    frames.push({
      phase: 'finish', activeLine: L(accepted ? 'keep it if' : 'count the set bits'), pythonLine: P(accepted ? 'answer = (answer + ways)' : "if used == m and bits"), index: nums.length, current: final, following: [], active: null, transitions: [], checks: checks.map(c => ({ ...c })), answer: Number(answer),
      message: `${accepted ? 'Keep' : 'Reject'} state (${state.used}, ${state.carry}, ${state.bits}): ${reason}.${accepted ? ` Running sum ${Number(answer)}.` : ''}`,
    })
  }
  const result = Number(answer)
  frames.push({
    phase: 'done', activeLine: L('return the sum'), pythonLine: P('return answer'), index: nums.length, current: final, following: [], active: null, transitions: [], checks: checks.map(c => ({ ...c })), answer: result,
    message: `Return ${result}.`,
  })
  return { input: { m, k, nums }, result, frames }
}
