const MAX_COURSES = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, relations, k } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > MAX_COURSES) throw new Error(`n must be an integer from 1 to ${MAX_COURSES}.`)
  if (!Number.isInteger(k) || k < 1 || k > n) throw new Error('k must be an integer from 1 to n.')
  if (!Array.isArray(relations)) throw new Error('relations must be a list of [before, after] pairs.')
  const seen = new Set()
  for (const pair of relations) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(c => !Number.isInteger(c) || c < 1 || c > n)) throw new Error('Each relation is [before, after] with course numbers from 1 to n.')
    if (pair[0] === pair[1]) throw new Error('A course cannot precede itself.')
    if (seen.has(`${pair[0]},${pair[1]}`)) throw new Error('Each relation may be listed once.')
    seen.add(`${pair[0]},${pair[1]}`)
  }
  // Kahn's algorithm: every course must eventually become free of prerequisites.
  const indegree = Array(n).fill(0)
  const after = Array.from({ length: n }, () => [])
  for (const [a, b] of relations) { after[a - 1].push(b - 1); indegree[b - 1]++ }
  const queue = indegree.flatMap((d, i) => (d === 0 ? [i] : []))
  let done = 0
  while (queue.length) {
    const c = queue.pop()
    done++
    for (const next of after[c]) if (--indegree[next] === 0) queue.push(next)
  }
  if (done !== n) throw new Error('The prerequisites contain a cycle.')
  return { n, relations, k }
}

export const code = `minimum semesters(n, relations, k)
  set need[i] to the courses that must be taken before course i
  set frontier to {nothing taken}, and semester to 0
  while the frontier does not contain every course
    add 1 to semester
    set next to nothing
    for each taken set in frontier
      find the courses whose prerequisites are all taken and that are not taken yet
      for each way to take the smaller of k and that many of them
        add the new taken set to next if it was not seen before
    replace frontier with next
  return semester`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// A taken set is a bitmask. Taking more courses never hurts, so each semester takes as many courses as allowed.
export function buildTrace({ n, relations, k }) {
  const need = Array(n).fill(0)
  for (const [a, b] of relations) need[b - 1] |= 1 << (a - 1)
  const full = (1 << n) - 1
  const combos = (list, size) => {
    if (size === 0) return [[]]
    if (list.length < size) return []
    const [head, ...rest] = list
    return [...combos(rest, size - 1).map(c => [head, ...c]), ...combos(rest, size)]
  }
  const rolesFor = mask => Array.from({ length: n }, (_, i) => {
    if (mask & (1 << i)) return 'taken'
    return (need[i] & mask) === need[i] ? 'ready' : 'waiting'
  })
  let frontier = [0]
  const seen = new Set([0])
  let semester = 0
  const frames = [{ phase: 'start', mask: 0, roles: rolesFor(0), semester: 0, activeLine: L('set need[i]'), message: 'No course is taken yet. Each semester takes up to k courses whose prerequisites are done.' }]
  while (!frontier.includes(full)) {
    semester++
    frames.push({ phase: 'semester', mask: null, roles: null, semester, activeLine: L('add 1 to semester'), message: `Semester ${semester}: ${frontier.length} distinct set(s) of finished courses to extend.` })
    const next = []
    for (const taken of frontier) {
      const ready = Array.from({ length: n }, (_, i) => i).filter(i => !(taken & (1 << i)) && (need[i] & taken) === need[i])
      const take = Math.min(k, ready.length)
      for (const picks of combos(ready, take)) {
        const fresh = picks.reduce((mask, i) => mask | (1 << i), taken)
        if (!seen.has(fresh)) { seen.add(fresh); next.push(fresh) }
      }
      frames.push({ phase: 'expand', mask: taken, roles: rolesFor(taken), semester, activeLine: L('find the courses whose'), message: `Finished set ${taken.toString(2).padStart(n, '0')}: ${ready.length} course(s) are ready, so ${take} are taken this semester.` })
    }
    frontier = next
  }
  const result = semester
  frames.push({ phase: 'done', mask: full, roles: rolesFor(full), semester, activeLine: L('return semester'), result, message: `All ${n} courses are done in ${result} semester(s).` })
  return { input: { n, relations, k }, result, frames }
}

export const python = `from itertools import combinations

def min_number_of_semesters(n, relations, k):
    need = [0] * n
    for a, b in relations:
        need[b - 1] |= 1 << (a - 1)
    full = (1 << n) - 1
    frontier = {0}
    seen = {0}
    semester = 0
    while full not in frontier:
        semester += 1
        nxt = set()
        for taken in frontier:
            ready = [i for i in range(n)
                     if not (taken >> i) & 1 and (need[i] & taken) == need[i]]
            take = min(k, len(ready))
            for picks in combinations(ready, take):
                fresh = taken
                for i in picks:
                    fresh |= 1 << i
                if fresh not in seen:
                    seen.add(fresh)
                    nxt.add(fresh)
        frontier = nxt
    return semester
`
