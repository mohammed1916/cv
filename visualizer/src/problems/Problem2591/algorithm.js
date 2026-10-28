export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with integer keys money and children.')
  const { money, children } = obj
  if (!Number.isInteger(money) || money < 0 || money > 200) throw new Error('money is an integer from 0 to 200.')
  if (!Number.isInteger(children) || children < 1 || children > 20) throw new Error('children is an integer from 1 to 20.')
  return { money, children }
}

export function buildTrace(input) {
  const { money, children } = input
  const alloc = Array(children).fill(1)
  let left = money - children
  let eights = 0
  const frames = [{ phase: 'start', activeLine: L('if money is below children'), index: -1, alloc: [...alloc], left, eights, message: `Everyone gets one dollar first. ${Math.max(left, 0)} dollars remain to hand out.` }]
  if (money < children) {
    frames.push({ phase: 'done', activeLine: L('return -1'), index: -1, alloc: [...alloc], left, eights: -1, message: 'Not every child can receive a dollar, so the answer is -1.' })
    return { input, result: -1, frames }
  }
  for (let i = 0; i < children && left >= 7; i++) {
    alloc[i] = 8
    left -= 7
    eights += 1
    frames.push({ phase: 'eight', activeLine: L('give 7 more dollars'), index: i, alloc: [...alloc], left, eights, message: `Child ${i} now has exactly 8 dollars. ${left} dollars remain.` })
  }
  let result = eights
  let fixLine = 'if eights equals children'
  if (eights === children && left > 0) {
    result -= 1
  } else if (children - eights === 1 && left === 3) {
    result -= 1
    fixLine = 'else if children minus eights'
  }
  frames.push({ phase: 'fix', activeLine: L(fixLine), index: -1, alloc: [...alloc], left, eights: result, message: result === eights ? 'No forbidden ending, so the count stands.' : 'One child would get a forbidden amount, so one fewer child gets 8.' })
  frames.push({ phase: 'done', activeLine: L('return eights'), index: -1, alloc: [...alloc], left, eights: result, message: `Maximum children with exactly 8 dollars: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum number of children who get exactly 8 dollars
  if money is below children then
    return -1
  set left to money minus children
  set eights to 0
  for each child while left is at least 7
    give 7 more dollars to the child
    subtract 7 from left and add 1 to eights
  if eights equals children and left is above 0 then
    subtract 1 from eights
  else if children minus eights is 1 and left is 3 then
    subtract 1 from eights
  return eights`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_eights(money, children):
    if money < children:
        return -1
    left = money - children
    eights = 0
    for _ in range(children):
        if left < 7:
            break
        left -= 7
        eights += 1
    if eights == children and left > 0:
        eights -= 1
    elif children - eights == 1 and left == 3:
        eights -= 1
    return eights
`
