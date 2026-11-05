export function parseInput(text) {
  const data = JSON.parse(text)
  const { jewels, stones } = data ?? {}
  const letters = s => typeof s === 'string' && s.length <= 50 && /^[A-Za-z]*$/.test(s)
  if (!letters(jewels) || !letters(stones) || stones.length < 1) throw new Error('jewels and stones are letter strings (stones has 1–50 letters, jewels up to 50).')
  if (new Set(jewels).size !== jewels.length) throw new Error('Each jewel type is listed once.')
  return { jewels, stones }
}

const JS_LINES = [
  'function numJewelsInStones(jewels, stones) {',
  '  const isJewel = new Set(jewels) // the jewel types are the set members',
  '  let count = 0',
  '  for (const stone of stones) {',
  '    if (isJewel.has(stone)) count++ // this stone is a jewel',
  '  }',
  '  return count',
  '}',
]
const PY_LINES = [
  'def num_jewels_in_stones(jewels, stones):',
  '    is_jewel = set(jewels)',
  '    count = 0',
  '    for stone in stones:',
  '        if stone in is_jewel:',
  '            count += 1',
  '    return count',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// A set of jewel letters turns each membership test into one lookup.
export function buildTrace({ jewels, stones }) {
  const isJewel = new Set(jewels)
  let count = 0
  const frames = [{ phase: 'start', index: -1, count, activeLine: L('const isJewel'), pythonLine: P('is_jewel = set'), message: `Jewel types: ${[...isJewel].join(' ') || 'none'}.` }]
  for (let i = 0; i < stones.length; i++) {
    const hit = isJewel.has(stones[i])
    if (hit) count++
    frames.push({ phase: hit ? 'jewel' : 'stone', index: i, count, activeLine: L('if (isJewel.has(stone))'), pythonLine: P('if stone in is_jewel'), message: hit ? `'${stones[i]}' is a jewel: count ${count}.` : `'${stones[i]}' is not a jewel.` })
  }
  frames.push({ phase: 'done', index: stones.length - 1, count, result: count, activeLine: L('return count'), pythonLine: P('return count'), message: `${count} stone${count === 1 ? '' : 's'} are jewels.` })
  return { input: { jewels, stones }, result: count, frames }
}
