const NAME = /^[a-z]{1,10}$/

export function parseInput(text) {
  const data = JSON.parse(text)
  const { foods, cuisines, ratings } = data ?? {}
  const ops = data?.operations
  const args = data?.arguments
  if (!Array.isArray(foods) || foods.length < 1 || foods.length > 8) throw new Error('Use "foods" as an array of 1 to 8 names.')
  if (new Set(foods).size !== foods.length || foods.some(f => !NAME.test(f))) throw new Error('Food names are unique lowercase words of 1 to 10 letters.')
  if (!Array.isArray(cuisines) || cuisines.length !== foods.length || cuisines.some(c => !NAME.test(c))) throw new Error('"cuisines" needs one lowercase name per food.')
  if (!Array.isArray(ratings) || ratings.length !== foods.length || ratings.some(r => !Number.isInteger(r) || r < 1 || r > 20)) throw new Error('Ratings are integers from 1 to 20, one per food.')
  if (!Array.isArray(ops) || !Array.isArray(args) || ops.length !== args.length || ops.length < 1 || ops.length > 12) throw new Error('Use "operations" and "arguments" arrays of the same length from 1 to 12.')
  const rating = Object.fromEntries(foods.map((f, i) => [f, ratings[i]]))
  const cuisineSet = new Set(cuisines)
  ops.forEach((op, i) => {
    const a = args[i]
    if (op === 'changeRating') {
      if (!Array.isArray(a) || a.length !== 2 || !(a[0] in rating) || !Number.isInteger(a[1]) || a[1] < 1 || a[1] > 20) throw new Error('changeRating takes an existing food and a rating from 1 to 20.')
      rating[a[0]] = a[1]
    } else if (op === 'highestRated') {
      if (!Array.isArray(a) || a.length !== 1 || !cuisineSet.has(a[0])) throw new Error('highestRated takes a cuisine that has at least one food.')
    } else {
      throw new Error('Operations are "changeRating" or "highestRated".')
    }
  })
  return { foods, cuisines, ratings, operations: ops, arguments: args }
}

export function buildTrace({ foods, cuisines, ratings, operations, arguments: args }) {
  const cuisineOf = {}
  const rating = {}
  const entries = {}
  foods.forEach((f, i) => {
    cuisineOf[f] = cuisines[i]
    rating[f] = ratings[i]
    ;(entries[cuisines[i]] ??= []).push({ r: ratings[i], f })
  })
  const result = []
  const frames = [{ phase: 'start', activeLine: L('store each food cuisine and rating'), rating: { ...rating }, answer: null, message: 'Each cuisine gets a heap of its foods, keyed by rating.' }]
  operations.forEach((op, i) => {
    if (op === 'changeRating') {
      const [food, r] = args[i]
      rating[food] = r
      entries[cuisineOf[food]].push({ r, f: food })
      result.push(null)
      frames.push({ phase: 'change', activeLine: L('set the rating of that food'), rating: { ...rating }, answer: null, message: `${food} changes to ${r}.` })
    } else {
      const c = args[i][0]
      const live = entries[c].filter(e => rating[e.f] === e.r)
      entries[c] = live
      let top = live[0]
      for (const e of live) if (e.r > top.r || (e.r === top.r && e.f < top.f)) top = e
      result.push(top.f)
      frames.push({ phase: 'query', activeLine: L('answer with the food at the top'), rating: { ...rating }, answer: top.f, message: `Best ${c} food is ${top.f} at ${top.r}.` })
    }
  })
  return { input: { foods, cuisines, ratings, operations, arguments: args }, result, frames }
}

export const code = `highest rated food in each cuisine, with rating changes
  store each food cuisine and rating
  for each cuisine keep a heap of its foods, highest rating first and smaller name on ties
  for each operation in order
    if it is changeRating food r
      set the rating of that food to r and push a new entry into its cuisine heap
    if it is highestRated cuisine
      discard entries whose rating is no longer current
      answer with the food at the top of that cuisine heap
  return the answers in order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def food_ratings(foods, cuisines, ratings, operations, arguments):
    cuisine_of = {}
    rating_of = {}
    heaps = {}
    for f, c, r in zip(foods, cuisines, ratings):
        cuisine_of[f] = c
        rating_of[f] = r
        heaps.setdefault(c, []).append((-r, f))
    for h in heaps.values():
        heapq.heapify(h)
    out = []
    for op, args in zip(operations, arguments):
        if op == 'changeRating':
            food, r = args
            rating_of[food] = r
            heapq.heappush(heaps[cuisine_of[food]], (-r, food))
            out.append(None)
        else:
            heap = heaps[args[0]]
            while -heap[0][0] != rating_of[heap[0][1]]:
                heapq.heappop(heap)
            out.append(heap[0][1])
    return out
`
