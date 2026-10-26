export function parseInput(text) {
  const obj = JSON.parse(text)
  const keys = ['sx', 'sy', 'tx', 'ty']
  if (!obj || typeof obj !== 'object' || keys.some(key => !Number.isInteger(obj[key]) || obj[key] < 1 || obj[key] > 1000000000)) throw new Error('Enter a JSON object {"sx":..,"sy":..,"tx":..,"ty":..} with integers from 1 to 1,000,000,000.')
  return { sx: obj.sx, sy: obj.sy, tx: obj.tx, ty: obj.ty }
}
export function buildTrace({ sx, sy, tx: tx0, ty: ty0 }) {
  let tx = tx0, ty = ty0
  const frames = [{ phase: 'start', activeLine: 2, tx, ty, message: `From (x, y) you may go to (x+y, y) or (x, x+y). Work backwards from (${tx}, ${ty}): the larger coordinate must have come from subtracting the smaller one, so the parent is unique.` }]
  while (tx > sx && ty > sy && tx !== ty) {
    if (tx > ty) {
      const old = tx
      tx %= ty
      frames.push({ phase: 'reverse', activeLine: 4, tx, ty, message: `tx = ${old} is larger than ty = ${ty}: undo many (x+y, y) steps at once with ${old} mod ${ty} = ${tx}.` })
    } else {
      const old = ty
      ty %= tx
      frames.push({ phase: 'reverse', activeLine: 6, tx, ty, message: `ty = ${old} is larger than tx = ${tx}: undo many (x, x+y) steps at once with ${old} mod ${tx} = ${ty}.` })
    }
  }
  let result, message, line
  if (tx === sx && ty === sy) { result = true; message = `Reached the start (${sx}, ${sy}).`; line = 8 }
  else if (tx === sx) { result = ty > sy && (ty - sy) % tx === 0; message = `x matches at ${tx}. Only y can still change, by multiples of x: need ty = ${ty} greater than sy = ${sy} and (${ty} - ${sy}) divisible by ${tx}: ${result}.`; line = 10 }
  else if (ty === sy) { result = tx > sx && (tx - sx) % ty === 0; message = `y matches at ${ty}. Only x can still change, by multiples of y: need tx = ${tx} greater than sx = ${sx} and (${tx} - ${sx}) divisible by ${ty}: ${result}.`; line = 12 }
  else { result = false; message = `Stopped at (${tx}, ${ty}) without matching either start coordinate (or tx = ty, which has no parent): unreachable.`; line = 13 }
  frames.push({ phase: 'finish', activeLine: line, tx, ty, message })
  frames.push({ phase: 'done', activeLine: line, tx, ty, message: `Answer: ${result}.` })
  return { input: { sx, sy, tx: tx0, ty: ty0 }, result, frames }
}
export const code = `def reachingPoints(sx, sy, tx, ty):
    while tx > sx and ty > sy and tx != ty:
        if tx > ty:
            tx %= ty
        else:
            ty %= tx
    if tx == sx and ty == sy:
        return True
    if tx == sx:
        return ty > sy and (ty - sy) % tx == 0
    if ty == sy:
        return tx > sx and (tx - sx) % ty == 0
    return False`.split('\n').map((text, index) => ({ line: index + 1, text }))
