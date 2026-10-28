export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with a target key.')
  const { target } = input
  if (typeof target !== 'string' || target.length < 1 || target.length > 5 || !/^[a-z]+$/.test(target)) {
    throw new Error('target is 1 to 5 lowercase letters.')
  }
  return { target }
}

export function buildTrace(input) {
  const { target } = input
  let screen = ''
  const screens = []
  const frames = [{ phase: 'start', activeLine: L('set screen to an empty string'), char: '', screen, screens: [], message: `Type ${target} using key 1 (append a) and key 2 (advance the last letter).` }]
  for (const ch of target) {
    screen += 'a'
    screens.push(screen)
    frames.push({ phase: 'append', activeLine: L('append an a to the screen'), char: ch, screen, screens: screens.slice(), message: `Press key 1: the screen shows ${screen}.` })
    const steps = ch.charCodeAt(0) - 97
    for (let s = 0; s < steps; s++) {
      screen = screen.slice(0, -1) + String.fromCharCode(screen.charCodeAt(screen.length - 1) + 1)
      screens.push(screen)
      frames.push({ phase: 'advance', activeLine: L('change the last character'), char: ch, screen, screens: screens.slice(), message: `Press key 2: the screen shows ${screen}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the recorded screens'), char: '', screen, screens: screens.slice(), message: `${screens.length} screens were shown.` })
  return { input, result: screens, frames }
}

export const code = `list every screen while typing the target:
  set screen to an empty string and screens to an empty list
  for each character of the target
    append an a to the screen and record it
    repeat (alphabet position of the character) times
      change the last character of the screen to the next letter and record it
  return the recorded screens`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def screens_on_display(target):
    screen = ''
    screens = []
    for ch in target:
        screen += 'a'
        screens.append(screen)
        for _ in range(ord(ch) - ord('a')):
            screen = screen[:-1] + chr(ord(screen[-1]) + 1)
            screens.append(screen)
    return screens
`
