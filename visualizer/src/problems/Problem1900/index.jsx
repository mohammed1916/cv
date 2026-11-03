import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'play(row, round) where row lists the alive players in order',
  '  pair the outermost players: row[i] with row[m - 1 - i]',
  '  if the two chosen players share a pair, record this round',
  '  for each choice of winner in every pair',
  '    keep the winners and the middle player in row order',
  '    play(next row, round + 1)',
  'return the earliest and latest recorded rounds',
].map((text, index) => ({ line: index + 1, text }))

const python = `from itertools import product

def earliest_and_latest(n, first, second):
    found = []
    def play(players, round_no):
        m = len(players)
        k = m // 2
        for i in range(k):
            if {players[i], players[m - 1 - i]} == {first, second}:
                found.append(round_no)
                return
        for picks in product(*[(i, m - 1 - i) for i in range(k)]):
            kept = sorted(list(picks) + ([k] if m % 2 else []))
            play([players[i] for i in kept], round_no + 1)
    play(list(range(1, n + 1)), 1)
    return [min(found), max(found)]
`

const PY = { play: 5, pair: 8, meet: 10, choose: 13, next: 14, done: 16 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.n) || input.n < 2 || input.n > 8) throw new Error('n is an integer from 2 to 8.')
  const { first, second } = input
  if (!Number.isInteger(first) || !Number.isInteger(second) || first < 1 || second < 1 || first > input.n || second > input.n || first === second) throw new Error('first and second are different players from 1 to n.')
  return { n: input.n, first, second }
}

export function build({ n, first, second }) {
  const frames = []
  const found = []
  const push = (phase, line, pythonLine, message, row, pairs, round) => frames.push({ phase, activeLine: line, pythonLine, message, row: [...row], pairs, round, first, second })
  const play = (row, round) => {
    const m = row.length, k = Math.floor(m / 2)
    const pairs = Array.from({ length: k }, (_, i) => [row[i], row[m - 1 - i]])
    push('round', 2, PY.pair, `Round ${round}: ${pairs.map(p => `${p[0]} vs ${p[1]}`).join(', ') || 'no pairs'}.`, row, pairs, round)
    const meet = pairs.some(([a, b]) => (a === first && b === second) || (a === second && b === first))
    if (meet) {
      found.push(round)
      push('meet', 3, PY.meet, `Players ${first} and ${second} meet in round ${round}.`, row, pairs, round)
      return
    }
    const choices = Array.from({ length: k }, (_, i) => [i, m - 1 - i])
    const total = 2 ** k
    for (let mask = 0; mask < total; mask++) {
      const kept = choices.map((pair, bit) => pair[(mask >> bit) & 1])
      if (m % 2) kept.push(k)
      kept.sort((a, b) => a - b)
      const next = kept.map(i => row[i])
      push('choose', 4, PY.choose, `Round ${round}: next row is ${next.join(', ')}.`, row, pairs, round)
      play(next, round + 1)
    }
  }
  play(Array.from({ length: n }, (_, i) => i + 1), 1)
  push('done', 7, PY.done, `Earliest ${Math.min(...found)}, latest ${Math.max(...found)}.`, Array.from({ length: n }, (_, i) => i + 1), [], 0)
  return { input: { n, first, second }, result: [Math.min(...found), Math.max(...found)], frames }
}

const definition = {
  phases: [
    { id: 'round', label: 'Pair up', description: 'Pair players from the two ends.' },
    { id: 'choose', label: 'Choose winners', description: 'Try each legal winner set.' },
    { id: 'meet', label: 'Meet', description: 'The two chosen players are paired.' },
    { id: 'done', label: 'Result', description: 'Report earliest and latest rounds.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with n (2 to 8), first and second (player numbers)',
  url: 'https://leetcode.com/problems/the-earliest-and-latest-rounds-where-players-compete/',
  complexity: 'The search tries every winner set, two choices per pair per round. The sample is capped at 8 players, so the search stays tiny.',
  examples: [
    { label: 'Example', input: '{"n":5,"first":1,"second":3}' },
    { label: 'Pair', input: '{"n":4,"first":1,"second":4}' },
  ],
}

export default function EarliestAndLatestRounds() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Alive players in this round" className="algorithm-workspace__players">
      {step.row.map((player, i) => <li key={i} data-role={player === step.first || player === step.second ? 'focus' : ''}
        aria-label={`position ${i + 1}, player ${player}`}>{player}</li>)}
    </ol>
    <p aria-label="Pairs this round">{step.pairs.length ? step.pairs.map(([a, b]) => `${a} vs ${b}`).join(' · ') : 'No pairs'}</p>
    <output aria-label="Players tracked">{`Tracking ${run.input.first} and ${run.input.second}; round ${step.round || 'done'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each round pairs the outermost remaining players. Which winner advances is free, so the search tries each choice.</p>
    <p>The earliest and latest rounds come from the smallest and largest round number in which the two tracked players share a pair.</p>
  </>} />
}
