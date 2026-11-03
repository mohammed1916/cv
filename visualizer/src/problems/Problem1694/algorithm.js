export const phases = [
  { id: 'start', label: 'Clean', description: 'Keep only the digits; spaces and dashes are separators to discard.' },
  { id: 'take', label: 'Blocks of 3', description: 'While more than 4 digits remain, take the next 3 as one block.' },
  { id: 'finish', label: 'Last 2 to 4', description: 'Four remaining digits become two pairs; two or three form one block.' },
  { id: 'done', label: 'Join', description: 'Join the blocks with dashes.' },
]

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON string such as "1-23 45".') }
  if (typeof value !== 'string' || !/^[0-9 -]+$/.test(value)) throw new Error('Use only digits, spaces and dashes inside the string.')
  const digitCount = value.replace(/[ -]/g, '').length
  if (digitCount < 2 || digitCount > 100) throw new Error('Use between 2 and 100 digits.')
  return value
}

export function buildTrace(input) {
  const digits = input.replace(/[ -]/g, '')
  const blocks = []
  let cursor = 0
  const frames = [{ phase: 'start', activeLine: 2, message: `Keep ${digits.length} digits; separators are discarded.`, snapshot: { digits, cursor, blocks: [] } }]
  while (digits.length - cursor > 4) {
    const block = digits.slice(cursor, cursor + 3)
    frames.push({ phase: 'take', activeLine: 4, message: `${digits.length - cursor} digits remain, more than 4, so take three.`, snapshot: { digits, cursor, blocks: [...blocks] } })
    blocks.push(block)
    cursor += 3
    frames.push({ phase: 'take', activeLine: 5, message: `Add block "${block}"; the cursor moves to position ${cursor}.`, snapshot: { digits, cursor, blocks: [...blocks] } })
  }
  const rest = digits.length - cursor
  frames.push({ phase: 'finish', activeLine: 6, message: `${rest} digits remain, so the final group is handled without a lone digit.`, snapshot: { digits, cursor, blocks: [...blocks] } })
  const tail = rest === 4 ? [digits.slice(cursor, cursor + 2), digits.slice(cursor + 2)] : [digits.slice(cursor)]
  tail.forEach((block, index) => {
    blocks.push(block)
    frames.push({ phase: 'finish', activeLine: rest === 4 ? 8 : 10, message: rest === 4 ? `Four digits split into pairs; add "${block}".` : `Add the final block "${block}".`, snapshot: { digits, cursor: digits.length, blocks: [...blocks], part: index } })
  })
  const result = blocks.join('-')
  frames.push({ phase: 'done', activeLine: 11, message: `Return "${result}".`, snapshot: { digits, cursor: digits.length, blocks: [...blocks], result } })
  return { input, result, frames }
}

export const python = `def reformat_number(number):
    digits = "".join(ch for ch in number if ch in "0123456789")
    blocks = []
    i = 0
    while len(digits) - i > 4:
        blocks.append(digits[i:i + 3])
        i += 3
    rest = len(digits) - i
    if rest == 4:
        blocks += [digits[i:i + 2], digits[i + 2:]]
    else:
        blocks.append(digits[i:])
    return "-".join(blocks)`

export const code = [
  'FUNCTION reformatNumber(text)',
  '    digits = the digit characters of text',
  '    blocks = empty list; i = 0',
  '    WHILE remaining digits > 4',
  '        append digits[i .. i+3) to blocks; i = i + 3',
  '    rest = remaining digits',
  '    IF rest = 4',
  '        append two pairs of digits',
  '    ELSE',
  '        append the rest as one block',
  '    RETURN blocks joined by "-"',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode activeLine -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 6, 6: 8, 7: 9, 8: 10, 9: 11, 10: 12, 11: 13 }
