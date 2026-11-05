// A window [l, r] stays turbulent while each neighbouring comparison points the opposite way to the one before.
// A repeated direction starts a new window at the previous element, and an equal pair starts a new window at r.
export const code = String.raw`function longestTurbulent(arr) {
  let l = 0; // left edge of the current turbulent window
  let best = 1; // a single value is always turbulent
  let previous = 0; // direction of the last comparison inside the window: 1 rising, -1 falling, 0 none
  for (let r = 1; r < arr.length; r++) {
    const sign = Math.sign(arr[r] - arr[r - 1]);
    if (sign === 0) {
      l = r; // equal neighbours cannot be part of a turbulent window
      previous = 0;
    } else if (previous === sign) {
      l = r - 1; // two rises or two falls in a row: restart the window at the earlier value
      previous = sign;
    } else {
      previous = sign; // the direction flipped, so the window keeps growing
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def longest_turbulent(arr):
    l = 0  # left edge of the current turbulent window
    best = 1  # a single value is always turbulent
    previous = 0  # direction of the last comparison inside the window: 1 rising, -1 falling, 0 none
    for r in range(1, len(arr)):
        sign = (arr[r] > arr[r - 1]) - (arr[r] < arr[r - 1])
        if sign == 0:
            l = r  # equal neighbours cannot be part of a turbulent window
            previous = 0
        elif previous == sign:
            l = r - 1  # two rises or two falls in a row: restart the window at the earlier value
            previous = sign
        else:
            previous = sign  # the direction flipped, so the window keeps growing
        best = max(best, r - l + 1)
    return best`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Window', description: 'Extend the window while the comparisons keep alternating.' },
  { id: 'done', label: 'Longest', description: 'The longest window seen.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const arr = input && input.arr
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 16) throw new Error('Use arr: a list of 1 to 16 integers.')
  if (arr.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('Values must be integers from 0 to 99.')
  return { arr }
}

export function buildTrace({ arr }) {
  let l = 0
  let best = 1
  let previous = 0
  const frames = []
  for (let r = 1; r < arr.length; r++) {
    const sign = Math.sign(arr[r] - arr[r - 1])
    const branch = sign === 0 ? 'equal' : previous === sign ? 'repeat' : 'flip'
    let message
    if (branch === 'equal') {
      l = r
      previous = 0
      message = `${arr[r - 1]} and ${arr[r]} are equal, so the window restarts at position ${r}.`
    } else if (branch === 'repeat') {
      l = r - 1
      previous = sign
      message = `${arr[r - 1]} then ${arr[r]} moves the same way twice, so the window restarts at position ${r - 1}.`
    } else {
      previous = sign
      message = `${arr[r - 1]} then ${arr[r]} ${sign > 0 ? 'rises' : 'falls'}, which flips the direction. The window grows to ${r - l + 1}.`
    }
    best = Math.max(best, r - l + 1)
    const lines = { equal: ['l = r; // equal', 'l = r  #'], repeat: ['l = r - 1;', 'l = r - 1  #'], flip: ['the direction flipped', 'the direction flipped'] }[branch]
    frames.push({ phase: 'scan', activeLine: L(lines[0]), pythonLine: PY(lines[1]), l, r, sign, best, message })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: PY('return best'), l: null, r: null, sign: 0, best, message: `The longest turbulent subarray has length ${best}.` })
  return { input: { arr }, result: best, frames }
}
