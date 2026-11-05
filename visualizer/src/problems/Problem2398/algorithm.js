export function parseInput(text) {
  const input = JSON.parse(text)
  const charge = input?.charge_times
  const running = input?.running_costs
  if (!Array.isArray(charge) || !Array.isArray(running) || charge.length !== running.length) throw new Error('Give charge_times and running_costs as arrays of the same length.')
  if (charge.length < 1 || charge.length > 12) throw new Error('Use 1 to 12 robots so the trace stays readable.')
  if (charge.some((v, i) => !Number.isInteger(v) || v < 1 || v > 100 || !Number.isInteger(running[i]) || running[i] < 1 || running[i] > 100)) throw new Error('Each charge time and running cost is an integer from 1 to 100.')
  if (!Number.isInteger(input.budget) || input.budget < 1 || input.budget > 1000) throw new Error('budget is an integer from 1 to 1000.')
  return { charge_times: charge, running_costs: running, budget: input.budget }
}

export function buildTrace({ charge_times: charge, running_costs: running, budget }) {
  const n = charge.length
  const frames = [{ phase: 'start', activeLine: L('let best = 0'), pythonLine: P(`best = 0`), l: 0, r: -1, deque: [], best: 0, cost: 0, message: `Find the longest run of robots whose max charge plus length times running total stays within ${budget}.` }]
  const deque = []
  let l = 0, sum = 0, best = 0
  for (let r = 0; r < n; r++) {
    sum += running[r]
    while (deque.length && charge[deque[deque.length - 1]] <= charge[r]) deque.pop()
    deque.push(r)
    frames.push({ phase: 'extend', activeLine: L('runningTotal += runningCosts[right]'), pythonLine: P(`running_total += running_costs[right]`), l, r, deque: [...deque], best, cost: charge[deque[0]] + (r - l + 1) * sum, message: `Add robot ${r}. The window ${l} to ${r} has running total ${sum}.` })
    while (l <= r && charge[deque[0]] + (r - l + 1) * sum > budget) {
      sum -= running[l]
      if (deque[0] === l) deque.shift()
      l++
      frames.push({ phase: 'shrink', activeLine: L('runningTotal -= runningCosts[left]'), pythonLine: P(`running_total -= running_costs[left]`), l, r, deque: [...deque], best, cost: l <= r ? charge[deque[0]] + (r - l + 1) * sum : 0, message: `Drop robot ${l - 1} from the left. The window is now ${l} to ${r}.` })
    }
    best = Math.max(best, r - l + 1)
    frames.push({ phase: 'record', activeLine: L('best = Math.max'), pythonLine: P(`best = max(best, right - left + 1)`), l, r, deque: [...deque], best, cost: l <= r ? charge[deque[0]] + (r - l + 1) * sum : 0, message: `Best window size is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P(`return best`), l, r: n - 1, deque: [], best, cost: 0, message: `The most robots that fit the budget is ${best}.` })
  return { input: { charge_times: charge, running_costs: running, budget }, result: best, frames }
}

export const code = `function maximumRobots(chargeTimes, runningCosts, budget) {
  let best = 0
  let left = 0
  let runningTotal = 0
  const deque = [] // robot indices whose charge times decrease from front to back
  for (let right = 0; right < chargeTimes.length; right++) {
    runningTotal += runningCosts[right]
    while (deque.length && chargeTimes[deque[deque.length - 1]] <= chargeTimes[right]) deque.pop()
    deque.push(right)
    while (left <= right && chargeTimes[deque[0]] + (right - left + 1) * runningTotal > budget) {
      runningTotal -= runningCosts[left]
      if (deque[0] === left) deque.shift()
      left++
    }
    best = Math.max(best, right - left + 1)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `from collections import deque

def maximum_robots(charge_times, running_costs, budget):
    best = 0
    left = 0
    running_total = 0
    window = deque()
    for right in range(len(charge_times)):
        running_total += running_costs[right]
        while window and charge_times[window[-1]] <= charge_times[right]:
            window.pop()
        window.append(right)
        while left <= right and charge_times[window[0]] + (right - left + 1) * running_total > budget:
            running_total -= running_costs[left]
            if window[0] == left:
                window.popleft()
            left += 1
        best = max(best, right - left + 1)
    return best
`
