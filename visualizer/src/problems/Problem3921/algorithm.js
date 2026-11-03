export const phases = [
  { id: 'start', label: 'Setup', description: 'Score and wickets begin at zero.' },
  { id: 'read', label: 'Read', description: 'Look at the next event token.' },
  { id: 'score', label: 'Runs', description: 'The token adds runs to the score.' },
  { id: 'wicket', label: 'Wicket', description: 'The token adds one to the wicket counter.' },
  { id: 'stop', label: 'Stop', description: 'Ten wickets end the innings early.' },
  { id: 'done', label: 'Result', description: 'Return the score and wicket count.' },
]

const RUN_TOKENS = new Set(['0', '1', '2', '3', '4', '6'])
const EXTRA_TOKENS = new Set(['WD', 'NB'])

export function parseInput(text) {
  const events = JSON.parse(text)
  if (!Array.isArray(events) || events.length < 1 || events.length > 30) throw new Error('Use a JSON array of 1 to 30 event tokens.')
  if (!events.every(t => typeof t === 'string' && (RUN_TOKENS.has(t) || EXTRA_TOKENS.has(t) || t === 'W'))) throw new Error('Tokens are 0, 1, 2, 3, 4, 6, WD, NB or W.')
  return { events }
}

export function buildTrace({ events }) {
  let score = 0
  let wickets = 0
  const frames = [{ phase: 'start', activeLine: L('let score be 0'), pythonLine: P('score = 0'), message: 'Start with zero runs and zero wickets.', index: -1, token: null, score, wickets, ignored: 0 }]
  let i = 0
  for (; i < events.length; i++) {
    const token = events[i]
    frames.push({ phase: 'read', activeLine: L('for each token in order'), pythonLine: P('for token in events'), message: `Read token ${token}.`, index: i, token, score, wickets, ignored: 0 })
    if (RUN_TOKENS.has(token)) {
      score += Number(token)
      frames.push({ phase: 'score', activeLine: L('add it to score'), pythonLine: P('score += int(token)'), message: `${token} adds ${token} run${token === '1' ? '' : 's'}.`, index: i, token, score, wickets, ignored: 0 })
    } else if (EXTRA_TOKENS.has(token)) {
      score += 1
      frames.push({ phase: 'score', activeLine: L('add one to score'), pythonLine: P('score += 1'), message: `${token} is an extra: one run, no ball faced.`, index: i, token, score, wickets, ignored: 0 })
    } else {
      wickets += 1
      frames.push({ phase: 'wicket', activeLine: L('else add one to wickets'), pythonLine: P('wickets += 1'), message: `W adds a wicket; the counter is at ${wickets} of 10.`, index: i, token, score, wickets, ignored: 0 })
    }
    if (wickets === 10) {
      const ignored = events.length - i - 1
      frames.push({ phase: 'stop', activeLine: L('stop reading'), pythonLine: P('if wickets == 10'), message: ignored ? `The tenth wicket ends the reading; ${ignored} later token${ignored === 1 ? ' is' : 's are'} ignored.` : 'The tenth wicket ends the reading at the final token.', index: i, token, score, wickets, ignored })
      break
    }
  }
  frames.push({ phase: 'done', activeLine: L('return [score'), pythonLine: P('return [score, wickets]'), message: `Result: score ${score}, wickets ${wickets}.`, index: Math.min(i, events.length - 1), token: null, score, wickets, ignored: 0 })
  return { input: { events }, result: [score, wickets], frames }
}

export const code = `validate the score and wickets
  let score be 0 and wickets be 0
  for each token in order
    if the token is a number then add it to score
    else if the token is WD or NB then add one to score
    else add one to wickets
    if wickets reached 10 then stop reading
  return [score, wickets]`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def score_validator(events):
    score = 0
    wickets = 0
    for token in events:
        if token in ("0", "1", "2", "3", "4", "6"):
            score += int(token)
        elif token in ("WD", "NB"):
            score += 1
        else:
            wickets += 1
        if wickets == 10:
            break
    return [score, wickets]`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
