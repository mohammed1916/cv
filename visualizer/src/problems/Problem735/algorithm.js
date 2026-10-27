// The input box takes an object with asteroids, as the scan-family visualizer does.
export function parseInput(text) {
  const asteroids = JSON.parse(text)?.asteroids
  if (!Array.isArray(asteroids) || asteroids.length < 1 || asteroids.length > 200 || asteroids.some(v => !Number.isInteger(v) || v === 0 || Math.abs(v) > 1000)) throw new Error('Enter 1–200 non-zero integers with |v| ≤ 1,000 (sign gives direction).')
  return asteroids
}

// Stack of survivors moving right. A left-mover meets the stack top; the smaller one explodes (equal: both).
export function buildTrace(asteroids) {
  const stack = []
  const frames = [{ phase: 'start', index: -1, stack: [], activeLine: 1, message: 'Asteroids moving right wait on the stack.' }]
  asteroids.forEach((a, i) => {
    let alive = true
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1]
      if (top < -a) { stack.pop(); frames.push({ phase: 'explode', index: i, value: a, stack: [...stack], activeLine: 5, message: `${-a} meets ${top}: the smaller right-mover explodes.` }) }
      else if (top === -a) { stack.pop(); alive = false; frames.push({ phase: 'both', index: i, value: a, stack: [...stack], activeLine: 6, message: `${-a} and ${top} are equal: both explode.` }) }
      else { alive = false; frames.push({ phase: 'explode', index: i, value: a, stack: [...stack], activeLine: 7, message: `${-a} is smaller than ${top}: it explodes.` }) }
    }
    if (alive) { stack.push(a); frames.push({ phase: 'push', index: i, value: a, stack: [...stack], activeLine: 8, message: `${a} survives this step.` }) }
  })
  frames.push({ phase: 'done', index: asteroids.length - 1, stack: [...stack], result: stack, activeLine: 9, message: `Survivors: [${stack.join(', ')}].` })
  return { input: asteroids, result: stack, frames }
}

export const code = `set stack to an empty list of survivors
for each asteroid a in order
  set alive to true
  while alive, a moves left, and the top of stack moves right
    if the top is smaller than a's size, pop the top and keep checking
    otherwise if the sizes are equal, pop the top and set alive to false
    otherwise set alive to false, because a is smaller and explodes
  if alive, push a onto stack
return stack`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The scan-family visualizer reports its own step numbers (1 setup, 2 check, 4 update, 5 return).
// This maps them onto the pseudocode lines above.
export const LINE_MAP = { 1: 1, 3: 2, 4: 4, 5: 9 }

export const python = `def asteroid_collision(asteroids):
    stack = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:
                stack.pop()
            elif stack[-1] == -a:
                stack.pop()
                alive = False
            else:
                alive = False
        if alive:
            stack.append(a)
    return stack`
