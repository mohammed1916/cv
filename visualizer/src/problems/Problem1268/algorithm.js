export const phases = [
  { id: 'start', label: 'Sort products', description: 'Sort the product names so that matches for any prefix come out in alphabetical order.' },
  { id: 'prefix', label: 'Next prefix', description: 'Take the next longer prefix of the typed word.' },
  { id: 'collect', label: 'Collect matches', description: 'Walk the sorted names that start with this prefix and keep at most three.' },
  { id: 'done', label: 'Complete', description: 'Return one suggestion list for every prefix.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"products": ["bear", "bell"], "searchWord": "be"}.')
  const { products, searchWord } = input
  if (!Array.isArray(products) || products.length < 1 || products.length > 12 || !products.every(p => typeof p === 'string' && /^[a-z]{1,6}$/.test(p))) throw new Error('products is a list of 1 to 12 lowercase words of 1 to 6 letters.')
  if (typeof searchWord !== 'string' || !/^[a-z]{1,8}$/.test(searchWord)) throw new Error('searchWord is 1 to 8 lowercase letters.')
  return { products, searchWord }
}

export function buildTrace({ products, searchWord }) {
  const sorted = [...products].sort()
  const result = []
  const snap = (prefix, matches, scan) => ({ sorted, prefix, matches, scan, result: result.map(r => [...r]) })
  const frames = [{ phase: 'start', activeLine: L('const sorted = [...products]'), pythonLine: P('products.sort()'), snapshot: snap(null, [], null), message: `Sorted products: ${sorted.join(', ')}. Matches for any prefix will appear in this order.` }]
  for (let k = 1; k <= searchWord.length; k++) {
    const prefix = searchWord.slice(0, k)
    frames.push({ phase: 'prefix', activeLine: L('for (let k = 1'), pythonLine: P('for k in range'), snapshot: snap(prefix, [], null), message: `Prefix "${prefix}" is the next prefix of "${searchWord}".` })
    const matches = []
    for (let i = 0; i < sorted.length && matches.length < 3; i++) {
      if (!sorted[i].startsWith(prefix)) continue
      matches.push(sorted[i])
      frames.push({ phase: 'collect', activeLine: L('suggestions.push(word)'), pythonLine: P('suggestions.append'), snapshot: snap(prefix, [...matches], i), message: `"${sorted[i]}" starts with "${prefix}" and is suggestion ${matches.length}${matches.length === 3 ? ', so the scan stops at three.' : '.'}` })
    }
    if (matches.length === 0) frames.push({ phase: 'collect', activeLine: L('result.push(suggestions)'), pythonLine: P('result.append'), snapshot: snap(prefix, [], null), message: `No product starts with "${prefix}", so its list is empty.` })
    result.push(matches)
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), snapshot: snap(null, [], null), message: `Return ${result.length} suggestion lists, one for each prefix.` })
  return { input: { products, searchWord }, result, frames }
}

export const code = `function suggestedProducts(products, searchWord) {
  const sorted = [...products].sort()
  const result = []
  for (let k = 1; k <= searchWord.length; k++) {
    const prefix = searchWord.slice(0, k)
    const suggestions = []
    for (const word of sorted) {
      if (word.startsWith(prefix)) {
        suggestions.push(word)
        if (suggestions.length === 3) break
      }
    }
    result.push(suggestions)
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def suggested_products(products, search_word):
    products.sort()
    result = []
    for k in range(1, len(search_word) + 1):
        prefix = search_word[:k]
        suggestions = []
        for word in products:
            if word.startswith(prefix):
                suggestions.append(word)
                if len(suggestions) == 3:
                    break
        result.append(suggestions)
    return result
`
