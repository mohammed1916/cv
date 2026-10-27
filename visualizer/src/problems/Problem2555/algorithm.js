export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.prize_positions) || !Number.isInteger(input.k)) throw new Error('Use an object with a sorted integer array prize_positions and an integer k.')
  if (input.prize_positions.length < 1 || input.prize_positions.length > 40) throw new Error('prize_positions must have 1 to 40 entries.')
  if (input.prize_positions.some(v => !Number.isInteger(v) || v < 0 || v > 50)) throw new Error('Each prize position is an integer from 0 to 50.')
  if (input.prize_positions.some((v, i) => i > 0 && v < input.prize_positions[i - 1])) throw new Error('prize_positions must be sorted in non-decreasing order.')
  if (input.k < 0 || input.k > 50) throw new Error('k must be an integer from 0 to 50.')
  return { prize_positions: input.prize_positions, k: input.k }
}

export function buildTrace({ prize_positions: pos, k }) {
  const n = pos.length
  const best = new Array(n).fill(0)
  const frames = []
  let left = 0
  let answer = 0
  frames.push({ phase: 'start', activeLine: L('set best to'), left: 0, right: -1, covered: 0, before: 0, answer, message: `Each segment spans positions up to ${k} apart. Prizes are sorted, so windows are contiguous.` })
  for (let right = 0; right < n; right++) {
    while (pos[right] - pos[left] > k) left++
    frames.push({ phase: 'slide', activeLine: L('while the prize at right'), left, right, covered: 0, before: 0, answer, message: `The first segment for prize ${right} starts at prize ${left}.` })
    const covered = right - left + 1
    const before = left > 0 ? best[left - 1] : 0
    answer = Math.max(answer, covered + before)
    best[right] = Math.max(right > 0 ? best[right - 1] : 0, covered)
    frames.push({ phase: 'record', activeLine: L('set answer to the larger'), left, right, covered, before, answer, message: `This segment covers ${covered} prizes. Best segment ending before it covers ${before}. Total ${covered + before}; best answer ${answer}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), left, right: n - 1, covered: 0, before: 0, answer, message: `Most prizes covered by two segments: ${answer}.` })
  return { input: { prize_positions: pos, k }, result: answer, frames }
}

export const code = `maximize win from two segments (prize_positions, k):
  set n to the length of prize_positions
  set best to n zeros
  set left to 0 and answer to 0
  for each position right in prize_positions
    while the prize at right is more than k past the prize at left, move left forward
    set covered to right minus left plus 1
    set answer to the larger of answer and covered plus the best value before left
    set best at right to the larger of the best value before right and covered
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_win(prize_positions, k):
    n = len(prize_positions)
    best = [0] * n
    left = 0
    answer = 0
    for right in range(n):
        while prize_positions[right] - prize_positions[left] > k:
            left += 1
        covered = right - left + 1
        before = best[left - 1] if left > 0 else 0
        answer = max(answer, covered + before)
        best[right] = max(best[right - 1] if right > 0 else 0, covered)
    return answer
`
