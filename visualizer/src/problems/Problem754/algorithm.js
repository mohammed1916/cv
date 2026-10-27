export const code = `function reachNumber(target):
  goal = absolute value of target
  k = 0
  total = 0
  while total is below goal or total minus goal is odd:
    k = k + 1
    total = total + k
  return k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reach_number(target):
    target = abs(target)
    k = 0
    total = 0
    while total < target or (total - target) % 2 != 0:
        k += 1
        total += k
    return k`

export function parseInput(text) {
  const t = JSON.parse(text)
  if (!Number.isInteger(t) || t === 0) throw new Error('Enter a single non-zero integer target.')
  if (Math.abs(t) > 20000) throw new Error('Visualization cap: |target| must be at most 20,000.')
  return t
}

export function buildTrace(target) {
  const goal = Math.abs(target)
  const sums = [0]
  const frames = [{ phase: 'start', activeLine: L('goal = absolute'), k: 0, total: 0, goal, message: `Moving left or right is symmetric, so aim for |target| = ${goal}. Step i moves exactly i units.` }]
  let k = 0, total = 0
  while (true) {
    const diff = total - goal
    const reached = total >= goal
    const parityOk = diff % 2 === 0
    frames.push({ phase: 'check', activeLine: L('while total'), k, total, goal, reached, parityOk, sums: [...sums],
      message: !reached ? `Sum ${total} is still below ${goal}; take another step.` : parityOk ? `Sum ${total} reaches ${goal} and the overshoot ${diff} is even, so some step of size ${diff / 2} can be flipped to go backwards.` : `Sum ${total} overshoots by ${diff}, which is odd: flipping a step changes the sum by an even amount, so it cannot be fixed. Keep going.` })
    if (reached && parityOk) break
    k++; total += k; sums.push(total)
    frames.push({ phase: 'step', activeLine: L('total = total + k'), k, total, goal, sums: [...sums], message: `Step ${k}: add ${k}. The running sum is ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return k'), k, total, goal, sums: [...sums], message: `Answer: ${k} moves. Overshoot ${total - goal} is even, so flip the step of size ${(total - goal) / 2 || 'none needed'}.` })
  return { input: target, result: k, frames }
}
