export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || input.n < 2 || input.n > 6) throw new Error('n is an integer from 2 to 6 philosophers.')
  if (!Array.isArray(input.events) || input.events.length < 1 || input.events.length > 20) throw new Error('events is a list of 1 to 20 entries.')
  for (const e of input.events) {
    if (!Array.isArray(e) || (e[0] !== 'hungry' && e[0] !== 'finish') || !Number.isInteger(e[1]) || e[1] < 0 || e[1] >= input.n) {
      throw new Error('Use ["hungry", p] or ["finish", p] with p between 0 and n minus 1.')
    }
  }
  return input
}

export function buildTrace({ n, events }) {
  const holder = Array(n).fill(null)
  const eating = new Set()
  const log = []
  const forksLabel = () => holder.map((h, f) => `fork ${f}: ${h === null ? 'free' : `held by ${h}`}`)
  const frames = [{ phase: 'start', pythonLine: PL('holding = [None]'), activeLine: L('start with all forks free'), state: forksLabel(), message: 'All forks are on the table.' }]
  for (const [kind, p] of events) {
    const right = (p + 1) % n
    if (kind === 'hungry') {
      const [first, second] = [p, right].sort((a, b) => a - b)
      if (holder[first] === null && holder[second] === null) {
        holder[first] = p
        holder[second] = p
        eating.add(p)
        log.push(`${p} eats`)
        frames.push({ phase: 'eat', pythonLine: PL('holding[first] = holding[second] = p'), activeLine: L('if both forks are free'), state: forksLabel(), message: `${p} takes forks ${first} and ${second} in order, then eats.` })
      } else {
        log.push(`${p} waits`)
        frames.push({ phase: 'wait', pythonLine: PL('log.append(f"{p} waits")'), activeLine: L('otherwise wait'), state: forksLabel(), message: `${p} waits: a neighbouring fork is taken.` })
      }
    } else {
      if (!eating.has(p)) throw new Error(`Philosopher ${p} is not eating, so there is nothing to finish.`)
      holder[p] = null
      holder[right] = null
      eating.delete(p)
      log.push(`${p} thinks`)
      frames.push({ phase: 'finish', pythonLine: PL('holding[p] = holding[right] = None'), activeLine: L('when finished put both forks down'), state: forksLabel(), message: `${p} puts both forks down.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return log'), activeLine: L('return the log'), state: forksLabel(), message: 'The event list is finished.' })
  return { input: { n, events }, result: log, frames }
}

export const code = `dining philosophers with ordered fork pickup
  start with all forks free
  for each event in order
    if a philosopher becomes hungry
      pick up the lower numbered fork first, then the higher one
      if both forks are free then eat
      otherwise wait
    if a philosopher finishes
      when finished put both forks down
  return the log`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def dine(n, events):
    holding = [None] * n
    eating = set()
    log = []
    for kind, p in events:
        right = (p + 1) % n
        if kind == "hungry":
            first, second = sorted((p, right))
            if holding[first] is None and holding[second] is None:
                holding[first] = holding[second] = p
                eating.add(p)
                log.append(f"{p} eats")
            else:
                log.append(f"{p} waits")
        else:
            holding[p] = holding[right] = None
            eating.discard(p)
            log.append(f"{p} thinks")
    return log
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
