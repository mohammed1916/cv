// Each sensor is tested as the faulty one. The other sensor is taken as the original record.
// A faulty reading is explained when some original index was dropped, every earlier value
// matches the original in place, every later value matches the original one slot further on,
// and the final value is free (the arbitrary replacement).

const INT = v => Number.isInteger(v) && v >= 0 && v <= 99

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with sensor1 and sensor2.')
  const { sensor1, sensor2 } = input
  for (const [name, reading] of [['sensor1', sensor1], ['sensor2', sensor2]]) {
    if (!Array.isArray(reading) || reading.length < 2 || reading.length > 10 || !reading.every(INT)) {
      throw new Error(`${name} is a list of 2 to 10 integers from 0 to 99 (visualization cap).`)
    }
  }
  if (sensor1.length !== sensor2.length) throw new Error('Both readings must have the same length.')
  return { sensor1, sensor2 }
}

export function buildTrace({ sensor1, sensor2 }) {
  const n = sensor1.length
  const frames = []
  const found = []
  const base = { sensor1, sensor2, candidate: 0, drop: -1, cells: null, found: [...found] }
  const push = (fields) => frames.push({ ...base, found: [...found], ...fields })

  push({ pythonLine: PL('n = len'), phase: 'start', activeLine: L('read both readings'), message: `Two readings of length ${n}. Test each sensor as the faulty one.` })

  for (const candidate of [1, 2]) {
    const faulty = candidate === 1 ? sensor1 : sensor2
    const original = candidate === 1 ? sensor2 : sensor1
    let explained = false
    push({ candidate, phase: 'candidate', pythonLine: PL('for candidate in'), activeLine: L('for each candidate'), message: `Assume sensor ${candidate} is faulty; the other sensor is the original.` })

    for (let drop = 0; drop < n && !explained; drop++) {
      const cells = Array(n).fill('')
      push({ candidate, drop, cells: [...cells], phase: 'drop', pythonLine: PL('for drop in range'), activeLine: L('for each dropped index'), message: `Suppose original index ${drop} was dropped.` })
      let ok = true
      for (let k = 0; k < n - 1; k++) {
        const src = k < drop ? k : k + 1
        const same = faulty[k] === original[src]
        cells[k] = same ? (k < drop ? 'same' : 'shift') : 'bad'
        push({ candidate, drop, cells: [...cells], phase: same ? 'compare' : 'mismatch', pythonLine: PL('if faulty[k] != original[src]'), activeLine: L('compare the reading at k'), message: same ? `Sensor ${candidate} value ${faulty[k]} lines up with original index ${src}.` : `Value ${faulty[k]} does not line up with original index ${src}; drop ${drop} fails.` })
        if (!same) {
          ok = false
          break
        }
      }
      if (ok) {
        cells[n - 1] = 'free'
        explained = true
        push({ candidate, drop, cells: [...cells], phase: 'explained', pythonLine: PL('explained = True'), activeLine: L('explained = true'), message: `The last value ${faulty[n - 1]} is the free replacement. Sensor ${candidate} can be faulty.` })
      }
    }
    if (explained) found.push(candidate)
    if (!explained) push({ candidate, drop: -1, cells: null, phase: 'reject', pythonLine: PL('if explained:'), activeLine: L('add the candidate to found'), message: `No dropped index explains sensor ${candidate}.` })
  }

  const result = found.length === 1 ? found[0] : -1
  push({ candidate: 0, drop: -1, cells: null, phase: 'done', pythonLine: PL('return -1'), activeLine: L('exactly one candidate'), message: result === -1 ? (found.length === 0 ? 'Neither sensor can be the faulty one. Return -1.' : 'Both sensors fit. The readings do not decide it, so return -1.') : `Only sensor ${result} fits. Return ${result}.` })
  return { input: { sensor1, sensor2 }, result, frames }
}

export const code = `faulty sensor between two equal-length readings
  read both readings and let n be their length
  found = empty list
  for each candidate sensor in 1, 2
    faulty = the candidate, original = the other sensor
    explained = false
    for each dropped index d from 0 to n minus 1
      ok = true
      for each k from 0 to n minus 2
        src = k if k is less than d, otherwise k plus 1
        compare the reading at k with the original at src
        if they differ then set ok to false and stop this d
      if ok then explained = true and stop trying d
    if explained then add the candidate to found
  if exactly one candidate is in found then return it
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(s) {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `def faulty_sensor(sensor1, sensor2):
    n = len(sensor1)
    found = []
    for candidate in (1, 2):
        faulty = sensor1 if candidate == 1 else sensor2
        original = sensor2 if candidate == 1 else sensor1
        explained = False
        for drop in range(n):
            ok = True
            for k in range(n - 1):
                src = k if k < drop else k + 1
                if faulty[k] != original[src]:
                    ok = False
                    break
            if ok:
                explained = True
                break
        if explained:
            found.append(candidate)
    if len(found) == 1:
        return found[0]
    return -1
`

function PL(s) {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
