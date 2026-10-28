export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums1) || !Array.isArray(data.nums2) || !Array.isArray(data.queries)) {
    throw new Error('Use {"nums1": [...], "nums2": [...], "queries": [...]}.')
  }
  const { nums1, nums2, queries } = data
  if (nums1.length < 1 || nums1.length > 4) throw new Error('nums1 must have 1 to 4 entries for the visualization.')
  if (nums2.length < 1 || nums2.length > 8) throw new Error('nums2 must have 1 to 8 entries for the visualization.')
  if (nums1.some(v => !Number.isInteger(v) || v < 1 || v > 9) || nums2.some(v => !Number.isInteger(v) || v < 1 || v > 9)) {
    throw new Error('Array entries are integers from 1 to 9.')
  }
  if (queries.length < 1 || queries.length > 8) throw new Error('Use 1 to 8 queries.')
  for (const q of queries) {
    if (!Array.isArray(q)) throw new Error('Each query is an array.')
    if (q[0] === 1) {
      if (q.length !== 4) throw new Error('A type 1 query is [1, x, y, val].')
      const [, x, y, val] = q
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < x || y >= nums2.length) throw new Error('Need 0 <= x <= y < nums2.length.')
      if (!Number.isInteger(val) || val < 1 || val > 9) throw new Error('val is an integer from 1 to 9.')
    } else if (q[0] === 2) {
      if (q.length !== 2) throw new Error('A type 2 query is [2, tot].')
      if (!Number.isInteger(q[1]) || q[1] < 1 || q[1] > 40) throw new Error('tot is an integer from 1 to 40.')
    } else {
      throw new Error('The query type is 1 or 2.')
    }
  }
  return { nums1, nums2, queries }
}

export function buildTrace(input) {
  const { nums1, queries } = input
  const nums2 = [...input.nums2]
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('let answers be'), query: -1, nums2: [...nums2], answers: [], message: 'Process the queries in order. Type 1 adds to nums2, type 2 counts pairs.' }]
  queries.forEach((q, qi) => {
    if (q[0] === 1) {
      const [, x, y, val] = q
      for (let k = x; k <= y; k++) nums2[k] += val
      frames.push({ phase: 'update', activeLine: L('add val to nums2'), query: qi, nums2: [...nums2], answers: [...answers], message: `Add ${val} to nums2[${x}..${y}].` })
    } else {
      const tot = q[1]
      const freq = new Map()
      for (const v of nums2) freq.set(v, (freq.get(v) ?? 0) + 1)
      let total = 0
      for (const a of nums1) total += freq.get(tot - a) ?? 0
      answers.push(total)
      frames.push({ phase: 'count', activeLine: L('append total to answers'), query: qi, nums2: [...nums2], answers: [...answers], message: `Pairs summing to ${tot}: ${total}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), query: -1, nums2: [...nums2], answers: [...answers], message: `Answers: [${answers.join(', ')}].` })
  return { input, result: answers, frames }
}

export const code = `answers for each type 2 query on pairs after increments
  let answers be an empty list
  for each query in order
    if the query type is 1 then
      add val to nums2 from index x to y
    else
      let freq be the count of each value in nums2
      let total be 0
      for each value a in nums1 add the count of tot minus a in freq to total
      append total to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_pairs_after_increment(nums1, nums2, queries):
    from collections import Counter
    nums2 = list(nums2)
    answers = []
    for q in queries:
        if q[0] == 1:
            _, x, y, val = q
            for k in range(x, y + 1):
                nums2[k] += val
        else:
            freq = Counter(nums2)
            total = 0
            for a in nums1:
                total += freq.get(q[1] - a, 0)
            answers.append(total)
    return answers
`
