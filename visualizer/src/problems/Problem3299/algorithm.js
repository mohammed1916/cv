const MOD = 1000000007

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= -20 && x <= 20)) throw new Error('Each value is an integer from -20 to 20.')
  return nums
}

export const code = `FUNCTION sumConsecutiveSubsequences(nums)
    MOD ← 1000000007
    upCount, upSum ← empty maps by value (chains that rise by 1)
    downCount, downSum ← empty maps by value (chains that fall by 1)
    total ← 0
    FOR each value v in nums, in order
        cu ← 1 + upCount[v − 1]
        su ← v · cu + upSum[v − 1]
        cd ← 1 + downCount[v + 1]
        sd ← v · cd + downSum[v + 1]
        upCount[v] += cu ; upSum[v] += su
        downCount[v] += cd ; downSum[v] += sd
        total ← total + su + sd − v
    RETURN total mod MOD`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def sum_consecutive_subsequences(nums):
    MOD = 1000000007
    up_count, up_sum = {}, {}
    down_count, down_sum = {}, {}
    total = 0
    for v in nums:
        cu = 1 + up_count.get(v - 1, 0)
        su = v * cu + up_sum.get(v - 1, 0)
        cd = 1 + down_count.get(v + 1, 0)
        sd = v * cd + down_sum.get(v + 1, 0)
        up_count[v] = up_count.get(v, 0) + cu
        up_sum[v] = up_sum.get(v, 0) + su
        down_count[v] = down_count.get(v, 0) + cd
        down_sum[v] = down_sum.get(v, 0) + sd
        total += su + sd - v
    return total % MOD


if __name__ == "__main__":
    import json
    import sys
    print(sum_consecutive_subsequences(json.loads(sys.stdin.read())))
`

const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace(nums) {
  const frames = []
  const upCount = new Map()
  const upSum = new Map()
  const downCount = new Map()
  const downSum = new Map()
  const snapshot = () => ({
    up: [...upCount.keys()].sort((a, b) => a - b).map(k => ({ value: k, count: upCount.get(k), sum: upSum.get(k) })),
    down: [...downCount.keys()].sort((a, b) => a - b).map(k => ({ value: k, count: downCount.get(k), sum: downSum.get(k) })),
  })
  let total = 0
  frames.push({
    phase: 'start', activeLine: L('total ← 0'), pythonLine: P('total = 0'),
    i: -1, v: null, cu: null, su: null, cd: null, sd: null,
    lookupUp: null, lookupDown: null, maps: snapshot(), total,
    message: 'No subsequence has been counted yet. Each value will look up chains that end one below it (rising) or one above it (falling).',
  })
  nums.forEach((v, i) => {
    const cu = 1 + (upCount.get(v - 1) ?? 0)
    const su = v * cu + (upSum.get(v - 1) ?? 0)
    const cd = 1 + (downCount.get(v + 1) ?? 0)
    const sd = v * cd + (downSum.get(v + 1) ?? 0)
    const lookupUp = { value: v - 1, count: upCount.get(v - 1) ?? 0, sum: upSum.get(v - 1) ?? 0 }
    const lookupDown = { value: v + 1, count: downCount.get(v + 1) ?? 0, sum: downSum.get(v + 1) ?? 0 }
    frames.push({
      phase: 'extend', activeLine: L('cu ← 1 +'), pythonLine: P('cu = 1 + up_count'),
      i, v, cu, su, cd, sd, lookupUp, lookupDown, maps: snapshot(), total,
      message: `Value ${v}: ${cu} rising chain${cu === 1 ? '' : 's'} end here (${lookupUp.count} extend the chains ending at ${v - 1}) with sum ${su}; ${cd} falling chain${cd === 1 ? '' : 's'} with sum ${sd}.`,
    })
    upCount.set(v, (upCount.get(v) ?? 0) + cu)
    upSum.set(v, (upSum.get(v) ?? 0) + su)
    downCount.set(v, (downCount.get(v) ?? 0) + cd)
    downSum.set(v, (downSum.get(v) ?? 0) + sd)
    total += su + sd - v
    frames.push({
      phase: 'store', activeLine: L('upCount[v] += cu'), pythonLine: P('up_count[v] = up_count.get(v, 0) + cu'),
      i, v, cu, su, cd, sd, lookupUp, lookupDown, maps: snapshot(), total,
      message: `Store the chains ending at ${v} and add ${su + sd - v} to the total (the single ${v} is counted once, not twice).`,
    })
  })
  const result = ((total % MOD) + MOD) % MOD
  frames.push({
    phase: 'done', activeLine: L('RETURN total mod MOD'), pythonLine: P('return total % MOD'),
    i: nums.length, v: null, cu: null, su: null, cd: null, sd: null,
    lookupUp: null, lookupDown: null, maps: snapshot(), total,
    message: `The total is ${result} modulo ${MOD}.`,
  })
  return { input: nums, result, frames }
}
