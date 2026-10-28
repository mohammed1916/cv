export function parseInput(text) {
  const input = JSON.parse(text)
  const { forbidden, a, b, x } = input ?? {}
  if (!Array.isArray(forbidden) || forbidden.length < 1 || forbidden.length > 10) throw new Error('forbidden is a list of 1 to 10 positions.')
  if (new Set(forbidden).size !== forbidden.length || forbidden.some(f => !Number.isInteger(f) || f < 1 || f > 30)) throw new Error('Forbidden positions are distinct integers from 1 to 30.')
  if (!Number.isInteger(a) || a < 1 || a > 20 || !Number.isInteger(b) || b < 1 || b > 20) throw new Error('a and b are integers from 1 to 20.')
  if (!Number.isInteger(x) || x < 1 || x > 30 || forbidden.includes(x)) throw new Error('x is a position from 1 to 30 that is not forbidden.')
  return { forbidden, a, b, x }
}

export function buildTrace(input) {
  const { forbidden, a, b, x } = input
  const blocked = new Set(forbidden)
  const limit = Math.max(x, ...forbidden) + a + b
  const key = (pos, back) => `${pos}:${back ? 'b' : 'f'}`
  const seen = new Set([key(0, false)])
  const queue = [{ pos: 0, back: false, steps: 0 }]
  const reached = [0]
  const frames = [{ phase: 'start', activeLine: L('set the start state'), current: 0, frontier: [0], visited: [0], steps: 0, message: 'Start at position 0 with no backward jump yet.' }]
  let answer = -1
  for (let head = 0; head < queue.length; head++) {
    const here = queue[head]
    if (here.pos === x) {
      answer = here.steps
      frames.push({ phase: 'found', activeLine: L('if here is the target position'), current: here.pos, frontier: queue.slice(head + 1).map(s => s.pos), visited: [...reached], steps: here.steps, message: `Reached ${x} after ${answer} jump(s).` })
      break
    }
    frames.push({ phase: 'pop', activeLine: L('take the next state'), current: here.pos, frontier: queue.slice(head + 1).map(s => s.pos), visited: [...reached], steps: here.steps, message: `At ${here.pos} after ${here.steps} jump(s)${here.back ? ', last jump backward' : ''}.` })
    const options = [{ pos: here.pos + a, back: false }]
    if (!here.back && here.pos - b >= 0) options.push({ pos: here.pos - b, back: true })
    for (const opt of options) {
      const k2 = key(opt.pos, opt.back)
      if (opt.pos <= limit && !blocked.has(opt.pos) && !seen.has(k2)) {
        seen.add(k2)
        queue.push({ pos: opt.pos, back: opt.back, steps: here.steps + 1 })
        if (!reached.includes(opt.pos)) reached.push(opt.pos)
      }
    }
  }
  if (answer === -1) frames.push({ phase: 'done', activeLine: L('return minus one when the queue'), current: null, frontier: [], visited: [...reached], steps: null, message: `${x} cannot be reached: -1.` })
  else frames.push({ phase: 'done', activeLine: L('return its jump count'), current: null, frontier: [], visited: [...reached], steps: answer, message: `Minimum jumps: ${answer}.` })
  return { input, limit, result: answer, frames }
}

export const code = `minimum number of jumps to reach position x, starting at 0
  set the start state to position zero, no backward jump yet, and zero jumps
  put the start state in a queue and mark it seen
  repeat while the queue is not empty
    take the next state and call it here
    if here is the target position then return its jump count
    forward option: jump a places forward if it stays within the limit and is not forbidden
    backward option: if the last jump was not backward, jump b places back if it is legal
    for each new state not seen yet, mark it seen and add it to the queue with one more jump
  return minus one when the queue is empty`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_jumps(forbidden, a, b, x):
    blocked = set(forbidden)
    limit = max([x] + forbidden) + a + b
    seen = {(0, False)}
    queue = [(0, False, 0)]
    head = 0
    while head < len(queue):
        pos, back, steps = queue[head]
        head += 1
        if pos == x:
            return steps
        options = [(pos + a, False)]
        if not back and pos - b >= 0:
            options.append((pos - b, True))
        for nxt, went_back in options:
            if nxt <= limit and nxt not in blocked and (nxt, went_back) not in seen:
                seen.add((nxt, went_back))
                queue.append((nxt, went_back, steps + 1))
    return -1
`
