export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.requests)) throw new Error('Use an object with n and a requests array.')
  const { n, requests } = obj
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('n must be an integer from 1 to 100.')
  if (requests.length < 1 || requests.length > 100) throw new Error('Use 1 to 100 requests.')
  if (requests.some(r => !Number.isInteger(r) || r < 0 || r > n - 1)) throw new Error(`Each request must be a floor from 0 to ${n - 1}.`)
  return { n, requests }
}

export function buildTrace(input) {
  const { requests } = input
  const frames = []
  let floor = 0
  let time = 0
  frames.push({ phase: 'start', activeLine: L('set floor to 0'), index: -1, floor, time, message: 'The elevator starts at floor 0.' })
  requests.forEach((r, index) => {
    const moved = Math.abs(floor - r)
    time += moved
    frames.push({ phase: 'serve', activeLine: L('add the distance'), index, floor: r, time, moved, message: `Go from floor ${floor} to ${r}: ${moved} second${moved === 1 ? '' : 's'}.` })
    floor = r
  })
  frames.push({ phase: 'done', activeLine: L('return time'), index: -1, floor, time, moved: 0, message: `Total time: ${time} seconds.` })
  return { input, result: time, frames }
}

export const code = `elevator requests I(n, requests)
  set floor to 0 and set time to 0
  for each requested floor r in order do
    add the distance between floor and r to time
    set floor to r
  return time`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def elevator_requests_time(n, requests):
    floor = 0
    time = 0
    for r in requests:
        time += abs(floor - r)
        floor = r
    return time
`
