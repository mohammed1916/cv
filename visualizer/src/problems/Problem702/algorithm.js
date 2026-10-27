const BEYOND = 2147483647 // what the reader returns past the end of the array

export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.arr) || spec.arr.length < 1 || spec.arr.length > 30) throw new Error('Use 1 to 30 sorted numbers.')
  if (spec.arr.some((v, i) => !Number.isInteger(v) || Math.abs(v) > 1000 || (i > 0 && v <= spec.arr[i - 1]))) {
    throw new Error('Numbers must be distinct, strictly increasing integers from -1000 to 1000.')
  }
  if (!Number.isInteger(spec.target) || Math.abs(spec.target) > 1000) throw new Error('target must be an integer from -1000 to 1000.')
  return spec
}

export const code = `search(reader, target):
  left, right = 0, 1
  while the reader value at right is less than target
    left = right
    right = right * 2
  while left is at most right
    mid = floor((left + right) / 2)
    value = reader value at mid
    if value equals target, return mid
    if value is less than target, set left = mid + 1
    otherwise set right = mid - 1
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(spec) {
  const { arr, target } = spec
  const reads = []
  let left = 0, right = 1
  const frames = [{ phase: 'start', activeLine: L('left, right = 0, 1'), probe: null, value: null, left, right, reads: [], result: null, message: `The size is unknown, so probe index 1 and keep doubling until the value reaches ${target}.` }]
  // `why` receives the value read, so the message can say what the reader's answer means.
  const read = (index, phase, line, why) => {
    const value = index < arr.length ? arr[index] : BEYOND
    reads.push(index)
    const shown = value === BEYOND ? 'past the end (the reader returns 2147483647)' : value
    frames.push({ phase, activeLine: line, probe: index, value, left, right, reads: [...reads], result: null, message: `Read index ${index}: ${shown}. ${why(value)}` })
    return value
  }
  const expanding = value => (value < target ? 'Still below the target, so double the probe.' : 'At or above the target: the answer lies left of this probe.')
  while (read(right, 'expand', L('while the reader value at right is less than target'), expanding) < target) {
    left = right
    right *= 2
  }
  let lo = left, hi = right
  let result = -1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    left = lo
    right = hi
    const value = read(mid, 'search', L('value = reader value at mid'), v => (v === target ? 'That is the target.' : v < target ? 'Too small: search the right half.' : 'Too large: search the left half.'))
    if (value === target) { result = mid; break }
    if (value < target) lo = mid + 1
    else hi = mid - 1
  }
  frames.push({ phase: 'done', activeLine: result === -1 ? L('return -1') : L('return mid'), probe: null, value: null, left: lo, right: hi, reads: [...reads], result, message: result === -1 ? `${target} is not in the array.` : `${target} is at index ${result}.` })
  return { input: spec, arr, result, reads, frames }
}

export const python = `BEYOND = 2147483647

def search_unknown_size(arr, target):
    def get(index):
        return arr[index] if index < len(arr) else BEYOND

    left, right = 0, 1
    while get(right) < target:
        left = right
        right *= 2
    while left <= right:
        mid = (left + right) // 2
        value = get(mid)
        if value == target:
            return mid
        if value < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
