export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the keys items and k.')
  const { items, k } = input
  if (!Array.isArray(items) || items.length < 1 || items.length > 8) throw new Error('items needs 1 to 8 [profit, category] pairs.')
  items.forEach((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2 || !Number.isInteger(pair[0]) || !Number.isInteger(pair[1]) || pair[0] < 1 || pair[0] > 10 || pair[1] < 1 || pair[1] > 4) {
      throw new Error(`items[${i}] must be [profit, category] with profit 1 to 10 and category 1 to 4.`)
    }
  })
  if (!Number.isInteger(k) || k < 1 || k > items.length) throw new Error('k must be from 1 to the number of items.')
  return { items, k }
}

export function buildTrace(input) {
  const { items, k } = input
  const sorted = items.map(([profit, category], index) => ({ profit, category, index }))
    .sort((a, b) => b.profit - a.profit || a.index - b.index)
  const chosen = Array(sorted.length).fill(false)
  const frames = []
  const seen = new Set()
  const duplicates = []
  let total = 0
  let best = 0
  let cursor = -1
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, cursor, chosen: [...chosen], total, distinct: seen.size, best, message,
  })

  snap('sort', L('sort the items by profit'), 'Items are sorted by profit, largest first.')
  for (let i = 0; i < k; i++) {
    cursor = i
    chosen[i] = true
    total += sorted[i].profit
    if (seen.has(sorted[i].category)) duplicates.push(i)
    else seen.add(sorted[i].category)
  }
  snap('take', L('take the first k items'), `Take the first ${k} items, with profit ${total}.`)
  snap('dup', L('note which of them repeat'), `${duplicates.length} chosen item${duplicates.length === 1 ? '' : 's'} repeat a category.`)
  best = total + seen.size ** 2
  snap('best', L('best is the total'), `Starting elegance: ${total} + ${seen.size}^2 = ${best}.`)
  for (let i = k; i < sorted.length; i++) {
    cursor = i
    const item = sorted[i]
    if (seen.has(item.category)) {
      snap('skip', L('skip it if'), `Category ${item.category} is already taken, so skip profit ${item.profit}.`)
      continue
    }
    if (duplicates.length === 0) {
      snap('skip', L('skip it if'), `No duplicate is left to swap out, so profit ${item.profit} is skipped.`)
      continue
    }
    const out = duplicates.pop()
    chosen[out] = false
    chosen[i] = true
    total += item.profit - sorted[out].profit
    seen.add(item.category)
    best = Math.max(best, total + seen.size ** 2)
    snap('swap', L('swap out the weakest'), `Swap profit ${sorted[out].profit} out for ${item.profit} (new category ${item.category}).`)
    snap('update', L('update best'), `Elegance is now ${total + seen.size ** 2}. Best is ${best}.`)
  }
  cursor = -1
  snap('done', L('return best'), `Maximum elegance: ${best}.`)
  return { input, sorted, result: best, frames }
}

export const code = `sort the items by profit, largest first
take the first k items and add up their profit
note which of them repeat a category
best is the total profit plus the distinct categories squared
for each item after the first k, in the same order
  skip it if its category is already taken
  otherwise swap out the weakest duplicate for it, if there is one
  update best with the new total plus distinct squared
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_elegance(items, k):
    items = sorted(items, key=lambda pair: -pair[0])
    total = 0
    seen = set()
    duplicates = []
    for profit, category in items[:k]:
        total += profit
        if category in seen:
            duplicates.append(profit)
        else:
            seen.add(category)
    best = total + len(seen) ** 2
    for profit, category in items[k:]:
        if category in seen:
            continue
        if not duplicates:
            continue
        total += profit - duplicates.pop()
        seen.add(category)
        best = max(best, total + len(seen) ** 2)
    return best
`
