export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with the key favorite_companies.')
  const lists = input.favorite_companies
  if (!Array.isArray(lists) || lists.length < 1 || lists.length > 6) throw new Error('favorite_companies needs 1 to 6 lists.')
  const companies = new Set()
  lists.forEach((list, i) => {
    if (!Array.isArray(list) || list.length < 1 || list.length > 4) throw new Error(`List ${i} needs 1 to 4 companies.`)
    if (list.some(c => typeof c !== 'string' || !/^[a-z]{1,10}$/.test(c)) || new Set(list).size !== list.length) {
      throw new Error(`List ${i} must hold distinct company names of lowercase letters.`)
    }
    list.forEach(c => companies.add(c))
  })
  if (companies.size > 12) throw new Error('At most 12 distinct companies, so the bitmasks stay small.')
  const keys = lists.map(list => [...list].sort().join(','))
  if (new Set(keys).size !== keys.length) throw new Error('No two people may have the same list.')
  return { favorite_companies: lists }
}

export function buildTrace(input) {
  const lists = input.favorite_companies
  const bit = new Map()
  const masks = Array(lists.length).fill(null)
  const kept = []
  const frames = []
  let current = -1
  let beatenBy = -1
  const snap = (phase, activeLine, message) => frames.push({
    phase, activeLine, current, beatenBy, masks: [...masks], kept: [...kept], bits: [...bit.entries()], message,
  })

  snap('start', L('set the answer to empty'), 'Start with an empty answer.')
  lists.forEach((companies, i) => {
    let mask = 0
    for (const c of companies) {
      if (!bit.has(c)) bit.set(c, bit.size)
      mask |= 1 << bit.get(c)
    }
    masks[i] = mask
  })
  snap('mask', L('turn each person'), 'Each list becomes a bitmask, one bit per company.')
  for (let i = 0; i < lists.length; i++) {
    current = i
    beatenBy = -1
    for (let j = 0; j < lists.length; j++) {
      if (j !== i && (masks[i] & masks[j]) === masks[i]) { beatenBy = j; break }
    }
    snap('scan', L('check whether some other person'), beatenBy === -1
      ? `No other list contains person ${i}'s list.`
      : `Person ${beatenBy}'s list contains person ${i}'s list, so person ${i} is out.`)
    if (beatenBy === -1) {
      kept.push(i)
      snap('keep', L('if none does'), `Keep person ${i}.`)
    }
  }
  current = -1
  beatenBy = -1
  snap('done', L('return the answer'), `Answer: [${kept.join(', ')}].`)
  return { input, lists, result: kept, frames }
}

export const code = `give each company a bit number as it first appears
turn each person's list into a bitmask of its companies
set the answer to empty
for each person i
  check whether some other person j has a mask that contains mask i
  if none does, add i to the answer
return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def people_indexes(favorite_companies):
    bit = {}
    masks = []
    for companies in favorite_companies:
        mask = 0
        for c in companies:
            if c not in bit:
                bit[c] = len(bit)
            mask |= 1 << bit[c]
        masks.append(mask)
    result = []
    for i, mi in enumerate(masks):
        if not any(j != i and (mi & mj) == mi for j, mj in enumerate(masks)):
            result.append(i)
    return result
`
