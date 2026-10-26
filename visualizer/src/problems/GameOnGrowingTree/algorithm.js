export function parseInput(text) {
  const parents = JSON.parse(text)
  if (!Array.isArray(parents) || parents.length < 1 || parents.length > 30) throw new Error('Enter a JSON array of 1–30 parent numbers, one per query.')
  parents.forEach((v, i) => {
    // Query i+1 adds vertex i+2 under an existing vertex, so the parent must be one of vertices 1..i+1.
    if (!Number.isInteger(v) || v < 1 || v > i + 1) throw new Error(`Query ${i + 1}: the parent must be an existing vertex from 1 to ${i + 1}.`)
  })
  return parents
}

// Lines of the solver the story points at (1-based, matching `code` below).
const L = { outer: 3, call: 4, reset: 8, pass1: 9, pass2: 11, depth: 13, answer: 15, slotKept: [18, 19, 20], pruned: 21, done: 5 }

/** Keeps the three longest branches of vertex v; returns the slot it lands in (1–3), or 0 when pruned. */
function makeSlots(size) {
  const first = Array(size).fill(0), second = Array(size).fill(0), third = Array(size).fill(0)
  const insert = (v, d) => {
    if (d > first[v]) { third[v] = second[v]; second[v] = first[v]; first[v] = d; return 1 }
    if (d > second[v]) { third[v] = second[v]; second[v] = d; return 2 }
    if (d > third[v]) { third[v] = d; return 3 }
    return 0
  }
  const snapshot = () => Array.from({ length: size }, (_, i) => [first[i], second[i], third[i]])
  return { first, second, third, insert, snapshot }
}

function slotLine(rank) { return rank ? L.slotKept[rank - 1] : L.pruned }

export function buildTrace(parents) {
  const frames = []
  const answers = []
  frames.push({
    chapter: 'Setup', activeLine: 2,
    message: `Vertex 1 is the whole tree. There are ${parents.length} queries. Each query attaches the next vertex, then we score the tree.`,
    scene: { root: { id: 1, children: [] }, roles: { focus: 1 }, panel: null, slots: null, incoming: null, answers: [], query: 0 },
  })

  for (let k = 1; k <= parents.length; k++) {
    const size = k + 1
    const parent = [0, ...parents.slice(0, k).map(v => v - 1)] // zero-based; vertex index 0 is the root
    const nodes = Array.from({ length: size }, (_, i) => ({ id: i + 1, children: [] }))
    for (let i = 1; i < size; i++) nodes[parent[i]].children.push(nodes[i])
    const slots = makeSlots(size)
    const sceneOf = (roles, panel, incoming, extra = {}) => ({
      root: nodes[0], roles, panel, incoming, slots: slots.snapshot(), answers: [...answers], query: k, ...extra,
    })

    const newcomer = size - 1
    frames.push({
      chapter: `Query ${k} · vertex ${size} arrives`, activeLine: L.outer,
      message: `Query ${k}: vertex ${size} joins under vertex ${parent[newcomer] + 1}. The tree now has ${size} vertices.`,
      scene: sceneOf({ new: size, target: parent[newcomer] + 1 }, parent[newcomer] + 1, null),
    })
    frames.push({
      chapter: `Query ${k} · reset`, activeLine: L.reset,
      message: 'Every vertex starts with empty slots. A slot holds one branch length below that vertex, and first ≥ second ≥ third.',
      scene: sceneOf({}, null, null),
    })

    // Pass 1, bottom-up: each vertex reports its branch length (second slot + 1) to its parent.
    for (let idx = size - 1; idx >= 1; idx--) {
      const p = parent[idx]
      const d = slots.second[idx] + 1
      const rank = slots.insert(p, d)
      const v = idx + 1
      frames.push({
        chapter: `Query ${k} · pass 1 · bottom-up`, activeLine: slotLine(rank),
        message: `Vertex ${v} reports branch length ${d} (its second slot ${d - 1} plus 1) to vertex ${p + 1}. ${rank
          ? `Vertex ${p + 1} keeps it in slot ${rank}.`
          : `Vertex ${p + 1} already has three branches at least this long, so this one is pruned.`}`,
        scene: sceneOf({ focus: v, target: p + 1 }, p + 1, { to: p + 1, value: d, rank }),
      })
    }

    // Pass 2, top-down: each vertex receives the best branch its parent can offer without going back.
    for (let idx = 1; idx < size; idx++) {
      const p = parent[idx]
      const useThird = slots.second[p] <= slots.second[idx] + 1
      const from = useThird ? slots.third[p] : slots.second[p]
      const d = from + 1
      const rank = slots.insert(idx, d)
      const v = idx + 1
      frames.push({
        chapter: `Query ${k} · pass 2 · top-down`, activeLine: L.depth,
        message: `Vertex ${p + 1} offers vertex ${v} a branch of ${d}, from its ${useThird ? 'third' : 'second'} slot (${from} plus 1). ${useThird
          ? `Its second slot is no longer than vertex ${v}'s own second branch plus one, so the third slot is used.`
          : `Its second slot is longer than vertex ${v}'s own second branch plus one, so the second slot is used.`} ${rank
          ? `Vertex ${v} keeps it in slot ${rank}.`
          : `Vertex ${v} has three branches at least this long, so it is pruned.`}`,
        scene: sceneOf({ focus: p + 1, target: v }, v, { to: v, value: d, rank }),
      })
    }

    let best = 0
    for (let i = 0; i < size; i++) if (slots.second[i] > best) best = slots.second[i]
    const bestVertex = slots.second.findIndex(s => s === best) + 1
    const answer = best + 1
    answers.push(answer)
    frames.push({
      chapter: `Query ${k} · score`, activeLine: L.answer,
      message: `The largest second slot is ${best}, at vertex ${bestVertex}. So the tree after query ${k} scores ${answer}.`,
      scene: sceneOf({ best: bestVertex }, bestVertex, null, { scoreOfQuery: answer }),
    })
  }

  frames.push({
    chapter: 'Result', activeLine: L.done,
    message: `Scores after each query: ${answers.join(', ')}.`,
    scene: { root: { id: 1, children: [] }, roles: {}, panel: null, slots: null, incoming: null, answers: [...answers], query: parents.length },
  })
  return { input: parents, result: answers, frames }
}

export const code = `def solve_all(parent_values):
    answers = []
    for size in range(2, n + 2):              # after each query
        answers.append(solve(prefix(size)))
    return answers

def solve(parent, size):
    first, second, third = [0] * size, [0] * size, [0] * size   # reset slots
    for node in range(size - 1, 0, -1):                          # pass 1: bottom-up
        insert_top3(parent[node], second[node] + 1)
    for node in range(1, size):                                  # pass 2: top-down
        p = parent[node]
        d = third[p] + 1 if second[p] <= second[node] + 1 else second[p] + 1
        insert_top3(node, d)
    return max(second) + 1                                       # the score

def insert_top3(v, d):                       # keep the three longest branches
    if d > first[v]: shift down, slot 1 = d
    elif d > second[v]: slot 2 = d
    elif d > third[v]: slot 3 = d
    else: pruned`.split('\n').map((text, index) => ({ line: index + 1, text }))
