export function parseInput(text) {
  const ages = JSON.parse(text)
  if (!Array.isArray(ages) || !ages.length || ages.length > 200 || ages.some(a => !Number.isInteger(a) || a < 1 || a > 120)) throw new Error('Enter a JSON array of 1-200 integer ages from 1 to 120 (visualization cap).')
  return ages
}
export function buildTrace(ages) {
  const cnt = new Array(121).fill(0)
  ages.forEach(a => { cnt[a]++ })
  const present = []
  cnt.forEach((c, a) => { if (c) present.push(a) })
  const entries = present.map(a => ({ age: a, count: cnt[a] }))
  const frames = [{ phase: 'start', sender: 0, lo: 0, add: 0, total: 0, activeLine: 2, message: `Bucket ${ages.length} people into age counts: ${entries.length} distinct age(s). Requests depend only on ages.` }]
  let total = 0
  for (const a of present) {
    const lo = Math.floor(0.5 * a + 7) + 1
    let receivers = 0
    for (let b = lo; b <= a; b++) receivers += cnt[b]
    const add = lo <= a ? cnt[a] * (receivers - 1) : 0
    total += add
    frames.push({ phase: 'age', sender: a, lo, add, total, activeLine: 12,
      message: lo > a ? `Age ${a}: receivers must be older than ${0.5 * a + 7} yet not older than ${a}; no valid range, so 0 requests.`
        : `Age ${a} (x${cnt[a]}) may message ages ${lo}..${a}: ${receivers} people, minus themselves. Adds ${cnt[a]} * ${receivers - 1} = ${add}. Total ${total}.` })
  }
  frames.push({ phase: 'done', sender: 0, lo: 0, add: 0, total, activeLine: 13, message: `Total friend requests: ${total}.` })
  return { input: [...ages], entries, result: total, frames }
}
export const code = `def numFriendRequests(ages):
    cnt = [0] * 121
    for a in ages:
        cnt[a] += 1
    total = 0
    for a in range(1, 121):
        if cnt[a] == 0:
            continue
        for b in range(1, 121):
            if b <= 0.5 * a + 7 or b > a:
                continue
            total += cnt[a] * (cnt[b] - (a == b))
    return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
