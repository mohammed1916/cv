const MAX_GROUPS = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const { batchSize, groups } = data ?? {}
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 4) throw new Error('batchSize must be an integer from 1 to 4.')
  if (!Array.isArray(groups) || groups.length < 1 || groups.length > MAX_GROUPS) throw new Error(`groups must list 1 to ${MAX_GROUPS} sizes.`)
  if (groups.some(g => !Number.isInteger(g) || g < 1 || g > 9)) throw new Error('Group sizes are integers from 1 to 9.')
  return { batchSize, groups }
}

export const code = `max happy groups(batchSize, groups)
  count the groups whose size is a multiple of batchSize: they are always happy, so set happy to that count
  set cnt[r] to the number of other groups whose size leaves remainder r
  define best(cnt, cur) as the most happy groups left, when cur donuts are already used in the batch
    for each remainder r with cnt[r] above 0
      use one group with remainder r, scoring 1 if cur is 0, then recurse with (cur + r) mod batchSize
    keep the largest such total, memoized on cnt and cur
  return happy + best(cnt, 0)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Only the remainder of each group's size matters. A group is happy when it starts a fresh batch (the donuts used so far are a multiple of batchSize).
export function buildTrace({ batchSize: b, groups }) {
  const happyBase = groups.filter(g => g % b === 0).length
  const cnt = Array(b).fill(0)
  for (const g of groups) if (g % b !== 0) cnt[g % b]++
  const memo = new Map()
  const frames = [{ phase: 'start', cnt: [...cnt], cur: 0, value: null, activeLine: L('count the groups whose size'), message: `${happyBase} group(s) are a multiple of ${b} and are always happy.` }]
  const best = (state, cur) => {
    const key = `${state.join(',')}|${cur}`
    if (memo.has(key)) return memo.get(key)
    let result = 0
    for (let r = 1; r < b; r++) {
      if (state[r] === 0) continue
      const gain = cur === 0 ? 1 : 0
      state[r]--
      result = Math.max(result, gain + best(state, (cur + r) % b))
      state[r]++
    }
    memo.set(key, result)
    frames.push({ phase: 'state', cnt: [...state], cur, value: result, activeLine: L('keep the largest such total'), message: `Remaining ${state.map((c, r) => `${r}:${c}`).join(' ')} with ${cur} donut(s) used in the batch: at most ${result} more happy.` })
    return result
  }
  const extra = best([...cnt], 0)
  const result = happyBase + extra
  frames.push({ phase: 'done', cnt: [...cnt], cur: 0, value: result, activeLine: L('return happy'), result, message: `Maximum number of happy groups: ${result}.` })
  return { input: { batchSize: b, groups }, result, frames }
}

export const python = `def max_happy_groups(batchSize, groups):
    b = batchSize
    happy = sum(1 for g in groups if g % b == 0)
    cnt = [0] * b
    for g in groups:
        if g % b:
            cnt[g % b] += 1
    memo = {}

    def best(state, cur):
        key = (state, cur)
        if key in memo:
            return memo[key]
        result = 0
        for r in range(1, b):
            if state[r] > 0:
                gain = 1 if cur == 0 else 0
                nxt = list(state)
                nxt[r] -= 1
                result = max(result, gain + best(tuple(nxt), (cur + r) % b))
        memo[key] = result
        return result

    return happy + best(tuple(cnt), 0)
`
