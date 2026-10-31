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
  const frames = [{ phase: 'start', pythonLine: 2, line: 0, output: [], inBlock: false, activeLine: 2, message: 'Scan each line, tracking whether a block comment is open.' }]
  source.forEach((line, lineNo) => {
    let i = 0
    while (i < line.length) {
      if (inBlock) {
        if (line.startsWith('*/', i)) { inBlock = false; i += 2 }
        else i++
      } else if (line.startsWith('/*', i)) {
        inBlock = true; i += 2
        frames.push({ phase: 'block', pythonLine: 14, line: lineNo, output: [...out], inBlock, activeLine: 6, message: `Line ${lineNo}: block comment opens.` })
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
      frames.push({ phase: 'emit', pythonLine: 24, line: lineNo, output: [...out], inBlock, activeLine: 10, message: `Line ${lineNo} keeps "${current}".` })
    } else frames.push({ phase: 'drop', pythonLine: 23, line: lineNo, output: [...out], inBlock, activeLine: 11, message: `Line ${lineNo} is empty after removing comments: drop it.` })
    current = ''
  })
  frames.push({ phase: 'done', pythonLine: 26, line: source.length - 1, output: [...out], inBlock, result: out, activeLine: 13, message: `${out.length} line${out.length === 1 ? '' : 's'} of code remain.` })
  return { input: source, result: out, frames }
}

export const code = `set out to an empty list, block to closed, and cur to empty text
for each line in source
  set i to 0
  while i is less than the length of line
    if block is open, look for */; when found, close the block and skip two characters, otherwise skip one character
    otherwise if the text at i is /* then open the block and skip two characters
    otherwise if the text at i is // then stop reading this line
    otherwise append the character at i to cur and move i forward by one
  if block is still open then go on to the next line, keeping cur
  if cur is not empty then append cur to out
  otherwise drop this line because it is empty after removing comments
  set cur to empty text
return out`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def remove_comments(source):
    out, block = [], False
    cur = ''
    for line in source:
        i = 0
        while i < len(line):
            if block:
                if line.startswith('*/', i):
                    block = False
                    i += 2
                else:
                    i += 1
            elif line.startswith('/*', i):
                block = True
                i += 2
            elif line.startswith('//', i):
                break
            else:
                cur += line[i]
                i += 1
        if block:
            continue
        if cur:
            out.append(cur)
        cur = ''
    return out`
