
export const phases = [
  {
    id: 'start',
    label: 'Start',
    description: 'Initialize the distance check.'
  },
  {
    id: 'inspect',
    label: 'Compare',
    description: 'Inspect the candidate and blocker.'
  },
  {
    id: 'update',
    label: 'Decide',
    description: 'Accept or reject the candidate.'
  },
  {
    id: 'done',
    label: 'Complete',
    description: 'Return the distance value.'
  }
]

export function parseInput(text) {
  const value = JSON.parse(text)

  const validArray = arr =>
    Array.isArray(arr) &&
    arr.length >= 1 &&
    arr.length <= 50 &&
    arr.every(v =>
      Number.isInteger(v) && Math.abs(v) <= 100
    )

  if (
    !value ||
    !validArray(value.arr1) ||
    !validArray(value.arr2) ||
    !Number.isInteger(value.d) ||
    value.d < 0 ||
    value.d > 100
  ) {
    throw new Error(
      'Enter JSON with arrays of 1–50 integers in [-100, 100] ' +
      'and d between 0 and 100.'
    )
  }

  return {
    arr1: [...value.arr1],
    arr2: [...value.arr2],
    d: value.d
  }
}

const LINE = {
  start: 2,
  outer: 3,
  inner: 5,
  close: 6,
  count: 8,
  done: 10
}

export function buildTrace(input) {
  const { arr1, arr2, d } = input

  const frames = []
  const verdict = Array(arr1.length).fill(null)
  const nearest = Array(arr1.length).fill(null)
  const comparisons = Array(arr1.length).fill(0)

  let count = 0
  let totalComparisons = 0

  const push = ({
    phase,
    activeLine,
    message,
    index = null,
    other = null,
    gap = null,
    close = null,
    event = null
  }) => {
    frames.push({
      phase,
      activeLine,
      message,
      snapshot: {
        arr1: [...arr1],
        arr2: [...arr2],
        d,
        index,
        other,
        gap,
        close,
        event,
        count,
        verdict: [...verdict],
        nearest: [...nearest],
        comparisons: [...comparisons],
        totalComparisons
      }
    })
  }

  push({
    phase: 'start',
    activeLine: LINE.start,
    event: 'start',
    message:
      `Count arr1 values farther than ${d} ` +
      'from every value in arr2.'
  })

  for (let i = 0; i < arr1.length; i++) {
    let rejected = false

    push({
      phase: 'inspect',
      activeLine: LINE.outer,
      index: i,
      event: 'candidate',
      message:
        `Select arr1[${i}] = ${arr1[i]}. ` +
        'Begin scanning arr2.'
    })

    for (let j = 0; j < arr2.length; j++) {
      const gap = Math.abs(arr1[i] - arr2[j])

      nearest[i] =
        nearest[i] === null
          ? gap
          : Math.min(nearest[i], gap)

      comparisons[i] += 1
      totalComparisons += 1

      const tooClose = gap <= d

      push({
        phase: 'inspect',
        activeLine: LINE.inner,
        index: i,
        other: j,
        gap,
        close: tooClose ? j : null,
        event: tooClose ? 'boundary' : 'safe',
        message:
          `|${arr1[i]} − ${arr2[j]}| = ${gap}. ` +
          (tooClose
            ? `The gap is ≤ ${d}, so this candidate is too close.`
            : `The gap is > ${d}, so continue checking.`)
      })

      if (tooClose) {
        rejected = true
        verdict[i] = false

        push({
          phase: 'update',
          activeLine: LINE.close,
          index: i,
          other: j,
          gap,
          close: j,
          event: 'rejected',
          message:
            `Reject ${arr1[i]} because ${arr2[j]} ` +
            `is within distance ${d}.`
        })

        break
      }
    }

    if (!rejected) {
      verdict[i] = true
      count += 1

      push({
        phase: 'update',
        activeLine: LINE.count,
        index: i,
        gap: nearest[i],
        event: 'accepted',
        message:
          `Accept ${arr1[i]}. Every blocker is farther ` +
          `than ${d}. Count = ${count}.`
      })
    }
  }

  push({
    phase: 'done',
    activeLine: LINE.done,
    event: 'done',
    message:
      `Complete! ${count} candidates qualify.`
  })

  return {
    input,
    result: count,
    frames
  }
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
  '}'
]

export const code = CODE.map((text, index) => ({
  line: index + 1,
  text
}))

export const pythonLineMap = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 9,
  9: 9,
  10: 11,
  11: 11
}

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
