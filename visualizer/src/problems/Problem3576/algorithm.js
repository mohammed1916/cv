export const phases = [
  { id: 'target', label: 'Target', description: 'The array must end as all 1 or all -1. Try one.' },
  { id: 'compare', label: 'Compare', description: 'Check the leftmost entry that is not settled.' },
  { id: 'flip', label: 'Flip', description: 'Only the pair starting here can fix this entry.' },
  { id: 'check', label: 'Check', description: 'The last entry and the move count decide this target.' },
  { id: 'done', label: 'Result', description: 'Report whether either target worked.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums has 1 to 20 entries in this visualization.')
  if (nums.some(v => v !== 1 && v !== -1)) throw new Error('Each entry of nums is 1 or -1.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const attempts = []
  let result = false
  for (const target of [1, -1]) {
    const arr = [...nums]
    let flips = 0
    const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
      phase, activeLine, pythonLine, message, target, arr: [...arr], flips, k, at: -1, pair: null, attempts: attempts.map(a => ({ ...a })), ...extra,
    })
    push('target', L('copy the array'), P('arr = nums[:]'), `Try to make every entry ${target}. Start again from the original array with 0 moves.`)
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === target) {
        push('compare', L('if entry i differs'), P('if arr[i] != target'), `Index ${i} already holds ${target}. It stays settled, so move right.`, { at: i })
        continue
      }
      push('compare', L('if entry i differs'), P('if arr[i] != target'), `Index ${i} holds ${arr[i]}. Everything to its left is settled, so the only move left that changes it is the pair ${i} and ${i + 1}.`, { at: i, pair: [i, i + 1] })
      arr[i] *= -1
      arr[i + 1] *= -1
      flips++
      push('flip', L('negate entries i and i + 1'), P('flips += 1'), `Negate indices ${i} and ${i + 1}. Index ${i} is settled and index ${i + 1} now holds ${arr[i + 1]}. Moves used: ${flips}.`, { at: i, pair: [i, i + 1] })
    }
    const last = arr.length - 1
    const lastOk = arr[last] === target
    const ok = lastOk && flips <= k
    const reason = !lastOk
      ? `The last entry is ${arr[last]}, and no index is left to fix it. All ${target} cannot be reached.`
      : flips > k
        ? `Every entry is ${target}, but that took ${flips} moves and only ${k} are allowed.`
        : `Every entry is ${target}, using ${flips} move${flips === 1 ? '' : 's'}, within the limit of ${k}.`
    attempts.push({ target, flips, lastOk, ok })
    push('check', L('succeed if the last entry'), P('if arr[-1] == target'), reason, { at: last })
    if (ok) {
      result = true
      push('done', L('succeed if the last entry'), P('return True'), `Target ${target} works, so the answer is true.`, { result: true })
      break
    }
  }
  if (!result) frames.push({ ...frames.at(-1), phase: 'done', activeLine: L('otherwise report false'), pythonLine: P('return False'), message: 'Neither target works within the limit, so the answer is false.', at: -1, pair: null, attempts: attempts.map(a => ({ ...a })), result: false })
  return { input: { nums, k }, result, frames }
}

export const code = `can the array become all equal in at most k moves
  for each target in 1 and -1
    copy the array and set moves to 0
    for i from the first index to the second last
      if entry i differs from the target
        negate entries i and i + 1
        count one move
    succeed if the last entry matches and moves is at most k
  otherwise report false`.split('\n').map((text, index) => ({ line: index + 1, text }))
function L(s) {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def can_make_equal(nums, k):
    for target in (1, -1):
        arr = nums[:]
        flips = 0
        for i in range(len(arr) - 1):
            if arr[i] != target:
                arr[i] *= -1
                arr[i + 1] *= -1
                flips += 1
        if arr[-1] == target and flips <= k:
            return True
    return False
`
function P(s) {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
