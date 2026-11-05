export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length !== 3 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Use a JSON array of three integers from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const [a, b, c] = [...nums].sort((p, q) => p - q)
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const [a, b, c]'), sides: [a, b, c], message: `Sorted sides are ${a}, ${b} and ${c}.` })
  if (a + b <= c) {
    frames.push({ pythonLine: 4, phase: 'none', activeLine: L("return 'none'"), sides: [a, b, c], result: 'none', message: `${a} + ${b} is not greater than ${c}, so no triangle.` })
    return { input: nums, result: 'none', frames }
  }
  frames.push({ pythonLine: 3, phase: 'check', activeLine: L("if (a + b <= c)"), sides: [a, b, c], message: `${a} + ${b} is greater than ${c}, so a triangle exists.` })
  let result
  if (a === b && b === c) result = 'equilateral'
  else if (a === b || b === c) result = 'isosceles'
  else result = 'scalene'
  const line = result === 'equilateral' ? 6 : result === 'isosceles' ? 8 : 9
  frames.push({ pythonLine: line, phase: 'result', activeLine: L(`return '${result}'`), sides: [a, b, c], result, message: `The sides give ${result}.` })
  return { input: nums, result, frames }
}

export const code = `function triangleType(nums) {
  const [a, b, c] = [...nums].sort((p, q) => p - q)
  if (a + b <= c) return 'none'
  if (a === b && b === c) return 'equilateral'
  if (a === b || b === c) return 'isosceles'
  return 'scalene'
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def triangle_type(nums):
    a, b, c = sorted(nums)
    if a + b <= c:
        return "none"
    if a == b == c:
        return "equilateral"
    if a == b or b == c:
        return "isosceles"
    return "scalene"
`
