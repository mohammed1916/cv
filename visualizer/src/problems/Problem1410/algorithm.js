export const phases = [
  { id: 'start', label: 'Start', description: 'Read the text once from left to right, beginning with an empty output.' },
  { id: 'inspect', label: 'Check position', description: 'Test whether one of the six supported entities begins exactly at this position of the original text.' },
  { id: 'update', label: 'Emit and advance', description: 'Write the decoded or literal character, then skip past exactly the characters that were consumed.' },
  { id: 'done', label: 'Complete', description: 'The output is complete. No written character is ever examined again.' },
]

const ENTITIES = { '&quot;': '"', '&apos;': "'", '&amp;': '&', '&gt;': '>', '&lt;': '<', '&frasl;': '/' }
const NAMES = Object.keys(ENTITIES)

export function parseInput(text) {
  if (text.length < 1 || text.length > 100) throw new Error('Enter between 1 and 100 characters of text.')
  return text
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(text) {
  const out = []
  let i = 0
  const frames = [{
    phase: 'start', activeLine: L('let output'), pythonLine: P('out = []'),
    snapshot: { text, span: null, emitted: '' },
    message: `Read ${text.length} characters once. The output is empty and the scan starts at position 0.`,
  }]
  while (i < text.length) {
    const name = NAMES.find(e => text.startsWith(e, i)) ?? null
    const end = name ? i + name.length : i + 1
    frames.push({
      phase: 'inspect', activeLine: L('const entity = Object'), pythonLine: P('entity = next'),
      snapshot: { text, span: [i, end], emitted: out.join('') },
      message: name
        ? `Position ${i}: ${name} is a supported entity here, so it decodes to ${ENTITIES[name]}.`
        : `Position ${i}: no supported entity starts here, so "${text[i]}" is copied unchanged.`,
    })
    out.push(name ? ENTITIES[name] : text[i])
    const start = i
    i = end
    frames.push({
      phase: 'update',
      activeLine: name ? L('output += ENTITIES[entity]') : L('output += text[i]'),
      pythonLine: name ? P('out.append(ENTITIES') : P('out.append(text[i])'),
      snapshot: { text, span: [start, end], emitted: out.join('') },
      message: name
        ? `Write ${ENTITIES[name]} and skip the ${name.length} characters of ${name}. Nothing written is scanned again.`
        : `Write "${text[end - 1]}" and move one character forward.`,
    })
  }
  const result = out.join('')
  frames.push({
    phase: 'done', activeLine: L('return output'), pythonLine: P('return "".join'),
    snapshot: { text, span: null, emitted: result },
    message: `Decoded output: ${JSON.stringify(result)}.`,
  })
  return { input: text, result, frames }
}

export const code = `const ENTITIES = { '&quot;': '"', '&apos;': "'", '&amp;': '&', '&gt;': '>', '&lt;': '<', '&frasl;': '/' }

function entityParser(text) {
  let output = ''
  let i = 0
  while (i < text.length) {
    const entity = Object.keys(ENTITIES).find(e => text.startsWith(e, i))
    if (entity) {
      output += ENTITIES[entity]
      i += entity.length
    } else {
      output += text[i]
      i += 1
    }
  }
  return output
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `ENTITIES = {"&quot;": '"', "&apos;": "'", "&amp;": "&", "&gt;": ">", "&lt;": "<", "&frasl;": "/"}

def decode_once(text):
    out = []
    i = 0
    while i < len(text):
        entity = next((e for e in ENTITIES if text.startswith(e, i)), None)
        if entity is not None:
            out.append(ENTITIES[entity])
            i += len(entity)
        else:
            out.append(text[i])
            i += 1
    return "".join(out)
`
