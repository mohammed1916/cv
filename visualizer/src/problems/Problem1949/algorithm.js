// LeetCode 1949 (SQL): direct the friendships both ways, count common friends for each stored pair, keep pairs with at least three, and order the result.
const SOURCE = [
  'function strongFriendships(friendship) {',
  '  const friendsOf = new Map()',
  '  for (const [a, b] of friendship) {',
  '    if (!friendsOf.has(a)) friendsOf.set(a, new Set())',
  '    if (!friendsOf.has(b)) friendsOf.set(b, new Set())',
  '    friendsOf.get(a).add(b)',
  '    friendsOf.get(b).add(a)',
  '  }',
  '  const pairs = friendship.map(([a, b]) => {',
  '    const common = [...friendsOf.get(a)].filter(f => friendsOf.get(b).has(f))',
  '    return [a, b, common.length]',
  '  })',
  '  const kept = pairs.filter(([, , count]) => count >= 3)',
  '  return kept.sort((x, y) => x[0] - y[0] || x[1] - y[1])',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def strong_friendships(friendship):
    friends_of = {}
    for a, b in friendship:
        friends_of.setdefault(a, set()).add(b)
        friends_of.setdefault(b, set()).add(a)
    pairs = []
    for a, b in friendship:
        common = [f for f in friends_of[a] if f in friends_of[b]]
        pairs.append([a, b, len(common)])
    kept = [p for p in pairs if p[2] >= 3]
    return sorted(kept, key=lambda p: (p[0], p[1]))
`

export const sql = `WITH both_ways AS (
  SELECT user1_id AS a, user2_id AS b FROM Friendship
  UNION ALL
  SELECT user2_id, user1_id FROM Friendship
)
SELECT f.user1_id, f.user2_id, COUNT(*) AS common_friend
FROM Friendship f
JOIN both_ways x ON x.a = f.user1_id
JOIN both_ways y ON y.a = f.user2_id AND y.b = x.b
GROUP BY f.user1_id, f.user2_id
HAVING COUNT(*) >= 3
ORDER BY f.user1_id, f.user2_id;
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'source', label: 'Both directions', description: 'Every friendship stored in both directions.' },
  { id: 'join', label: 'Common friends', description: 'Count the friends that two users share.' },
  { id: 'group', label: 'Filter', description: 'Keep pairs with at least three common friends.' },
  { id: 'order', label: 'Order', description: 'Sorted result with the common-friend count.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"friendship":[[1,2],[1,3]]}.') }
  const rows = input?.friendship
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 14) throw new Error('friendship holds 1 to 14 pairs.')
  const seen = new Set()
  for (const r of rows) {
    if (!Array.isArray(r) || r.length !== 2 || !Number.isInteger(r[0]) || !Number.isInteger(r[1]) || r[0] < 1 || r[1] > 8 || r[0] >= r[1]) throw new Error('Each pair is [user1_id, user2_id] with 1 <= user1_id < user2_id <= 8.')
    if (seen.has(`${r[0]},${r[1]}`)) throw new Error('Each friendship appears once.')
    seen.add(`${r[0]},${r[1]}`)
  }
  return { friendship: rows }
}

export function buildTrace({ friendship }) {
  const frames = []
  const both = friendship.flatMap(([a, b]) => [[a, b], [b, a]])
  frames.push({ phase: 'source', activeLine: L('for (const [a, b] of friendship)'), pythonLine: P('for a, b in friendship:'), message: `${both.length} directed rows from ${friendship.length} friendships.`, stage: 'source', rows: both.map(([a, b]) => [a, b]), cols: ['user', 'friend'], match: [] })
  const friendsOf = new Map()
  for (const [a, b] of friendship) {
    if (!friendsOf.has(a)) friendsOf.set(a, new Set())
    if (!friendsOf.has(b)) friendsOf.set(b, new Set())
    friendsOf.get(a).add(b)
    friendsOf.get(b).add(a)
  }
  const pairs = friendship.map(([a, b]) => {
    const common = [...friendsOf.get(a)].filter(f => friendsOf.get(b).has(f))
    return [a, b, common.length, common]
  })
  frames.push({ phase: 'join', activeLine: L('const common'), pythonLine: P('common = [f'), message: pairs.map(([a, b, c]) => `${a}-${b}: ${c}`).join(', '), stage: 'join', rows: pairs.map(([a, b, c]) => [a, b, c]), cols: ['user1_id', 'user2_id', 'common_friend'], match: [] })
  const kept = pairs.filter(([, , count]) => count >= 3)
  frames.push({ phase: 'group', activeLine: L('const kept'), pythonLine: P('kept = [p'), message: `${kept.length} pair(s) reach three common friends.`, stage: 'group', rows: kept.map(([a, b, c]) => [a, b, c]), cols: ['user1_id', 'user2_id', 'common_friend'], match: kept.map(([a]) => a) })
  const result = kept.map(([a, b, c]) => [a, b, c]).sort((x, y) => x[0] - y[0] || x[1] - y[1])
  frames.push({ phase: 'order', activeLine: L('return kept.sort'), pythonLine: P('return sorted'), message: 'Result ordered by user1_id, then user2_id.', stage: 'order', rows: result, cols: ['user1_id', 'user2_id', 'common_friend'], match: result.map(r => r[0]), result })
  return { input: { friendship }, result, frames }
}
