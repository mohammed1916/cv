const ORDER = ['electronics', 'grocery', 'pharmacy', 'restaurant']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with code, business_line and is_active.')
  const { code, business_line, is_active } = input
  if (!Array.isArray(code) || code.length < 1 || code.length > 8) throw new Error('code needs 1 to 8 entries.')
  if (!Array.isArray(business_line) || business_line.length !== code.length) throw new Error('business_line must match code in length.')
  if (!Array.isArray(is_active) || is_active.length !== code.length) throw new Error('is_active must match code in length.')
  if (code.some(c => typeof c !== 'string' || c.length > 8)) throw new Error('Each code is a string of up to 8 characters.')
  if (business_line.some(b => typeof b !== 'string' || b.length > 20)) throw new Error('Each business line is a string of up to 20 characters.')
  if (is_active.some(a => typeof a !== 'boolean')) throw new Error('is_active holds true or false.')
  return { code, business_line, is_active }
}

export function buildTrace(input) {
  const { code, business_line, is_active } = input
  const kept = []
  const frames = [{ phase: 'start', activeLine: L('set kept to an empty list'), index: -1, kept: 0, message: 'Check each coupon against the three rules.' }]
  code.forEach((c, i) => {
    const ok = c.length > 0 && /^[A-Za-z0-9_]+$/.test(c) && ORDER.includes(business_line[i]) && is_active[i] === true
    if (ok) kept.push({ rank: ORDER.indexOf(business_line[i]), code: c })
    frames.push({ phase: ok ? 'keep' : 'drop', activeLine: L('if code i is not empty'), index: i, kept: kept.length, message: ok ? `Keep "${c}" (${business_line[i]}).` : `Drop coupon ${i}: it breaks a rule.` })
  })
  kept.sort((a, b) => a.rank - b.rank || (a.code < b.code ? -1 : a.code > b.code ? 1 : 0))
  const result = kept.map(entry => entry.code)
  frames.push({ phase: 'done', activeLine: L('return the codes in kept'), index: -1, kept: result.length, message: `${result.length} valid coupons, grouped by business line.` })
  return { input, result, frames }
}

export const code = `valid coupon codes in order:
  set rank to the business line order: electronics, grocery, pharmacy, restaurant
  set kept to an empty list
  for each coupon i
    if code i is not empty, uses only letters, digits or underscores, has a known business line, and is active then add (rank, code) to kept
  sort kept by rank, then by code
  return the codes in kept, in that order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def validate_coupons(code, business_line, is_active):
    rank = {'electronics': 0, 'grocery': 1, 'pharmacy': 2, 'restaurant': 3}
    kept = []
    for value, line, active in zip(code, business_line, is_active):
        if value and all(ch.isascii() and (ch.isalnum() or ch == '_') for ch in value) and line in rank and active:
            kept.append((rank[line], value))
    kept.sort()
    return [value for _, value in kept]
`
