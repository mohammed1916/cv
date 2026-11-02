const WORD = /^[1-9][0-9]{0,2}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  const words = Array.isArray(input) ? input : input?.words
  if (!Array.isArray(words) || words.length < 1 || words.length > 20) throw new Error('Use a list of 1 to 20 words.')
  for (const w of words) {
    if (typeof w !== 'string' || !(w === 'prev' || (WORD.test(w) && Number(w) <= 100))) throw new Error('Each word is "prev" or an integer from 1 to 100 written as a string.')
  }
  return { words }
}

export function buildTrace({ words }) {
  const nums = []
  const answers = []
  const frames = []
  let streak = 0
  frames.push({ pythonLine: P('nums = []'), phase: 'start', activeLine: L('start with no integers'), at: -1, streak, answers: [], message: 'No integers recorded yet.' })
  words.forEach((word, i) => {
    if (word === 'prev') {
      streak += 1
      if (streak <= nums.length) {
        const value = nums[nums.length - streak]
        answers.push(value)
        frames.push({ pythonLine: P('ans.append(nums[-consecutive])'), phase: 'prev', activeLine: L('step back'), at: i, streak, answers: [...answers], message: `prev is ${streak} back in the record, so it reports ${value}.` })
      } else {
        answers.push(-1)
        frames.push({ pythonLine: P('ans.append(-1)'), phase: 'missing', activeLine: L('report -1'), at: i, streak, answers: [...answers], message: `Only ${nums.length} integer${nums.length === 1 ? '' : 's'} recorded, so prev reports -1.` })
      }
    } else {
      nums.push(Number(word))
      streak = 0
      frames.push({ pythonLine: P('nums.append(int(word))'), phase: 'number', activeLine: L('record the integer'), at: i, streak, answers: [...answers], message: `Record ${word} and reset the prev streak.` })
    }
  })
  frames.push({ pythonLine: P('return ans'), phase: 'done', activeLine: L('return the answers'), at: -1, streak, answers: [...answers], message: `Reports: [${answers.join(', ')}].` })
  return { input: { words }, result: answers, frames }
}

export const code = `last visited integers for a list of words
  set nums to an empty record and ans to an empty list
  set consecutive to 0
  for each word in words
    if word is prev
      add 1 to consecutive
      if consecutive is at most the length of nums
        append nums at position consecutive from the end to ans
      else
        append -1 to ans
    else
      append the integer word to nums
      set consecutive to 0
  return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def last_visited_integers(words):
    nums = []
    ans = []
    consecutive = 0
    for word in words:
        if word == "prev":
            consecutive += 1
            if consecutive <= len(nums):
                ans.append(nums[-consecutive])
            else:
                ans.append(-1)
        else:
            nums.append(int(word))
            consecutive = 0
    return ans
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
