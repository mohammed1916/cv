const LIMIT = 30

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with intervals and k.')
  const { intervals, k } = input
  if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > 8) throw new Error('intervals holds 1 to 8 pairs.')
  for (const pair of intervals) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0 && v <= LIMIT) || pair[0] > pair[1]) {
      throw new Error(`Each interval is [start, end] with 0 <= start <= end <= ${LIMIT}.`)
    }
  }
  if (!Number.isInteger(k) || k < 0 || k > 10) throw new Error('k is an integer from 0 to 10.')
  return { intervals, k }
}

export const code = `minimum groups after inserting one interval of length at most k
  sort the intervals by start
  components = empty list
  for each interval [s, e] in sorted order
    if components is nonempty and s is at most the last end then extend the last end to max(last end, e)
    else append [s, e] as a new component
  m = number of components
  best = 0
  j = 0
  for i from 0 to m minus 1
    j = max(j, i)
    while j + 1 < m and start of j+1 minus end of i is at most k
      j = j + 1
    best = max(best, j minus i)
  return m minus best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_groups_after_insert(intervals, k):
    ordered = sorted(intervals)
    components = []
    for s, e in ordered:
        if components and s <= components[-1][1]:
            components[-1][1] = max(components[-1][1], e)
        else:
            components.append([s, e])
    m = len(components)
    best = 0
    j = 0
    for i in range(m):
        j = max(j, i)
        while j + 1 < m and components[j + 1][0] - components[i][1] <= k:
            j += 1
        best = max(best, j - i)
    return m - best
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ intervals, k }) {
  const frames = []
  const sorted = intervals.map(([s, e]) => [s, e]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const comps = []
  const state = { i: -1, j: -1, bridge: null, rejected: false, best: 0, groups: null, cursor: -1 }
  const push = (phase, codeText, pyText, message, extra = {}) => {
    frames.push({
      phase, activeLine: L(codeText), pythonLine: P(pyText), message,
      sorted, k, ...state, ...extra,
      components: comps.map(c => [...c]),
    })
  }

  push('sort', 'sort the intervals by start', 'ordered = sorted(intervals)', `Sorted ${sorted.length} interval${sorted.length === 1 ? '' : 's'} by start.`, { cursor: -1 })
  sorted.forEach(([s, e], index) => {
    const last = comps[comps.length - 1]
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e)
      push('merge', 'if components is nonempty', 'if components and s <= components[-1][1]', `[${s}, ${e}] shares a point with group ${comps.length}; that group now ends at ${last[1]}.`, { cursor: index })
    } else {
      comps.push([s, e])
      push('merge', 'else append', 'components.append([s, e])', `[${s}, ${e}] starts group ${comps.length}.`, { cursor: index })
    }
  })

  const m = comps.length
  push('count', 'm = number of components', 'm = len(components)', `${m} group${m === 1 ? '' : 's'} before any insertion.`, { cursor: -1 })
  state.best = 0
  push('start', 'best = 0', 'best = 0', 'No group has been bridged yet.', {})
  state.j = 0
  push('start', 'j = 0', 'j = 0', 'The bridge frontier starts at group 1.', {})

  for (let i = 0; i < m; i += 1) {
    state.i = i
    state.bridge = null
    state.rejected = false
    state.j = Math.max(state.j, i)
    push('sweep', 'j = max(j, i)', 'j = max(j, i)', `Left end of the bridge is group ${i + 1}, ending at ${comps[i][1]}.`, {})
    while (state.j + 1 < m && comps[state.j + 1][0] - comps[i][1] <= k) {
      const next = comps[state.j + 1]
      const length = next[0] - comps[i][1]
      state.j += 1
      state.bridge = [comps[i][1], next[0]]
      push('extend', 'while j + 1 < m', 'while j + 1 < m and components[j + 1][0] - components[i][1] <= k', `A bridge of length ${length} reaches group ${state.j + 1}, within k = ${k}.`, {})
    }
    if (state.j + 1 < m) {
      const next = comps[state.j + 1]
      const length = next[0] - comps[i][1]
      state.bridge = [comps[i][1], next[0]]
      state.rejected = true
      push('stop', 'while j + 1 < m', 'while j + 1 < m and components[j + 1][0] - components[i][1] <= k', `Group ${state.j + 2} needs a bridge of length ${length}, over k = ${k}; stop extending.`, {})
    }
    state.best = Math.max(state.best, state.j - i)
    state.bridge = null
    state.rejected = false
    push('best', 'best = max(best, j minus i)', 'best = max(best, j - i)', `Bridging groups ${i + 1} to ${state.j + 1} saves ${state.j - i} group${state.j - i === 1 ? '' : 's'}; best is ${state.best}.`, { i, j: state.j })
  }

  state.i = -1
  state.j = -1
  state.groups = m - state.best
  push('done', 'return m minus best', 'return m - best', `${m} groups minus ${state.best} saved gives ${state.groups}.`, { groups: state.groups })
  return { input: { intervals, k }, result: state.groups, frames }
}
