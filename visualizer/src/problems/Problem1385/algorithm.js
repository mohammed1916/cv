export const phases = [
  { id: 'start', label: 'Start', description: 'Read both arrays and the distance d.' },
  { id: 'inspect', label: 'Compare', description: 'Scan the second array for any value that is too close.' },
  { id: 'update', label: 'Decide', description: 'One close value rejects the candidate; a candidate with no close value is counted.' },
  { id: 'done', label: 'Complete', description: 'The count of distance-valid values is returned.' },
]

export function parseInput(text) {
  const value = JSON.parse(text)
  const ok = arr => Array.isArray(arr) && arr.length >= 1 && arr.length <= 50 && arr.every(v => Number.isInteger(v) && Math.abs(v) <= 100)
  if (!value || !ok(value.arr1) || !ok(value.arr2) || !Number.isInteger(value.d) || value.d < 0 || value.d > 100) {
    throw new Error('Enter JSON like {"arr1":[4,5,8],"arr2":[10,9,1],"d":2}: arrays of 1–50 integers in [-100, 100] and d from 0 to 100.')
  }
  return { arr1: value.arr1, arr2: value.arr2, d: value.d }
}

const LINE = { start: 2, outer: 3, inner: 5, close: 6, count: 8, done: 10 }

export function buildTrace(input) {
  const { arr1, arr2, d } = input
  const frames = []
  let count = 0
  const verdict = Array(arr1.length).fill(null) // true = counted, false = rejected
  frames.push({
    phase: 'start', activeLine: LINE.start,
    message: `Count values in arr1 whose distance to every value in arr2 is strictly greater than ${d}.`,
    snapshot: { arr1, arr2, d, index: null, other: null, verdict: [...verdict], count, close: null },
  })
  for (let i = 0; i < arr1.length; i++) {
    let close = null
    frames.push({
      phase: 'inspect', activeLine: LINE.outer,
      message: `Test arr1[${i}] = ${arr1[i]} against every value in arr2.`,
      snapshot: { arr1, arr2, d, index: i, other: null, verdict: [...verdict], count, close },
    })
    for (let j = 0; j < arr2.length; j++) {
      const gap = Math.abs(arr1[i] - arr2[j])
      if (gap <= d) {
        close = j
        frames.push({
          phase: 'update', activeLine: LINE.close,
          message: `|${arr1[i]} - ${arr2[j]}| = ${gap} is not greater than ${d}, so ${arr1[i]} is rejected.`,
          snapshot: { arr1, arr2, d, index: i, other: j, verdict: [...verdict], count, close: j },
        })
        break
      }
      frames.push({
        phase: 'inspect', activeLine: LINE.inner,
        message: `|${arr1[i]} - ${arr2[j]}| = ${gap} is greater than ${d}; keep checking.`,
        snapshot: { arr1, arr2, d, index: i, other: j, verdict: [...verdict], count, close: null },
      })
    }
    if (close === null) {
      count += 1
      verdict[i] = true
      frames.push({
        phase: 'update', activeLine: LINE.count,
        message: `No value in arr2 is within ${d} of ${arr1[i]}, so it is counted. Count is now ${count}.`,
        snapshot: { arr1, arr2, d, index: i, other: null, verdict: [...verdict], count, close: null },
      })
    } else {
      verdict[i] = false
    }
  }
  frames.push({
    phase: 'done', activeLine: LINE.done,
    message: `${count} values of arr1 are far from every value of arr2.`,
    snapshot: { arr1, arr2, d, index: null, other: null, verdict: [...verdict], count, close: null },
  })
  return { input, result: count, frames }
}

const CODE = [
  'function findTheDistanceValue(arr1, arr2, d) {',
  '  let count = 0',
  '  for (const a of arr1) {',
  '    let close = false',
  '    for (const b of arr2) {',
  '      if (Math.abs(a - b) <= d) { close = true; break }',
  '    }',
  '    if (!close) count += 1',
  '  }',
  '  return count',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 9, 9: 9, 10: 11, 11: 11 }

export const python = `def distance_value(arr1, arr2, d):
    count = 0
    for a in arr1:
        close = False
        for b in arr2:
            if abs(a - b) <= d:
                close = True
                break
        if not close:
            count += 1
    return count`
