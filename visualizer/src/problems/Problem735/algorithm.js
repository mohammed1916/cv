export function parseInput(text) {
  const asteroids = JSON.parse(text)
  if (!Array.isArray(asteroids) || asteroids.length < 1 || asteroids.length > 200 || asteroids.some(v => !Number.isInteger(v) || v === 0 || Math.abs(v) > 1000)) throw new Error('Enter 1–200 non-zero integers with |v| ≤ 1,000 (sign gives direction).')
  return asteroids
}

// Stack of survivors moving right. A left-mover meets the stack top; the smaller one explodes (equal: both).
export function buildTrace(asteroids) {
  const stack = []
  const frames = [{ phase: 'start', index: -1, stack: [], activeLine: 2, message: 'Asteroids moving right wait on the stack.' }]
  asteroids.forEach((a, i) => {
    let alive = true
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1]
      if (top < -a) { stack.pop(); frames.push({ phase: 'explode', index: i, value: a, stack: [...stack], activeLine: 7, message: `${-a} meets ${top}: the smaller right-mover explodes.` }) }
      else if (top === -a) { stack.pop(); alive = false; frames.push({ phase: 'both', index: i, value: a, stack: [...stack], activeLine: 8, message: `${-a} and ${top} are equal: both explode.` }) }
      else { alive = false; frames.push({ phase: 'explode', index: i, value: a, stack: [...stack], activeLine: 9, message: `${-a} is smaller than ${top}: it explodes.` }) }
    }
    if (alive) { stack.push(a); frames.push({ phase: 'push', index: i, value: a, stack: [...stack], activeLine: 11, message: `${a} survives this step.` }) }
  })
  frames.push({ phase: 'done', index: asteroids.length - 1, stack: [...stack], result: stack, activeLine: 13, message: `Survivors: [${stack.join(', ')}].` })
  return { input: asteroids, result: stack, frames }
}

export const code = `def asteroidCollision(asteroids):
    stack = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a: stack.pop()
            elif stack[-1] == -a: stack.pop(); alive = False
            else: alive = False
        if alive: stack.append(a)
    return stack`.split('\n').map((text, index) => ({ line: index + 1, text }))
