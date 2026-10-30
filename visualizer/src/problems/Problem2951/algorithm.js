export const code = [
  { line: 1, text: "Start with an empty list of peaks" },
  { line: 2, text: "For each interior index i from 1 to n - 2" },
  { line: 3, text: "If mountain[i] is greater than both neighbours" },
  { line: 4, text: "Append i to the peaks" },
  { line: 5, text: "Return the peaks" },
]

export const python = `def findPeaks(mountain):
    peaks = []
    for i in range(1, len(mountain) - 1):
        if mountain[i] > mountain[i - 1] and mountain[i] > mountain[i + 1]:
            peaks.append(i)
    return peaks`

function validateInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object such as {"mountain": [1, 4, 3, 8, 5]}.')
  }
  const { mountain } = data
  if (!Array.isArray(mountain) || mountain.length < 3 || mountain.length > 50) {
    throw new Error("mountain must be an array of 3 to 50 integers (the visualization cap).")
  }
  mountain.forEach((value, i) => {
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new Error(`mountain[${i}] must be an integer from 1 to 100.`)
    }
  })
  return { mountain: [...mountain] }
}

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, such as {"mountain": [1, 4, 3, 8, 5]}.')
  }
  return validateInput(data)
}

export function buildTrace(input) {
  const { mountain } = validateInput(input)
  const n = mountain.length
  const peaks = []
  const frames = []
  frames.push({
    phase: "setup", activeLine: 1, pythonLine: 2, index: -1, peaks: [], message: "Start with an empty list of peaks.",
  })
  for (let i = 1; i < n - 1; i++) {
    frames.push({
      phase: "scan", activeLine: 2, pythonLine: 3, index: i, peaks: [...peaks],
      message: `Check interior index ${i} (value ${mountain[i]}).`,
    })
    const isPeak = mountain[i] > mountain[i - 1] && mountain[i] > mountain[i + 1]
    frames.push({
      phase: "check", activeLine: 3, pythonLine: 4, index: i, peaks: [...peaks], isPeak,
      message: isPeak
        ? `${mountain[i]} is greater than ${mountain[i - 1]} and ${mountain[i + 1]}: a peak.`
        : `${mountain[i]} is not greater than both neighbours.`,
    })
    if (isPeak) {
      peaks.push(i)
      frames.push({
        phase: "record", activeLine: 4, pythonLine: 5, index: i, peaks: [...peaks], isPeak: true,
        message: `Append ${i} to the peaks.`,
      })
    }
  }
  frames.push({
    phase: "done", activeLine: 5, pythonLine: 6, index: -1, peaks: [...peaks],
    message: `Return [${peaks.join(", ")}].`,
  })
  return { input: { mountain }, result: [...peaks], frames }
}
