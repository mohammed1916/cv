export const code = [
  { line: 1, text: "Let n be the grid side and make a count for each value from 1 to n squared" },
  { line: 2, text: "For each value in the grid, add one to its count" },
  { line: 3, text: "For each value v from 1 to n squared" },
  { line: 4, text: "If count of v is 2, remember v as repeated" },
  { line: 5, text: "If count of v is 0, remember v as missing" },
  { line: 6, text: "Return repeated and missing" },
]

export const python = `def findMissingAndRepeatedValues(grid):
    n = len(grid)
    seen = [0] * (n * n + 1)
    for row in grid:
        for value in row:
            seen[value] += 1
    repeated = missing = -1
    for value in range(1, n * n + 1):
        if seen[value] == 2:
            repeated = value
        elif seen[value] == 0:
            missing = value
    return [repeated, missing]`

function validateInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object such as {"grid": [[1, 3], [2, 2]]}.')
  }
  const { grid } = data
  if (!Array.isArray(grid) || grid.length < 2 || grid.length > 9) {
    throw new Error("grid must be an n x n array with 2 <= n <= 9 (the visualization cap).")
  }
  const n = grid.length
  grid.forEach((row, r) => {
    if (!Array.isArray(row) || row.length !== n) throw new Error(`grid row ${r} must have exactly ${n} values.`)
  })
  const total = n * n
  const counts = new Array(total + 1).fill(0)
  grid.forEach((row) => row.forEach((value) => {
    if (!Number.isInteger(value) || value < 1 || value > total) {
      throw new Error(`Every grid value must be an integer from 1 to ${total}.`)
    }
    counts[value] += 1
  }))
  const repeats = counts.filter((c) => c === 2).length
  const gaps = counts.slice(1).filter((c) => c === 0).length
  if (repeats !== 1 || gaps !== 1) {
    throw new Error("The grid must contain every value from 1 to n squared once, except one value that repeats and one value that is missing.")
  }
  return { grid: grid.map((row) => [...row]) }
}

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, such as {"grid": [[1, 3], [2, 2]]}.')
  }
  return validateInput(data)
}

export function buildTrace(input) {
  const { grid } = validateInput(input)
  const n = grid.length
  const total = n * n
  const flat = grid.flat()
  const seen = new Array(total + 1).fill(0)
  const frames = []
  let repeated = -1
  let missing = -1
  frames.push({
    phase: "setup", activeLine: 1, pythonLine: 3, counts: [...seen], index: -1, value: null,
    repeated: -1, missing: -1, message: `Make a count table for values 1 to ${total}.`,
  })
  for (let k = 0; k < flat.length; k++) {
    const value = flat[k]
    seen[value] += 1
    frames.push({
      phase: "count", activeLine: 2, pythonLine: 6, counts: [...seen], index: k, value,
      repeated: -1, missing: -1, message: `Count ${value}; it now has ${seen[value]} occurrence(s).`,
    })
  }
  for (let v = 1; v <= total; v++) {
    frames.push({
      phase: "scan", activeLine: 3, pythonLine: 8, counts: [...seen], index: v, value: v,
      repeated, missing, message: `Check value ${v}: count ${seen[v]}.`,
    })
    if (seen[v] === 2) {
      repeated = v
      frames.push({
        phase: "repeat", activeLine: 4, pythonLine: 10, counts: [...seen], index: v, value: v,
        repeated, missing, message: `${v} appears twice: it is the repeated value.`,
      })
    } else if (seen[v] === 0) {
      missing = v
      frames.push({
        phase: "missing", activeLine: 5, pythonLine: 12, counts: [...seen], index: v, value: v,
        repeated, missing, message: `${v} never appears: it is the missing value.`,
      })
    }
  }
  frames.push({
    phase: "done", activeLine: 6, pythonLine: 13, counts: [...seen], index: -1, value: null,
    repeated, missing, message: `Return [${repeated}, ${missing}].`,
  })
  return { input: { grid }, result: [repeated, missing], frames }
}
