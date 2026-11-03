export const code = `the minimum cost to turn source into target with non-overlapping rule windows
  set dp at 0 to 0 and every other dp entry to infinity
  for each position i from 0 to the last position
    if dp at i is infinity then continue
    if source at i equals target at i then relax dp at i plus 1 with dp at i
    for each rule with pattern length L
      if the window from i has length L and the pattern matches the source there
        and the replacement equals target over that window
        then relax dp at i plus L with dp at i plus the rule cost plus its wildcard count
  if dp at the end is infinity return negative one, otherwise return it`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def min_cost_convert(source, target, rules):
    n = len(source)
    INF = float("inf")
    dp = [INF] * (n + 1)
    dp[0] = 0
    for i in range(n):
        if dp[i] == INF:
            continue
        if source[i] == target[i]:
            dp[i + 1] = min(dp[i + 1], dp[i])
        for pattern, replacement, cost in rules:
            L = len(pattern)
            if i + L > n:
                continue
            fits = all(p == "*" or p == source[i + j] for j, p in enumerate(pattern))
            if fits and replacement == target[i:i + L]:
                wild = pattern.count("*")
                dp[i + L] = min(dp[i + L], dp[i] + cost + wild)
    return dp[n] if dp[n] != INF else -1
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

const LOWER = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.source !== 'string' || typeof input.target !== 'string' || !Array.isArray(input.rules)) {
    throw new Error('Use an object with source, target and a rules list.')
  }
  const { source, target, rules } = input
  if (source.length !== target.length || source.length < 1 || source.length > 12 || !LOWER.test(source) || !LOWER.test(target)) {
    throw new Error('source and target are equal-length lowercase strings of 1 to 12 letters.')
  }
  if (rules.length > 6) throw new Error('At most 6 rules in this visualization.')
  const clean = rules.map(rule => {
    const { pattern, replacement, cost } = rule ?? {}
    if (typeof pattern !== 'string' || typeof replacement !== 'string' || !Number.isInteger(cost)) throw new Error('Each rule needs pattern, replacement and integer cost.')
    if (pattern.length < 1 || pattern.length > 4 || pattern.length !== replacement.length) throw new Error('Pattern and replacement have equal length from 1 to 4.')
    if (!/^[a-z*]+$/.test(pattern) || !LOWER.test(replacement) || !/[a-z]/.test(pattern)) throw new Error('Patterns hold letters and * wildcards with at least one letter.')
    if (pattern.split('').filter(c => c === '*').length > 2) throw new Error('At most 2 wildcards per pattern.')
    if (cost < 1 || cost > 20) throw new Error('Rule costs are integers from 1 to 20.')
    return { pattern, replacement, cost }
  })
  return { source, target, rules: clean }
}

export function buildTrace({ source, target, rules }) {
  const n = source.length
  const INF = Infinity
  const dp = Array(n + 1).fill(INF)
  dp[0] = 0
  const frames = []
  const snap = () => dp.map(v => (v === INF ? null : v))
  frames.push({ pythonLine: P('dp[0] = 0'), phase: 'start', activeLine: L('set dp at 0 to 0'), at: -1, window: null, rule: null, dp: snap(), message: 'Cost 0 reaches the empty prefix.' })
  for (let i = 0; i < n; i++) {
    if (dp[i] === INF) {
      frames.push({ pythonLine: P('if dp[i] == INF'), phase: 'skip', activeLine: L('if dp at i is infinity'), at: i, window: null, rule: null, dp: snap(), message: `Position ${i} is unreachable, so skip it.` })
      continue
    }
    frames.push({ pythonLine: P('for i in range(n)'), phase: 'position', activeLine: L('for each position i'), at: i, window: null, rule: null, dp: snap(), message: `Position ${i} is reachable at cost ${dp[i]}.` })
    if (source[i] === target[i]) {
      dp[i + 1] = Math.min(dp[i + 1], dp[i])
      frames.push({ pythonLine: P('dp[i + 1] = min(dp[i + 1], dp[i])'), phase: 'keep', activeLine: L('if source at i equals target at i'), at: i, window: [i, i], rule: null, dp: snap(), message: `${source[i]} already matches, so it is kept free.` })
    }
    for (const rule of rules) {
      const len = rule.pattern.length
      if (i + len > n) continue
      const fits = [...rule.pattern].every((p, j) => p === '*' || p === source[i + j])
      const sameText = rule.replacement === target.slice(i, i + len)
      const ok = fits && sameText
      if (ok) {
        const cost = rule.cost + [...rule.pattern].filter(c => c === '*').length
        dp[i + len] = Math.min(dp[i + len], dp[i] + cost)
      }
      frames.push({ pythonLine: P('for pattern, replacement, cost in rules'), phase: ok ? 'apply' : 'reject', activeLine: L('for each rule with pattern length'), at: i, window: [i, i + len - 1], rule: `${rule.pattern} to ${rule.replacement}`, dp: snap(),
        message: ok ? `Rule ${rule.pattern} to ${rule.replacement} covers ${i}..${i + len - 1} for ${rule.cost + [...rule.pattern].filter(c => c === '*').length}; dp at ${i + len} becomes ${dp[i + len]}.`
          : `Rule ${rule.pattern} to ${rule.replacement} does not fit at ${i}${fits ? ' because the replacement differs from target' : ' because the pattern does not match'}.` })
    }
  }
  const result = dp[n] === INF ? -1 : dp[n]
  frames.push({ pythonLine: P('return dp[n]'), phase: 'done', activeLine: L('if dp at the end is infinity'), at: -1, window: null, rule: null, dp: snap(), message: result === -1 ? 'No covering exists, so return -1.' : `Minimum cost is ${result}.` })
  return { input: { source, target, rules }, result, frames }
}
