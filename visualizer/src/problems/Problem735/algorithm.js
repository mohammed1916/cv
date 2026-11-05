// The input box takes an object with asteroids, as the scan-family visualizer does.
export function parseInput(text) {
  const asteroids = JSON.parse(text)?.asteroids
  if (!Array.isArray(asteroids) || asteroids.length < 1 || asteroids.length > 200 || asteroids.some(v => !Number.isInteger(v) || v === 0 || Math.abs(v) > 1000)) throw new Error('Enter 1–200 non-zero integers with |v| ≤ 1,000 (sign gives direction).')
  return asteroids
}

const JS_LINES = [
  'function asteroidCollision(asteroids) {',
  '  const stack = [] // survivors that are still moving right',
  '  for (const a of asteroids) {',
  '    let alive = true',
  '    while (alive && a < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {',
  '      const top = stack[stack.length - 1]',
  '      if (top < -a) stack.pop() // the right-mover is smaller: it explodes and we keep checking',
  '      else if (top === -a) { stack.pop(); alive = false } // equal sizes: both explode',
  '      else alive = false // the left-mover is smaller: it explodes',
  '    }',
  '    if (alive) stack.push(a) // a survives this round',
  '  }',
  '  return stack',
  '}',
]
const PY_LINES = [
  'def asteroid_collision(asteroids):',
  '    stack = []',
  '    for a in asteroids:',
  '        alive = True',
  '        while alive and a < 0 and stack and stack[-1] > 0:',
  '            top = stack[-1]',
  '            if top < -a:',
  '                stack.pop()',
  '            elif top == -a:',
  '                stack.pop()',
  '                alive = False',
  '            else:',
  '                alive = False',
  '        if alive:',
  '            stack.append(a)',
  '    return stack',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Stack of survivors moving right. A left-mover meets the stack top; the smaller one explodes (equal: both).
export function buildTrace(asteroids) {
  const stack = []
  const frames = [{ phase: 'start', index: -1, stack: [], activeLine: L('const stack'), pythonLine: P('stack = []'), message: 'Asteroids moving right wait on the stack.' }]
  asteroids.forEach((a, i) => {
    let alive = true
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1]
      if (top < -a) { stack.pop(); frames.push({ phase: 'explode', index: i, value: a, stack: [...stack], activeLine: L('the right-mover is smaller'), pythonLine: P('stack.pop()'), message: `${-a} meets ${top}: the smaller right-mover explodes, so we keep checking.` }) }
      else if (top === -a) { stack.pop(); alive = false; frames.push({ phase: 'both', index: i, value: a, stack: [...stack], activeLine: L('equal sizes'), pythonLine: P('alive = False'), message: `${-a} and ${top} are equal: both explode.` }) }
      else { alive = false; frames.push({ phase: 'explode', index: i, value: a, stack: [...stack], activeLine: L('the left-mover is smaller'), pythonLine: P('else:'), message: `${-a} is smaller than ${top}: it explodes.` }) }
    }
    if (alive) { stack.push(a); frames.push({ phase: 'push', index: i, value: a, stack: [...stack], activeLine: L('a survives this round'), pythonLine: P('stack.append(a)'), message: `${a} survives this round.` }) }
  })
  frames.push({ phase: 'done', index: asteroids.length - 1, stack: [...stack], result: stack, activeLine: L('return stack'), pythonLine: P('return stack'), message: `Survivors: [${stack.join(', ')}].` })
  return { input: asteroids, result: stack, frames }
}
