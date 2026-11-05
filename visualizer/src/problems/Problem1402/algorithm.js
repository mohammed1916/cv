export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no dishes chosen and a best total of zero.' },
  { id: 'sort', label: 'Sort', description: 'Order the dishes from highest to lowest satisfaction.' },
  { id: 'add', label: 'Keep a dish', description: 'Keep the next dish while the running sum stays non-negative, and add the running sum to the total.' },
  { id: 'stop', label: 'Stop', description: 'A negative running sum would lower the total, so the remaining dishes are left out.' },
  { id: 'done', label: 'Complete', description: 'Return the best total found.' },
]

export function parseInput(text) {
  const satisfaction = JSON.parse(text)
  if (!Array.isArray(satisfaction) || satisfaction.length < 1 || satisfaction.length > 16 || !satisfaction.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) {
    throw new Error('Use a JSON array of 1 to 16 integers from -100 to 100, such as [4, -2, 6, -1].')
  }
  return satisfaction
}

export function buildTrace(satisfaction) {
  const sorted = [...satisfaction].sort((a, b) => b - a)
  const kept = []
  let running = 0
  let total = 0
  const snap = (index, extra = {}) => ({ sorted, index, running, total, kept: [...kept], ...extra })
  const frames = [{
    phase: 'start', activeLine: L('total = 0'), pythonLine: PY('total = 0'), snapshot: snap(null),
    message: `Dishes ${satisfaction.join(', ')}. Choosing none gives 0, so the best total starts at 0.`,
  }]
  frames.push({
    phase: 'sort', activeLine: L('sort'), pythonLine: PY('sorted('), snapshot: snap(null),
    message: `Sorted from highest to lowest: ${sorted.join(', ')}. The chosen dishes are always a prefix of this list.`,
  })
  for (let i = 0; i < sorted.length; i++) {
    running += sorted[i]
    if (running < 0) {
      frames.push({
        phase: 'stop', activeLine: L('running < 0'), pythonLine: PY('if running < 0'), snapshot: snap(i),
        message: `Adding ${sorted[i]} makes the running sum ${running}. A negative running sum lowers the total, so this dish and the rest are left out.`,
      })
      break
    }
    kept.push(sorted[i])
    total += running
    frames.push({
      phase: 'add', activeLine: L('total += running'), pythonLine: PY('total += running'), snapshot: snap(i),
      message: `Keep ${sorted[i]}. The running sum is ${running}, so the total grows by ${running} to ${total}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return total'), pythonLine: PY('return total'), snapshot: snap(null),
    message: `Best total ${total}. Cook the chosen dishes in ascending satisfaction: ${[...kept].reverse().join(', ') || 'none'}.`,
  })
  return { input: satisfaction, result: total, frames }
}

export const code = `function maxSatisfaction(satisfaction) {
  const sorted = [...satisfaction].sort((a, b) => b - a)
  let total = 0
  let running = 0
  for (const value of sorted) {
    running += value
    if (running < 0) break
    total += running
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_satisfaction(satisfaction):
    total = 0
    running = 0
    for value in sorted(satisfaction, reverse=True):
        running += value
        if running < 0:
            break
        total += running
    return total
`
const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1
