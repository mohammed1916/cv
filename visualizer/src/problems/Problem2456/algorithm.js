const NAME = /^[a-z]{1,10}$/
const VIDEO_ID = /^[a-z0-9]{1,8}$/

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.creators) || !Array.isArray(data.ids) || !Array.isArray(data.views)) throw new Error('Use {"creators": [...], "ids": [...], "views": [...]}.')
  const { creators, ids, views } = data
  if (creators.length < 1 || creators.length > 20 || ids.length !== creators.length || views.length !== creators.length) throw new Error('Use 1 to 20 videos; the three arrays must have the same length.')
  if (creators.some(c => typeof c !== 'string' || !NAME.test(c))) throw new Error('Creator names are 1 to 10 lowercase letters.')
  if (ids.some(d => typeof d !== 'string' || !VIDEO_ID.test(d))) throw new Error('Video ids are 1 to 8 lowercase letters or digits.')
  if (views.some(v => !Number.isInteger(v) || v < 0 || v > 10)) throw new Error('Views are integers from 0 to 10.')
  return { creators, ids, views }
}

export function buildTrace(input) {
  const { creators, ids, views } = input
  const popularity = new Map(), top = new Map()
  const maps = () => [
    { name: 'popularity', keyLabel: 'creator', valueLabel: 'total views', isSet: false, entries: [...popularity] },
    { name: 'top', keyLabel: 'creator', valueLabel: 'best video (views)', isSet: false, entries: [...top].map(([c, t]) => [c, `${t.id} (${t.views})`]) },
  ]
  const frames = [{ phase: 'start', activeLine: L('popularity = empty map'), index: -1, maps: maps(), ops: [], result: [], message: 'Track each creator’s total views and best video. Ties on views go to the smaller id.' }]
  creators.forEach((c, i) => {
    const d = ids[i], v = views[i]
    const before = popularity.get(c)
    popularity.set(c, (before ?? 0) + v)
    const prev = top.get(c)
    const better = !prev || v > prev.views || (v === prev.views && d < prev.id)
    if (better) top.set(c, { id: d, views: v })
    frames.push({ phase: 'video', activeLine: L('add v to popularity'), index: i, maps: maps(),
      ops: [{ map: 'popularity', type: before === undefined ? 'insert' : 'update', key: c, value: (before ?? 0) + v, before }],
      result: [], message: `Video ${d} by ${c} has ${v} views. ${c} now has ${popularity.get(c)} in total${better ? `, and ${d} is the best video so far` : ''}.` })
  })
  const best = Math.max(...popularity.values())
  const result = [...popularity.keys()].sort().filter(c => popularity.get(c) === best).map(c => [c, top.get(c).id])
  frames.push({ phase: 'done', activeLine: L('return answer'), index: -1, maps: maps(), ops: [], result,
    message: `Most popular creators with ${best} views: ${result.map(([c, d]) => `${c} (${d})`).join(', ')}.` })
  return { input, result, frames }
}

export const code = `most popular creators with their best video
popularity = empty map from creator to total views
top = empty map from creator to best video id and its views
for each video i with creator c, id d and views v
  add v to popularity of c
  if c has no top video, or v is more than its top views, or v ties and d is smaller then
    set top of c to d and v
best = the largest popularity value
answer = empty list
for each creator c in popularity, sorted by name
  if popularity of c equals best then
    append [c, top id of c] to answer
return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def most_popular_creator(creators, ids, views):
    popularity = {}
    top = {}
    for c, d, v in zip(creators, ids, views):
        popularity[c] = popularity.get(c, 0) + v
        if c not in top or v > top[c][1] or (v == top[c][1] and d < top[c][0]):
            top[c] = (d, v)
    best = max(popularity.values())
    return [[c, top[c][0]] for c in sorted(popularity) if popularity[c] == best]
`
