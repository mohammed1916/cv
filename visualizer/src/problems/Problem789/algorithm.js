export function parseInput(text) {
  const v = JSON.parse(text)
  const err = 'Enter {"ghosts":[[1,0],[0,3]],"target":[0,1]}: 1-20 ghosts and a target, integer coordinates with |x|,|y| <= 20 (visualization cap). You start at [0,0].'
  if (!v || !Array.isArray(v.ghosts) || !Array.isArray(v.target)) throw new Error(err)
  const ok = p => Array.isArray(p) && p.length === 2 && p.every(c => Number.isInteger(c) && Math.abs(c) <= 20)
  if (v.ghosts.length < 1 || v.ghosts.length > 20 || !v.ghosts.every(ok) || !ok(v.target)) throw new Error(err)
  return { ghosts: v.ghosts, target: v.target }
}
export function buildTrace({ ghosts, target }) {
  const mine = Math.abs(target[0]) + Math.abs(target[1])
  const dists = []
  const frames = [{ phase: 'start', activeLine: 2, current: -1, dists: [], mine, message: `You need ${mine} moves to reach [${target}] (|${target[0]}| + |${target[1]}|). A ghost that can arrive in the same time or sooner can simply wait there.` }]
  let result = true
  for (let i = 0; i < ghosts.length; i++) {
    const [gx, gy] = ghosts[i]
    const d = Math.abs(gx - target[0]) + Math.abs(gy - target[1])
    dists.push(d)
    if (d <= mine) {
      result = false
      frames.push({ phase: 'caught', activeLine: 4, current: i, dists: [...dists], mine, message: `Ghost ${i} at [${gx},${gy}] is ${d} away, which is at most your ${mine}: it reaches the target first (or at the same time) and blocks you.` })
      break
    }
    frames.push({ phase: 'safe', activeLine: 3, current: i, dists: [...dists], mine, message: `Ghost ${i} at [${gx},${gy}] needs ${d} moves, strictly more than your ${mine}: it cannot stop you.` })
  }
  frames.push({ phase: 'done', activeLine: result ? 6 : 5, current: -1, dists: [...dists], mine, message: result ? 'No ghost is close enough: you can escape.' : 'A ghost can intercept: you cannot escape.' })
  return { input: { ghosts, target }, result, frames }
}
export const code = `def escapeGhosts(ghosts, target):
    mine = abs(target[0]) + abs(target[1])
    for gx, gy in ghosts:
        if abs(gx - target[0]) + abs(gy - target[1]) <= mine:
            return False
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
