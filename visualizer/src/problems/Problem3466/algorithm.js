export const phases = [
  { id: 'start', label: 'Read', description: 'Read the two lanes of values.' },
  { id: 'entry', label: 'Entry', description: 'Start a route at this mile, in lane one with no switches.' },
  { id: 'relax', label: 'Switch', description: 'Allow a lane change before this mile, if switches remain.' },
  { id: 'collect', label: 'Collect', description: 'Add the value of the current lane at this mile.' },
  { id: 'record', label: 'Record', description: 'Keep the best total ending after this mile.' },
  { id: 'done', label: 'Result', description: 'Return the greatest total.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with lanes.')
  const { lanes } = input
  if (!Array.isArray(lanes) || lanes.length !== 2) throw new Error('lanes holds exactly two arrays.')
  const [a, b] = lanes
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 1 || a.length > 8 || a.length !== b.length) throw new Error('Both lanes need the same length, from 1 to 8 miles.')
  for (const value of [...a, ...b]) {
    if (!Number.isInteger(value) || value < -9 || value > 9) throw new Error('Each mile value is an integer from -9 to 9.')
  }
  return { lanes: [a.slice(), b.slice()] }
}

export const code = [
  'maximum coin collection',
  '  best = negative infinity',
  '  for each entry mile i',
  '    dp[lane][used] = best total; start with lane one and used = 0 at value 0',
  '    for each mile m from i to the last mile',
  '      relax: a lane change before m uses one of the two switches',
  '      collect: add the value of the current lane at mile m',
  '      best = max(best, every dp value)',
  '  return best',
].map((text, index) => ({ line: index + 1, text }))

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const blank = () => [[-Infinity, -Infinity, -Infinity], [-Infinity, -Infinity, -Infinity]]
const copy = dp => dp.map(row => row.slice())
const show = dp => dp.map(row => row.map(v => (Number.isFinite(v) ? v : null)))

export function buildTrace({ lanes }) {
  const n = lanes[0].length
  const frames = []
  let best = -Infinity
  let bestRoute = null
  frames.push({ phase: 'start', activeLine: L('maximum coin collection'), pythonLine: P('def maximum'), lanes, entry: -1, mile: -1, dp: show(blank()), best: null, bestRoute: null, message: `Read ${n} mile${n === 1 ? '' : 's'} for each of two lanes. Routes start in lane one.` })
  for (let entry = 0; entry < n; entry++) {
    let dp = blank()
    dp[0][0] = 0
    frames.push({ phase: 'entry', activeLine: L('for each entry'), pythonLine: P('for entry in range'), lanes, entry, mile: entry, dp: show(dp), best: best === -Infinity ? null : best, bestRoute, message: `Enter at mile ${entry} in lane one with no switches used.` })
    for (let mile = entry; mile < n; mile++) {
      const relaxed = copy(dp)
      for (let lane = 0; lane < 2; lane++) {
        for (let used = 1; used <= 2; used++) {
          relaxed[lane][used] = Math.max(dp[lane][used], dp[1 - lane][used - 1])
        }
      }
      dp = relaxed
      frames.push({ phase: 'relax', activeLine: L('relax:'), pythonLine: P('relaxed = [row'), lanes, entry, mile, dp: show(dp), best: best === -Infinity ? null : best, bestRoute, message: `Before mile ${mile}, a lane change may be used (at most two in total).` })
      for (let lane = 0; lane < 2; lane++) for (let used = 0; used < 3; used++) dp[lane][used] += lanes[lane][mile]
      frames.push({ phase: 'collect', activeLine: L('collect:'), pythonLine: P('dp[lane][used] +='), lanes, entry, mile, dp: show(dp), best: best === -Infinity ? null : best, bestRoute, message: `Collect mile ${mile}: lane one adds ${lanes[0][mile]}, lane two adds ${lanes[1][mile]}.` })
      let top = -Infinity
      let topState = null
      for (let lane = 0; lane < 2; lane++) for (let used = 0; used < 3; used++) if (dp[lane][used] > top) { top = dp[lane][used]; topState = [lane, used] }
      if (top > best) {
        best = top
        bestRoute = { entry, exit: mile + 1, lane: topState[0], used: topState[1] }
        frames.push({ phase: 'record', activeLine: L('best = max'), pythonLine: P('best = max'), lanes, entry, mile, dp: show(dp), best, bestRoute, message: `Exit after mile ${mile} for ${top}, the new best.` })
      } else {
        frames.push({ phase: 'record', activeLine: L('best = max'), pythonLine: P('best = max'), lanes, entry, mile, dp: show(dp), best, bestRoute, message: `Exit after mile ${mile} gives ${top}; the best stays ${best}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), lanes, entry: -1, mile: -1, dp: null, best, bestRoute, result: best, message: `The greatest total is ${best}.` })
  return { input: { lanes }, result: best, frames }
}

export const python = `def maximum_coin_collection(lanes):
    NEG = float('-inf')
    n = len(lanes[0])
    best = NEG
    for entry in range(n):
        dp = [[NEG] * 3 for _ in range(2)]
        dp[0][0] = 0
        for mile in range(entry, n):
            relaxed = [row[:] for row in dp]
            for lane in range(2):
                for used in range(1, 3):
                    relaxed[lane][used] = max(dp[lane][used], dp[1 - lane][used - 1])
            dp = relaxed
            for lane in range(2):
                for used in range(3):
                    dp[lane][used] += lanes[lane][mile]
            best = max(best, max(max(row) for row in dp))
    return best
`
