export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.operations)) throw new Error('Use an object with an operations array.')
  const { operations } = obj
  if (operations.length < 1 || operations.length > 16) throw new Error('operations needs 1 to 16 entries.')
  for (const op of operations) {
    if (!Array.isArray(op) || op.length !== 2) throw new Error('Each operation is ["addText", "abc"], ["deleteText", k], ["cursorLeft", k] or ["cursorRight", k].')
    const [name, arg] = op
    if (name === 'addText') { if (typeof arg !== 'string' || !/^[a-z]{1,10}$/.test(arg)) throw new Error('addText takes 1 to 10 lowercase letters.') }
    else if (['deleteText', 'cursorLeft', 'cursorRight'].includes(name)) { if (!Number.isInteger(arg) || arg < 1 || arg > 10) throw new Error(`${name} takes k from 1 to 10.`) }
    else throw new Error(`Unknown operation ${name}.`)
  }
  return { operations }
}

export function buildTrace(input) {
  const { operations } = input
  let left = ''
  let right = ''
  const results = []
  const ops = []
  const frames = [{ phase: 'start', activeLine: L('set left and right to empty'), op: -1, left, right, message: 'The text is empty and the cursor is at the start.' }]
  operations.forEach(([name, arg], idx) => {
    let returned
    if (name === 'addText') {
      left += arg
      frames.push({ phase: 'add', activeLine: L('append the text to left'), op: idx, left, right, message: `Insert "${arg}" at the cursor.` })
    } else if (name === 'deleteText') {
      const d = Math.min(arg, left.length)
      left = left.slice(0, left.length - d)
      returned = d
      frames.push({ phase: 'delete', activeLine: L('delete up to k letters'), op: idx, left, right, message: `Delete ${d} letter(s) left of the cursor.` })
    } else if (name === 'cursorLeft') {
      const d = Math.min(arg, left.length)
      right = left.slice(left.length - d) + right
      left = left.slice(0, left.length - d)
      returned = left.slice(-10)
      frames.push({ phase: 'move', activeLine: L('move up to k letters from left to right'), op: idx, left, right, message: `Move the cursor left ${d} place(s).` })
    } else {
      const d = Math.min(arg, right.length)
      left += right.slice(0, d)
      right = right.slice(d)
      returned = left.slice(-10)
      frames.push({ phase: 'move', activeLine: L('move up to k letters from right to left'), op: idx, left, right, message: `Move the cursor right ${d} place(s).` })
    }
    if (name !== 'addText') results.push(returned)
    ops.push({ name, args: [arg], returned })
  })
  frames.push({ phase: 'done', activeLine: L('return results'), op: operations.length, left, right, message: `Final text: ${left + right || '(empty)'}.` })
  return { input, result: results, ops, frames }
}

export const code = `design a text editor with a cursor
  set left and right to empty text
  set results to an empty list
  for each operation do
    if it is addText then
      append the text to left, just before the cursor
    otherwise if it is deleteText(k) then
      delete up to k letters from the end of left
      append the number deleted to results
    otherwise if it is cursorLeft(k) then
      move up to k letters from left to right
      append the last 10 letters of left to results
    otherwise if it is cursorRight(k) then
      move up to k letters from right to left
      append the last 10 letters of left to results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def text_editor(operations):
    left = []
    right = []
    results = []
    for op in operations:
        name = op[0]
        if name == "addText":
            left.extend(op[1])
        elif name == "deleteText":
            d = min(op[1], len(left))
            for _ in range(d):
                left.pop()
            results.append(d)
        elif name == "cursorLeft":
            d = min(op[1], len(left))
            for _ in range(d):
                right.append(left.pop())
            results.append(''.join(left[-10:]))
        elif name == "cursorRight":
            d = min(op[1], len(right))
            for _ in range(d):
                left.append(right.pop())
            results.append(''.join(left[-10:]))
    return results
`
