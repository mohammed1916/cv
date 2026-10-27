export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.head)) throw new Error('Use an object with a head array of digits.')
  const { head } = obj
  if (head.length < 1 || head.length > 12) throw new Error('head needs 1 to 12 digits in this visualization.')
  if (head.some(d => !Number.isInteger(d) || d < 0 || d > 9)) throw new Error('Each node holds a digit from 0 to 9.')
  if (head.length > 1 && head[0] === 0) throw new Error('The most significant digit must not be 0.')
  return { head }
}

export function buildTrace(input) {
  const head = input.head
  let carry = 0
  const digits = []
  const frames = [{ phase: 'start', activeLine: L('set carry to 0'), k: head.length, carry, digits: [], message: 'Start at the tail, the least significant digit.' }]
  for (let k = head.length - 1; k >= 0; k--) {
    const total = 2 * head[k] + carry
    digits.push(total % 10)
    carry = Math.floor(total / 10)
    frames.push({ phase: 'digit', activeLine: L('append total modulo 10'), k, carry, digits: [...digits], message: `2 times ${head[k]} plus carry gives ${total}; write ${total % 10} and carry ${carry}.` })
  }
  if (carry > 0) {
    digits.push(carry)
    frames.push({ phase: 'carry', activeLine: L('if carry is above 0'), k: -1, carry, digits: [...digits], message: `A final carry ${carry} becomes the new most significant digit.` })
  }
  digits.reverse()
  frames.push({ phase: 'done', activeLine: L('return digits'), k: -1, carry: 0, digits: [...digits], message: `The doubled number is ${digits.join('')}.` })
  return { input, result: digits, frames }
}

export const code = `double a number stored as a linked list of digits
  set carry to 0
  set digits to an empty list
  for each node from the tail to the head do
    set total to 2 times the digit plus carry
    append total modulo 10 to digits
    set carry to total divided by 10, rounded down
  if carry is above 0 then append carry to digits
  reverse digits to get the answer
  return digits`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def double_list(head):
    carry = 0
    digits = []
    for d in reversed(head):
        total = 2 * d + carry
        digits.append(total % 10)
        carry = total // 10
    if carry > 0:
        digits.append(carry)
    digits.reverse()
    return digits
`
