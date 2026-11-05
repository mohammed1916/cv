// best[d] is the cheapest way to cover travel up to day d. On a day with no travel, nothing new is needed. On a
// travel day, the last pass bought must cover that day: a one-day pass from d - 1, a seven-day pass that reaches
// back to day d - 7, or a thirty-day pass that reaches back to day d - 30.
export const code = String.raw`function minCostTickets(days, costs) {
  const last = days[days.length - 1];
  const travel = new Set(days);
  const best = new Array(last + 1).fill(0); // best[d]: cheapest cover of the travel days up to day d
  for (let d = 1; d <= last; d++) {
    if (!travel.has(d)) {
      best[d] = best[d - 1]; // nothing to cover today
      continue;
    }
    best[d] = Math.min(
      best[d - 1] + costs[0], // a one-day pass for today
      best[Math.max(0, d - 7)] + costs[1], // a seven-day pass covering the last seven days
      best[Math.max(0, d - 30)] + costs[2], // a thirty-day pass covering the last thirty days
    );
  }
  return best[last];
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def min_cost_tickets(days, costs):
    last = days[-1]
    travel = set(days)
    best = [0] * (last + 1)  # best[d]: cheapest cover of the travel days up to day d
    for d in range(1, last + 1):
        if d not in travel:
            best[d] = best[d - 1]  # nothing to cover today
            continue
        best[d] = min(
            best[d - 1] + costs[0],  # a one-day pass for today
            best[max(0, d - 7)] + costs[1],  # a seven-day pass covering the last seven days
            best[max(0, d - 30)] + costs[2],  # a thirty-day pass covering the last thirty days
        )
    return best[last]`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'timeline', label: 'Timeline', description: 'Walk the calendar one day at a time and record the cheapest cost so far.' },
  { id: 'done', label: 'Total', description: 'The cheapest cost to cover the last travel day.' },
]

export const MAX_DAY = 60

export function parseInput(text) {
  const input = JSON.parse(text)
  const days = input && input.days
  const costs = input && input.costs
  if (!Array.isArray(days) || days.length < 1 || days.length > 20) throw new Error('Use days: a list of 1 to 20 travel days.')
  days.forEach((d, i) => {
    if (!Number.isInteger(d) || d < 1 || d > MAX_DAY) throw new Error(`Each day must be an integer from 1 to ${MAX_DAY} in this visual.`)
    if (i > 0 && d <= days[i - 1]) throw new Error('Days must be strictly increasing.')
  })
  if (!Array.isArray(costs) || costs.length !== 3 || costs.some(c => !Number.isInteger(c) || c < 1)) {
    throw new Error('costs must be three positive integers: one-day, seven-day and thirty-day passes.')
  }
  return { days, costs }
}

export function buildTrace({ days, costs }) {
  const last = days[days.length - 1]
  const travel = new Set(days)
  const best = new Array(last + 1).fill(0)
  const frames = []
  for (let d = 1; d <= last; d++) {
    if (!travel.has(d)) {
      best[d] = best[d - 1]
      frames.push({ phase: 'timeline', activeLine: L('nothing to cover today'), pythonLine: PY('nothing to cover today'), day: d, travel: false, options: null, choice: null, best: best.slice(0, d + 1), message: `Day ${d} is not a travel day, so the cost stays at ${best[d]}.` })
      continue
    }
    const options = [best[d - 1] + costs[0], best[Math.max(0, d - 7)] + costs[1], best[Math.max(0, d - 30)] + costs[2]]
    const choice = options.indexOf(Math.min(...options))
    best[d] = options[choice]
    const names = ['a one-day pass', 'a seven-day pass', 'a thirty-day pass']
    frames.push({ phase: 'timeline', activeLine: L('best[d] = Math.min('), pythonLine: PY('best[d] = min('), day: d, travel: true, options, choice, best: best.slice(0, d + 1),
      message: `Day ${d} is a travel day. The options are ${options.join(', ')}; ${names[choice]} is cheapest, so the cost is ${best[d]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best[last]'), pythonLine: PY('return best[last]'), day: last, travel: true, options: null, choice: null, best: best.slice(0, last + 1), message: `The cheapest cover of all travel days costs ${best[last]}.` })
  return { input: { days, costs }, result: best[last], frames }
}
