export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 2 || arr.length > 30 || arr.length % 2 || arr.some(v => !Number.isInteger(v) || v < -1000 || v > 1000))
    throw new Error('Enter a JSON array of an even number (2 to 30) of integers between -1000 and 1000 (visualization cap).')
  return arr
}

export function buildTrace(arr) {
  const cnt = new Map()
  for (const v of arr) cnt.set(v, (cnt.get(v) || 0) + 1)
  const keys = [...cnt.keys()].sort((a, b) => Math.abs(a) - Math.abs(b) || a - b)
  const counts = () => keys.map(k => cnt.get(k))
  const get = k => cnt.get(k) ?? 0
  const frames = [{ phase: 'start', activeLine: 2, keys, counts: counts(), index: -1, message: 'Count each value. Small absolute values must pair with their doubles first, because nothing smaller can pair with them.' }]
  let result = true
  if (get(0) % 2) {
    frames.push({ phase: 'fail', activeLine: 4, keys, counts: counts(), index: keys.indexOf(0), message: `There are ${get(0)} zeros: zero pairs only with itself, so an odd count cannot be paired.` })
    result = false
  } else {
    for (let i = 0; i < keys.length; i++) {
      const x = keys[i]
      if (x === 0) {
        frames.push({ phase: 'skip', activeLine: 7, keys, counts: counts(), index: i, message: 'Zeros were already checked to be even: skip.' })
        continue
      }
      const need = get(2 * x)
      if (get(x) > need) {
        frames.push({ phase: 'fail', activeLine: 9, keys, counts: counts(), index: i, message: `${get(x)} copies of ${x} need ${get(x)} copies of ${2 * x}, but only ${need} remain: impossible.` })
        result = false
        break
      }
      cnt.set(2 * x, need - get(x))
      frames.push({ phase: 'pair', activeLine: 10, keys, counts: counts(), index: i, target: keys.indexOf(2 * x),
        message: `Pair all copies of ${x} with copies of ${2 * x}: ${2 * x} has ${need - get(x)} left over for its own double.` })
    }
  }
  frames.push({ phase: 'done', activeLine: result ? 11 : 9, keys, counts: counts(), index: -1, message: result ? 'Every value found its double: true.' : 'Some value could not be paired: false.' })
  return { input: [...arr], result, frames }
}

export const code = `def canReorderDoubled(arr):
    cnt = Counter(arr)
    if cnt[0] % 2:
        return False
    for x in sorted(cnt, key=abs):
        if x == 0:
            continue
        if cnt[x] > cnt[2 * x]:
            return False
        cnt[2 * x] -= cnt[x]
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
