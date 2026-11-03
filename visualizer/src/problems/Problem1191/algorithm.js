export const phases = [
  { id: 'start', label: 'Read copies', description: 'One copy is the array; k copies are placed end to end.' },
  { id: 'one-copy', label: 'Inside one copy', description: 'Kadane-style running sums find the best run that stays inside one copy, allowing empty.' },
  { id: 'totals', label: 'Edges and total', description: 'Best prefix and best suffix (both allowed empty), plus the sum of one copy.' },
  { id: 'combine', label: 'Combine copies', description: 'A run that crosses the boundary uses a suffix, complete middle copies, and a prefix. Middle copies help only when the total is positive.' },
  { id: 'done', label: 'Answer', description: 'Return the largest of the candidates.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  const { arr, k } = data ?? {}
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 200) throw new Error('arr must be an array of 1 to 200 integers.')
  if (arr.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('Each value must be an integer with absolute value at most 10000.')
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k must be an integer from 1 to 1000.')
  return { arr, k }
}

export function buildTrace({ arr, k }) {
  const frames = []
  const snap = extra => ({ arr, k, ...extra })
  let single = 0
  let cur = 0
  frames.push({ phase: 'start', activeLine: 2, message: `Start with ${k} cop${k === 1 ? 'y' : 'ies'} of the array. The empty run gives 0 so far.`, snapshot: snap({ index: -1, single, cur }) })
  for (let i = 0; i < arr.length; i++) {
    cur = Math.max(0, cur + arr[i])
    single = Math.max(single, cur)
    frames.push({ phase: 'one-copy', activeLine: 3, message: `Element ${arr[i]} at ${i}: the best run ending here is ${cur} (empty allowed), and the best inside one copy is ${single}.`, snapshot: snap({ index: i, single, cur }) })
  }
  const total = arr.reduce((a, b) => a + b, 0)
  let run = 0
  let prefix = 0
  for (const x of arr) { run += x; prefix = Math.max(prefix, run) }
  run = 0
  let suffix = 0
  for (let i = arr.length - 1; i >= 0; i--) { run += arr[i]; suffix = Math.max(suffix, run) }
  frames.push({ phase: 'totals', activeLine: 4, message: `One copy sums to ${total}. The best prefix is ${prefix} and the best suffix is ${suffix}, both allowed to be empty.`, snapshot: snap({ single, total, prefix, suffix }) })

  let result
  if (k === 1) {
    result = single
    frames.push({ phase: 'combine', activeLine: 5, message: 'With one copy there is no boundary to cross, so the inside-copy answer is final.', snapshot: snap({ single, total, prefix, suffix, result }) })
  } else if (total > 0) {
    result = Math.max(single, prefix + suffix + (k - 2) * total)
    frames.push({ phase: 'combine', activeLine: 6, message: `The total is positive, so every middle copy helps. Candidate: ${prefix} + ${suffix} + ${k - 2} × ${total} = ${prefix + suffix + (k - 2) * total}.`, snapshot: snap({ single, total, prefix, suffix, result: null }) })
  } else {
    result = Math.max(single, prefix + suffix)
    frames.push({ phase: 'combine', activeLine: 7, message: `The total is not positive, so only the two boundary pieces are combined: ${prefix} + ${suffix}.`, snapshot: snap({ single, total, prefix, suffix, result: null }) })
  }
  frames.push({ phase: 'done', activeLine: 7, message: `The largest candidate is ${result}.`, snapshot: snap({ single, total, prefix, suffix, result }) })
  return { input: { arr, k }, result, frames }
}

export const code = [
  'FUNCTION kConcatenationMax(arr, k)',
  '    single ← 0, cur ← 0',
  '    FOR EACH x IN arr: cur ← MAX(0, cur + x); single ← MAX(single, cur)',
  '    total ← SUM(arr); prefix ← best prefix; suffix ← best suffix (both ≥ 0)',
  '    IF k = 1 THEN RETURN single',
  '    IF total > 0 THEN RETURN MAX(single, prefix + suffix + (k - 2) × total)',
  '    RETURN MAX(single, prefix + suffix)',
]

export const python = `def k_concatenation_max(arr, k):
    single = cur = 0
    for x in arr:
        cur = max(0, cur + x)
        single = max(single, cur)
    total = sum(arr)
    prefix = run = 0
    for x in arr:
        run += x
        prefix = max(prefix, run)
    suffix = run = 0
    for x in reversed(arr):
        run += x
        suffix = max(suffix, run)
    if k == 1:
        return single
    if total > 0:
        return max(single, prefix + suffix + (k - 2) * total)
    return max(single, prefix + suffix)`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 6, 5: 15, 6: 17, 7: 19 }
