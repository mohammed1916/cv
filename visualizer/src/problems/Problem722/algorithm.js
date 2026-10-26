export function parseInput(text) {
  const source = JSON.parse(text)
  if (!Array.isArray(source) || source.length < 1 || source.length > 100 || source.some(line => typeof line !== 'string' || line.length > 80)) throw new Error('Enter a JSON array of 1–100 source lines, each up to 80 characters.')
  return source
}

// Scan characters: "//" drops the rest of the line; "/*" drops until "*/" (possibly across lines).
// Lines that end up empty after removing comments are not emitted.
export function buildTrace(source) {
  const out = []
  let current = ''
  let inBlock = false
  const frames = [{ phase: 'start', line: 0, output: [], inBlock: false, activeLine: 2, message: 'Scan each line, tracking whether a block comment is open.' }]
  source.forEach((line, lineNo) => {
    let i = 0
    while (i < line.length) {
      if (inBlock) {
        if (line.startsWith('*/', i)) { inBlock = false; i += 2 }
        else i++
      } else if (line.startsWith('/*', i)) {
        inBlock = true; i += 2
        frames.push({ phase: 'block', line: lineNo, output: [...out], inBlock, activeLine: 6, message: `Line ${lineNo}: block comment opens.` })
      } else if (line.startsWith('//', i)) {
        break
      } else {
        current += line[i]
        i++
      }
    }
    // A block comment can span lines, so the partial line carries over until the block closes.
    if (inBlock) return
    if (current.length) {
      out.push(current)
      frames.push({ phase: 'emit', line: lineNo, output: [...out], inBlock, activeLine: 10, message: `Line ${lineNo} keeps "${current}".` })
    } else frames.push({ phase: 'drop', line: lineNo, output: [...out], inBlock, activeLine: 11, message: `Line ${lineNo} is empty after removing comments: drop it.` })
    current = ''
  })
  frames.push({ phase: 'done', line: source.length - 1, output: [...out], inBlock, result: out, activeLine: 13, message: `${out.length} line${out.length === 1 ? '' : 's'} of code remain.` })
  return { input: source, result: out, frames }
}

export const code = `def removeComments(source):
    out, block = [], False
    cur = ''
    for line in source:
        i = 0
        while i < len(line):
            ...  # '*/' ends a block, '/*' starts one, '//' ends the line
        if not block and cur: out.append(cur)
        cur = ''
    return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
