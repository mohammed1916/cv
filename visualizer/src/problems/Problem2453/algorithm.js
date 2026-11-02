export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and space.')
  const { nums, space } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums has 1 to 20 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 50)) throw new Error('Each num is an integer from 1 to 50.')
  if (!Number.isInteger(space) || space < 1 || space > 10) throw new Error('space is an integer from 1 to 10.')
  return { nums, space }
}

export function buildTrace({ nums, space }) {
  const frames = []
  const counts = new Map()
  const seeds = new Map()
  frames.push({ pythonLine: PL('counts = {}'), phase: 'setup', activeLine: CL('counts <-'), at: -1, r: null, counts: [], message: 'Start with no residue groups.' })
  nums.forEach((x, i) => {
    const r = x % space
    counts.set(r, (counts.get(r) || 0) + 1)
    seeds.set(r, Math.min(seeds.has(r) ? seeds.get(r) : x, x))
    frames.push({ pythonLine: PL('seeds[r] = min'), phase: 'scan', activeLine: CL('group'), at: i, r, counts: [...counts], message: `${x} mod ${space} = ${r}; group ${r} now has ${counts.get(r)} and smallest ${seeds.get(r)}.` })
  })
  let bestCount = 0
  let bestSeed = null
  for (const r of counts.keys()) {
    const better = counts.get(r) > bestCount || (counts.get(r) === bestCount && seeds.get(r) < bestSeed)
    frames.push({ pythonLine: PL('if counts[r] > best_count'), phase: 'choose', activeLine: CL('IF this group'), at: -1, r, counts: [...counts], message: `Group ${r} has ${counts.get(r)} target${counts.get(r) === 1 ? '' : 's'}; ${better ? 'it becomes the best so far.' : 'it does not beat the best.'}` })
    if (better) { bestCount = counts.get(r); bestSeed = seeds.get(r) }
  }
  frames.push({ pythonLine: PL('return best_seed'), phase: 'done', activeLine: CL('RETURN best_seed'), at: -1, r: null, counts: [...counts], message: `The smallest seed that destroys the most targets is ${bestSeed}.` })
  return { input: { nums, space }, result: bestSeed, frames }
}

export const code = `FUNCTION destroySequentialTargets(nums, space)
  counts <- empty map from remainder to count
  smallest <- empty map from remainder to smallest value
  FOR each x in nums
    r <- x mod space
    add one to counts[r] and keep the smallest x in smallest[r]
  best_count <- 0, best_seed <- none
  FOR each remainder r in counts
    IF this group has more targets, or ties with a smaller seed THEN take it
  RETURN best_seed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def destroy_sequential_targets(nums, space):
    counts = {}
    seeds = {}
    for x in nums:
        r = x % space
        counts[r] = counts.get(r, 0) + 1
        seeds[r] = min(seeds.get(r, x), x)
    best_count, best_seed = 0, None
    for r in counts:
        if counts[r] > best_count or (counts[r] == best_count and seeds[r] < best_seed):
            best_count, best_seed = counts[r], seeds[r]
    return best_seed
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
