export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, lights and requirement.')
  const { n, lights, requirement } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n is an integer from 1 to 12.')
  if (!Array.isArray(lights) || lights.length < 1 || lights.length > 8) throw new Error('lights has 1 to 8 lamps.')
  if (!lights.every(([p, r]) => Number.isInteger(p) && Number.isInteger(r) && p >= 0 && p < n && r >= 0 && r <= 12)) throw new Error('Each lamp is [position, range] with 0 <= position < n and 0 <= range <= 12.')
  if (!Array.isArray(requirement) || requirement.length !== n || !requirement.every(x => Number.isInteger(x) && x >= 0 && x <= 8)) throw new Error('requirement has n values from 0 to 8.')
  return { n, lights, requirement }
}

export function buildTrace({ n, lights, requirement }) {
  const frames = []
  const diff = Array(n + 1).fill(0)
  frames.push({ pythonLine: PL('diff = [0]'), phase: 'setup', activeLine: CL('const diff'), at: -1, diff: [...diff], brightness: [], passes: [], count: 0, message: `Start a difference array of ${n + 1} cells.` })
  for (const [position, range] of lights) {
    const start = Math.max(0, position - range)
    const end = Math.min(n - 1, position + range)
    diff[start] += 1
    diff[end + 1] -= 1
    frames.push({ pythonLine: PL('diff[max(0'), phase: 'mark', activeLine: CL('diff[Math.max'), at: start, diff: [...diff], brightness: [], passes: [], count: 0, message: `Lamp at ${position} with range ${range} lights ${start} to ${end}: add 1 at ${start} and subtract 1 after ${end}.` })
  }
  let brightness = 0
  let count = 0
  const values = []
  const passes = []
  for (let i = 0; i < n; i++) {
    brightness += diff[i]
    values.push(brightness)
    const ok = brightness >= requirement[i]
    passes.push(ok)
    if (ok) count++
    frames.push({ pythonLine: PL('brightness += diff[i]'), phase: 'sweep', activeLine: CL('brightness += diff[i]'), at: i, diff: [...diff], brightness: [...values], passes: [...passes], count, message: `Position ${i} has brightness ${brightness} and needs ${requirement[i]}: ${ok ? 'it counts.' : 'it does not count.'}` })
  }
  frames.push({ pythonLine: PL('return count'), phase: 'done', activeLine: CL('return count'), at: -1, diff: [...diff], brightness: values, passes, count, message: `${count} positions meet their requirement.` })
  return { input: { n, lights, requirement }, result: count, frames }
}

export const code = `function countMeetingRequirement(n, lights, requirement) {
  const diff = Array(n + 1).fill(0);
  for (const [position, range] of lights) {
    diff[Math.max(0, position - range)] += 1;
    diff[Math.min(n - 1, position + range) + 1] -= 1;
  }
  let brightness = 0;
  let count = 0;
  for (let i = 0; i < n; i++) {
    brightness += diff[i];
    if (brightness >= requirement[i]) count++;
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def count_meeting_requirement(n, lights, requirement):
    diff = [0] * (n + 1)
    for position, rng in lights:
        diff[max(0, position - rng)] += 1
        diff[min(n - 1, position + rng) + 1] -= 1
    brightness = 0
    count = 0
    for i in range(n):
        brightness += diff[i]
        if brightness >= requirement[i]:
            count += 1
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
