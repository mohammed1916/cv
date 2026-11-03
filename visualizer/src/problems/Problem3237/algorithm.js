// LeetCode 3237: Alt and Tab Simulation.
// Windows are kept from most to least recent. Activating a window moves it to the front and keeps the
// order of all other windows. The draft gives no starting list, so this visualization starts with windows 1 to n in order.

const CODE_TEXT = [
  'FUNCTION altTab(windows, activations)',
  '    order ← windows 1 to windows, most recent first',
  '    FOR each window in activations',
  '        position ← index of window in order',
  '        remove the entry at position from order',
  '        insert window at the front of order',
  '    RETURN order',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

export const python = `def alt_tab_order(windows, activations):
    order = list(range(1, windows + 1))
    for window in activations:
        position = order.index(window)
        order.pop(position)
        order.insert(0, window)
    return order


if __name__ == "__main__":
    import json, sys
    data = json.loads(sys.stdin.read())
    print(alt_tab_order(data["windows"], data["activations"]))
`

const PY_LINES = python.split('\n')
const L = s => { const n = code.findIndex(c => c.text.includes(s)) + 1; if (!n) throw new Error(`Missing pseudocode line: ${s}`); return n }
const P = s => { const n = PY_LINES.findIndex(l => l.includes(s)) + 1; if (!n) throw new Error(`Missing Python line: ${s}`); return n }

export const phases = [
  { id: 'start', label: 'Order', description: 'Start with windows 1 to n in order.' },
  { id: 'find', label: 'Find', description: 'Locate the activated window.' },
  { id: 'move', label: 'Move', description: 'Move it to the front; the rest keep their order.' },
  { id: 'done', label: 'Result', description: 'Report the final window order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with windows and activations.')
  const { windows, activations } = input
  if (!Number.isInteger(windows) || windows < 1 || windows > 10) throw new Error('windows is an integer from 1 to 10.')
  if (!Array.isArray(activations) || activations.length > 30) throw new Error('activations is a list of up to 30 window ids.')
  if (!activations.every(w => Number.isInteger(w) && w >= 1 && w <= windows)) throw new Error('Each activation is a window id from 1 to windows.')
  return { windows, activations: activations.slice() }
}

export function buildTrace({ windows, activations }) {
  const order = Array.from({ length: windows }, (_, k) => k + 1)
  const frames = []
  const snap = extra => ({ windows, activations, order: order.slice(), ...extra })
  frames.push(snap({ phase: 'start', activeLine: L('order ← windows'), pythonLine: P('order = list(range'), window: null, from: -1, time: -1, message: `Windows 1 to ${windows} start in order, most recent first.` }))
  activations.forEach((window, time) => {
    const from = order.indexOf(window)
    frames.push(snap({ phase: 'find', activeLine: L('position ← index of window'), pythonLine: P('position = order.index'), window, from, time, message: `Activate window ${window}; it sits at position ${from}.` }))
    order.splice(from, 1)
    order.unshift(window)
    frames.push(snap({ phase: 'move', activeLine: L('insert window at the front'), pythonLine: P('order.insert(0, window)'), window, from, time, message: `Window ${window} moves to the front; the other windows keep their order.` }))
  })
  frames.push(snap({ phase: 'done', activeLine: L('RETURN order'), pythonLine: P('return order'), window: null, from: -1, time: activations.length - 1, message: `Final order: ${order.join(', ')}.` }))
  return { input: { windows, activations }, result: order.slice(), frames }
}
