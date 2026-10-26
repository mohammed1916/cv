export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.stamp !== 'string' || typeof obj.target !== 'string') throw new Error('Enter a JSON object like {"stamp":"abc","target":"ababc"}.')
  const { stamp, target } = obj
  if (!/^[a-z]+$/.test(stamp) || !/^[a-z]+$/.test(target)) throw new Error('stamp and target must be non-empty lowercase strings.')
  if (stamp.length > target.length || target.length > 30) throw new Error('Need 1 <= stamp length <= target length <= 30 (the visualization caps target at 30).')
  return { stamp, target }
}

export function buildTrace({ stamp, target }) {
  const m = stamp.length, n = target.length
  const t = [...target]
  const res = []
  let stars = 0
  const frames = [{ phase: 'start', activeLine: 4, t: t.join(''), window: null, stars, res: [], message: `Think in reverse: the last stamp fully shows its letters, so find a window equal to "${stamp}" and replace it with wildcards '?'.` }]
  let changed = true
  let pass = 0
  while (changed && stars < n) {
    changed = false
    pass++
    for (let i = 0; i <= n - m; i++) {
      let k = 0
      while (k < m && (t[i + k] === '?' || t[i + k] === stamp[k])) k++
      const hasLetter = t.slice(i, i + m).some(c => c !== '?')
      if (k === m && hasLetter) {
        for (let j = 0; j < m; j++) if (t[i + j] !== '?') { t[i + j] = '?'; stars++ }
        res.push(i)
        changed = true
        frames.push({ phase: 'erase', activeLine: 18, t: t.join(''), window: i, stars, res: [...res], pass, message: `Window at ${i} matches the stamp (wildcards match anything) and still has real letters: stamp it last, turning them into '?'. Wildcards so far: ${stars}.` })
      } else {
        frames.push({ phase: 'check', activeLine: 11, t: t.join(''), window: i, stars, res: [...res], pass,
          message: k === m ? `Window at ${i} is already all wildcards: nothing to undo.` : `Window at ${i} fails at offset ${k}: '${t[i + k]}' vs '${stamp[k]}'.` })
      }
    }
  }
  const ok = stars === n
  const result = ok ? [...res].reverse() : []
  frames.push({ phase: 'done', activeLine: 20, t: t.join(''), window: null, stars, res: result, pass, message: ok ? `All ${n} positions are wildcards. Reversing the removal order gives the stamping order: [${result.join(', ')}].` : 'No more windows can be removed but letters remain: impossible, return [].' })
  return { input: { stamp, target }, result, frames }
}

export const code = `def movesToStamp(stamp, target):
    m, n = len(stamp), len(target)
    t = list(target)
    res = []
    changed = True
    stars = 0
    while changed and stars < n:
        changed = False
        for i in range(n - m + 1):
            k = 0
            while k < m and (t[i + k] == '?' or t[i + k] == stamp[k]):
                k += 1
            if k == m and any(t[i + j] != '?' for j in range(m)):
                for j in range(m):
                    if t[i + j] != '?':
                        t[i + j] = '?'
                        stars += 1
                res.append(i)
                changed = True
    return res[::-1] if stars == n else []`.split('\n').map((text, index) => ({ line: index + 1, text }))
