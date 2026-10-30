export const code = [
  { line: 1, text: "Start with an empty answer list." },
  { line: 2, text: "For each index i and word in words" },
  { line: 3, text: "If x is a character of word" },
  { line: 4, text: "Append i to the answer" },
  { line: 5, text: "Return the answer" },
]

export const python = `def findWordsContaining(words, x):
    result = []
    for i, word in enumerate(words):
        if x in word:
            result.append(i)
    return result`

function validateInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object such as {"words": ["leet", "code"], "x": "e"}.')
  }
  const { words, x } = data
  if (!Array.isArray(words) || words.length < 1 || words.length > 50) {
    throw new Error("words must be an array of 1 to 50 strings.")
  }
  words.forEach((word, i) => {
    if (typeof word !== "string" || !/^[a-z]{1,50}$/.test(word)) {
      throw new Error(`words[${i}] must be 1 to 50 lowercase English letters.`)
    }
  })
  if (typeof x !== "string" || !/^[a-z]$/.test(x)) {
    throw new Error("x must be a single lowercase English letter.")
  }
  return { words: [...words], x }
}

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, such as {"words": ["leet", "code"], "x": "e"}.')
  }
  return validateInput(data)
}

export function buildTrace(input) {
  const { words, x } = validateInput(input)
  const result = []
  const frames = []
  frames.push({
    phase: "setup", activeLine: 1, pythonLine: 2, index: -1, word: null, matched: null,
    result: [], message: "Start with an empty answer list.",
  })
  words.forEach((word, i) => {
    frames.push({
      phase: "loop", activeLine: 2, pythonLine: 3, index: i, word, matched: null,
      result: [...result], message: `Visit words[${i}] = "${word}".`,
    })
    const matched = word.includes(x)
    frames.push({
      phase: "check", activeLine: 3, pythonLine: 4, index: i, word, matched,
      result: [...result],
      message: matched ? `"${x}" appears in "${word}".` : `"${x}" does not appear in "${word}".`,
    })
    if (matched) {
      result.push(i)
      frames.push({
        phase: "record", activeLine: 4, pythonLine: 5, index: i, word, matched: true,
        result: [...result], message: `Append index ${i} to the answer.`,
      })
    }
  })
  frames.push({
    phase: "done", activeLine: 5, pythonLine: 6, index: -1, word: null, matched: null,
    result: [...result], message: `Return [${result.join(", ")}].`,
  })
  return { input: { words, x }, result: [...result], frames }
}
