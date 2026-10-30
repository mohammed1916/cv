export const code = [
  { line: 1, text: "Start with count = 0 and the vowel set a, e, i, o, u" },
  { line: 2, text: "For each start index i" },
  { line: 3, text: "For each end index j from i to the last index" },
  { line: 4, text: "If s[j] is a vowel, add one to the vowel count" },
  { line: 5, text: "Consonants = length of s[i..j] minus vowels" },
  { line: 6, text: "If vowels equal consonants and vowels times consonants is divisible by k, add one to count" },
  { line: 7, text: "Return count" },
]

export const python = `def countBeautifulSubstrings(s, k):
    vowels = set("aeiou")
    count = 0
    for i in range(len(s)):
        vowel_count = 0
        for j in range(i, len(s)):
            if s[j] in vowels:
                vowel_count += 1
            length = j - i + 1
            consonant_count = length - vowel_count
            if vowel_count == consonant_count and (vowel_count * consonant_count) % k == 0:
                count += 1
    return count`

const VOWELS = new Set(["a", "e", "i", "o", "u"])

function validateInput(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Input must be a JSON object such as {"s": "abba", "k": 1}.')
  }
  const { s, k } = data
  if (typeof s !== "string" || !/^[a-z]{1,50}$/.test(s)) {
    throw new Error("s must be 1 to 50 lowercase English letters (the visualization cap).")
  }
  if (!Number.isInteger(k) || k < 1 || k > 1000) {
    throw new Error("k must be an integer from 1 to 1000.")
  }
  return { s, k }
}

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, such as {"s": "abba", "k": 1}.')
  }
  return validateInput(data)
}

export function buildTrace(input) {
  const { s, k } = validateInput(input)
  const frames = []
  let count = 0
  frames.push({
    phase: "setup", activeLine: 1, pythonLine: 2, i: -1, j: -1, vowels: 0, consonants: 0,
    isVowel: null, beautiful: null, count: 0, message: "Start with count 0 and the vowel set a, e, i, o, u.",
  })
  for (let i = 0; i < s.length; i++) {
    let vowelCount = 0
    frames.push({
      phase: "start", activeLine: 2, pythonLine: 4, i, j: i, vowels: 0, consonants: 0,
      isVowel: null, beautiful: null, count, message: `Start substrings at index ${i}.`,
    })
    for (let j = i; j < s.length; j++) {
      const isVowel = VOWELS.has(s[j])
      if (isVowel) vowelCount += 1
      frames.push({
        phase: "extend", activeLine: 4, pythonLine: 7, i, j, vowels: vowelCount, consonants: null,
        isVowel, beautiful: null, count,
        message: `Extend to j = ${j}: s[${j}] = "${s[j]}" is ${isVowel ? "a vowel" : "a consonant"}.`,
      })
      const length = j - i + 1
      const consonantCount = length - vowelCount
      frames.push({
        phase: "measure", activeLine: 5, pythonLine: 10, i, j, vowels: vowelCount, consonants: consonantCount,
        isVowel, beautiful: null, count,
        message: `s[${i}..${j}] has ${vowelCount} vowels and ${consonantCount} consonants.`,
      })
      const beautiful = vowelCount === consonantCount && (vowelCount * consonantCount) % k === 0
      frames.push({
        phase: "check", activeLine: 6, pythonLine: 11, i, j, vowels: vowelCount, consonants: consonantCount,
        isVowel, beautiful, count,
        message: beautiful
          ? `Equal counts and ${vowelCount} x ${consonantCount} is divisible by ${k}: beautiful.`
          : `Not beautiful for k = ${k}.`,
      })
      if (beautiful) {
        count += 1
        frames.push({
          phase: "record", activeLine: 6, pythonLine: 12, i, j, vowels: vowelCount, consonants: consonantCount,
          isVowel, beautiful: true, count, message: `Add one. Count is now ${count}.`,
        })
      }
    }
  }
  frames.push({
    phase: "done", activeLine: 7, pythonLine: 13, i: -1, j: -1, vowels: null, consonants: null,
    isVowel: null, beautiful: null, count, message: `Return ${count}.`,
  })
  return { input: { s, k }, result: count, frames }
}
