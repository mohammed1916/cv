export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Number.isInteger(obj.num)) throw new Error('Use an object with an integer key num.')
  if (obj.num < 1 || obj.num > 99999999) throw new Error('num is an integer from 1 to 99999999.')
  return { num: obj.num }
}

export function buildTrace(input) {
  const text = String(input.num)
  const firstNot9 = [...text].find(ch => ch !== '9')
  const big = firstNot9 === undefined ? text : text.split(firstNot9).join('9')
  const frames = [{ phase: 'start', activeLine: L('set text to the digits'), changed: '', text, big: null, small: null, message: `Start with ${text}. One substitution replaces every copy of one digit with another digit.` }]
  frames.push({ phase: 'max', activeLine: L('replace every copy of the first such digit'), changed: firstNot9 ?? '', text, big, small: null, message: firstNot9 === undefined ? `Every digit is 9, so the largest value is ${big}.` : `Replace every ${firstNot9} with 9 to get ${big}.` })
  let small = text
  let minChanged = ''
  let minLine = 'replace every copy of it'
  if (text[0] !== '1') {
    minChanged = text[0]
    small = text.split(text[0]).join('1')
    minLine = 'replace every copy of the first digit'
  } else {
    const other = [...text.slice(1)].find(ch => ch !== '0' && ch !== '1')
    if (other !== undefined) { minChanged = other; small = text.split(other).join('0') }
  }
  frames.push({ phase: 'min', activeLine: L(minLine), changed: minChanged, text, big, small, message: `Smallest: the value becomes ${small} (no leading zero).` })
  const result = Number(big) - Number(small)
  frames.push({ phase: 'done', activeLine: L('return big minus small'), changed: '', text, big, small, message: `Largest ${big} minus smallest ${small} is ${result}.` })
  return { input, text, result, frames }
}

export const code = `largest minus smallest after one digit change
  set text to the digits of num
  set big to the text
  if a digit other than 9 exists then
    replace every copy of the first such digit with 9
  set small to the text
  if the first digit is not 1 then
    replace every copy of the first digit with 1
  otherwise
    if a digit after the first is not 0 or 1 then
      replace every copy of it with 0
  return big minus small`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_min_difference(num):
    text = str(num)
    big = text
    for ch in text:
        if ch != '9':
            big = text.replace(ch, '9')
            break
    small = text
    if text[0] != '1':
        small = text.replace(text[0], '1')
    else:
        for ch in text[1:]:
            if ch not in '01':
                small = text.replace(ch, '0')
                break
    return int(big) - int(small)
`
