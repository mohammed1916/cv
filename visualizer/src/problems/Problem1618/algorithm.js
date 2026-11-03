// Stand-in metric for the visualization only: narrow letters use 2 units, other characters 3 units,
// and the glyph width is ceil(size * units / 4). Height is the font size. Both grow with size.
const NARROW = new Set('ilj ftr')
const widthOf = (size, ch) => Math.ceil((size * (NARROW.has(ch) ? 2 : 3)) / 4)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with text, sizes, w and h.')
  const { text: sentence, sizes, w, h } = input
  if (typeof sentence !== 'string' || sentence.length < 1 || sentence.length > 20 || !/^[a-z ]+$/.test(sentence)) throw new Error('text has 1 to 20 lowercase letters or spaces.')
  if (!Array.isArray(sizes) || sizes.length < 1 || sizes.length > 10) throw new Error('sizes has 1 to 10 font sizes.')
  if (!sizes.every((s, i) => Number.isInteger(s) && s >= 1 && s <= 40 && (i === 0 || s > sizes[i - 1]))) throw new Error('sizes is strictly increasing integers from 1 to 40.')
  if (!Number.isInteger(w) || w < 1 || w > 200) throw new Error('w is an integer from 1 to 200.')
  if (!Number.isInteger(h) || h < 1 || h > 200) throw new Error('h is an integer from 1 to 200.')
  return { text: sentence, sizes, w, h }
}

export function buildTrace({ text, sizes, w, h }) {
  const frames = []
  const push = f => frames.push({ lo, hi, mid: -1, size: null, widths: [], total: null, verdict: null, ans, ...f })
  let lo = 0
  let hi = sizes.length - 1
  let ans = -1
  push({ phase: 'start', activeLine: L('set lo to'), pythonLine: P('lo, hi = 0'), message: `Search the ${sizes.length} sizes; no answer yet.` })
  while (lo <= hi) {
    push({ phase: 'loop', activeLine: L('while lo is at most hi'), pythonLine: P('while lo <= hi'), lo, hi, message: `Range is indices ${lo} to ${hi}.` })
    const mid = Math.floor((lo + hi) / 2)
    const size = sizes[mid]
    push({ phase: 'mid', activeLine: L('mid is the middle'), pythonLine: P('mid = (lo'), lo, hi, mid, size, message: `Try font size ${size} at index ${mid}.` })
    const widths = [...text].map(ch => widthOf(size, ch))
    const total = widths.reduce((a, b) => a + b, 0)
    push({ phase: 'measure', activeLine: L('total is the sum'), pythonLine: P('total = sum'), lo, hi, mid, size, widths, total, ans, message: `Widths add to ${total} against the width ${w}; height ${size} against ${h}.` })
    const fits = total <= w && size <= h
    if (fits) {
      ans = mid
      lo = mid + 1
      push({ phase: 'fit', activeLine: L('if total is at most'), pythonLine: P('if total <= w'), lo, hi, mid, size, widths, total, verdict: 'fit', ans, message: `Size ${size} fits; try larger sizes.` })
    } else {
      hi = mid - 1
      push({ phase: 'miss', activeLine: L('else hi moves'), pythonLine: P('hi = mid - 1'), lo, hi, mid, size, widths, total, verdict: 'miss', ans, message: total > w ? `Too wide by ${total - w}; try smaller sizes.` : `Too tall; try smaller sizes.` })
    }
  }
  const result = ans === -1 ? -1 : sizes[ans]
  push({ phase: 'done', activeLine: L('return sizes'), pythonLine: P('return sizes'), ans, message: result === -1 ? 'No size fits; return -1.' : `Largest fitting size is ${result}.` })
  return { input: { text, sizes, w, h }, result, frames }
}

function locate(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing text: ${text}`)
  return index + 1
}

export const code = `find the largest font size that fits the text on the screen
  set lo to the first index and hi to the last index of sizes; ans is -1
  while lo is at most hi
    mid is the middle index and size is sizes at mid
    total is the sum of the widths of every character at size
    if total is at most w and the height at size is at most h then ans is mid and lo moves past mid
    else hi moves below mid
  return sizes at ans, or -1 when ans is -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

const lines = code.map(c => c.text)
const L = s => {
  const index = lines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => locate(python.split('\n'), s)

export const python = `class FontInfo:
    NARROW = set('ilj ftr')

    def get_width(self, font_size, ch):
        units = 2 if ch in self.NARROW else 3
        return (font_size * units + 3) // 4

    def get_height(self, font_size):
        return font_size


def max_font_size(text, sizes, w, h, font):
    lo, hi = 0, len(sizes) - 1
    ans = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        size = sizes[mid]
        total = sum(font.get_width(size, ch) for ch in text)
        if total <= w and font.get_height(size) <= h:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return sizes[ans] if ans != -1 else -1
`
