export const phases = [
  { id: 'start', label: 'Correct value', description: 'Evaluate with the correct order: multiplications first, then additions, each left to right.' },
  { id: 'orders', label: 'Other orders', description: 'Combine neighbouring groups in every possible order; each result is what a student could get by applying operators in a wrong order.' },
  { id: 'grade', label: 'Grade answers', description: 'Exact correct answer: 5 points. Reachable in a wrong order: 2 points. Otherwise: 0 points.' },
  { id: 'done', label: 'Result', description: 'Sum the points of all answers.' },
]

export const code = `function scoreOfStudents(s, answers) {
  const nums = s.split(/[+*]/).map(Number)
  const ops = s.match(/[+*]/g) ?? []
  let total = 0
  let term = nums[0]
  for (let k = 0; k < ops.length; k++) {
    if (ops[k] === '*') term *= nums[k + 1]
    else { total += term; term = nums[k + 1] }
  }
  const correct = total + term
  const reachable = new Map()
  for (let i = 0; i < nums.length; i++) reachable.set(\`\${i},\${i}\`, new Set([nums[i]]))
  for (let len = 2; len <= nums.length; len++) {
    for (let i = 0; i + len - 1 < nums.length; i++) {
      const j = i + len - 1
      const values = new Set()
      for (let k = i; k < j; k++) {
        for (const a of reachable.get(\`\${i},\${k}\`)) {
          for (const b of reachable.get(\`\${k + 1},\${j}\`)) values.add(ops[k] === '+' ? a + b : a * b)
        }
      }
      reachable.set(\`\${i},\${j}\`, values)
    }
  }
  const wrongOrder = reachable.get(\`0,\${nums.length - 1}\`)
  return answers.reduce((sum, answer) => sum + (answer === correct ? 5 : wrongOrder.has(answer) ? 2 : 0), 0)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def score_of_students(s, answers):
    nums = [int(t) for t in s[::2]]
    ops = s[1::2]
    total = 0
    term = nums[0]
    for k, op in enumerate(ops):
        if op == '*':
            term *= nums[k + 1]
        else:
            total += term
            term = nums[k + 1]
    correct = total + term
    reachable = {}
    for i in range(len(nums)):
        reachable[(i, i)] = {nums[i]}
    for length in range(2, len(nums) + 1):
        for i in range(len(nums) - length + 1):
            j = i + length - 1
            values = set()
            for k in range(i, j):
                for a in reachable[(i, k)]:
                    for b in reachable[(k + 1, j)]:
                        values.add(a + b if ops[k] == '+' else a * b)
            reachable[(i, j)] = values
    wrong_order = reachable[(0, len(nums) - 1)]
    return sum(5 if a == correct else 2 if a in wrong_order else 0 for a in answers)
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"s":"2+3*4","answers":[14,20,5]}.') }
  const { s, answers } = obj || {}
  if (typeof s !== 'string' || !/^[0-9](?:[+*][0-9])+$/.test(s)) throw new Error('s must be single digits joined by + and *, such as 2+3*4.')
  if (s.length > 17) throw new Error('This visual accepts up to 9 digits.')
  if (!Array.isArray(answers) || answers.length < 1 || answers.length > 20 || !answers.every(a => Number.isInteger(a) && a >= 0 && a <= 1000)) {
    throw new Error('answers must have 1 to 20 whole numbers from 0 to 1000.')
  }
  return { s, answers }
}

export function buildTrace({ s, answers }) {
  const frames = []
  const nums = s.split(/[+*]/).map(Number)
  const ops = s.match(/[+*]/g) ?? []
  let total = 0
  let term = nums[0]
  for (let k = 0; k < ops.length; k++) {
    if (ops[k] === '*') term *= nums[k + 1]
    else { total += term; term = nums[k + 1] }
  }
  const correct = total + term
  const reachable = new Map()
  for (let i = 0; i < nums.length; i++) reachable.set(`${i},${i}`, new Set([nums[i]]))
  const add = (phase, c, p, message, extra = {}) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { s, answers, correct, wrongOrder: extra.wrongOrder ?? [], grade: extra.grade ?? null, points: extra.points ?? null, nums },
  })
  add('start', 'let total = 0', 'total = 0', `Correct value of ${s} is ${correct}.`)
  for (let len = 2; len <= nums.length; len++) {
    for (let i = 0; i + len - 1 < nums.length; i++) {
      const j = i + len - 1
      const values = new Set()
      for (let k = i; k < j; k++) {
        for (const a of reachable.get(`${i},${k}`)) {
          for (const b of reachable.get(`${k + 1},${j}`)) values.add(ops[k] === '+' ? a + b : a * b)
        }
      }
      reachable.set(`${i},${j}`, values)
    }
  }
  const wrongOrder = [...reachable.get(`0,${nums.length - 1}`)].sort((a, b) => a - b)
  add('orders', 'const reachable = new Map', 'reachable = {}', `${wrongOrder.length} values come from applying the operators in some order.`, { wrongOrder })
  let points = 0
  const grades = answers.map(a => (a === correct ? 5 : wrongOrder.includes(a) ? 2 : 0))
  points = grades.reduce((x, y) => x + y, 0)
  add('grade', 'return answers.reduce', 'return sum(', `Grades: ${grades.join(', ')}.`, { wrongOrder, grade: grades, points })
  add('done', 'return answers.reduce', 'return sum(', `Total points: ${points}.`, { wrongOrder, grade: grades, points })
  return { input: { s, answers }, result: points, frames }
}
