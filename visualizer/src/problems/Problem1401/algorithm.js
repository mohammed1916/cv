export const phases = [
  { id: 'start', label: 'Start', description: 'The circle overlaps the rectangle when some point of the rectangle lies within the radius of the centre.' },
  { id: 'clamp', label: 'Nearest point', description: 'Clamp the centre into the rectangle, then measure the squared distance to that nearest point.' },
  { id: 'done', label: 'Complete', description: 'Overlap is true when the squared distance is at most the squared radius.' },
]

export const examples = [
  { label: 'Touching the edge', input: '{"radius":1,"cx":0,"cy":0,"left":1,"bottom":-1,"right":2,"top":1}' },
  { label: 'Far away', input: '{"radius":1,"cx":0,"cy":0,"left":2,"bottom":2,"right":3,"top":3}' },
  { label: 'Touching the right edge', input: '{"radius":1,"cx":2,"cy":0,"left":-1,"bottom":-1,"right":1,"top":1}' },
]

export function parseInput(text) {
  const d = JSON.parse(text)
  const keys = ['radius', 'cx', 'cy', 'left', 'bottom', 'right', 'top']
  if (!d || typeof d !== 'object' || keys.some(k => !Number.isInteger(d[k]))) throw new Error('Use an object with integers radius, cx, cy, left, bottom, right and top.')
  if (d.radius < 1 || d.radius > 100) throw new Error('radius must be from 1 to 100 in this visualization.')
  if (d.left > d.right || d.bottom > d.top) throw new Error('The rectangle needs left <= right and bottom <= top.')
  return Object.fromEntries(keys.map(k => [k, d[k]]))
}

export function buildTrace(input) {
  const { radius, cx, cy, left, bottom, right, top } = input
  const snap = (extra = {}) => ({ radius, cx, cy, left, bottom, right, top, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const nx ='), pythonLine: P('nx = min'), snapshot: snap(),
    message: `Circle centre (${cx}, ${cy}), radius ${radius}; rectangle x ${left} to ${right}, y ${bottom} to ${top}.` }]
  const nx = Math.min(Math.max(cx, left), right)
  const ny = Math.min(Math.max(cy, bottom), top)
  const dist2 = (nx - cx) ** 2 + (ny - cy) ** 2
  frames.push({ phase: 'clamp', activeLine: L('const nx ='), pythonLine: P('nx = min'), snapshot: snap({ nx, ny, dist2 }),
    message: `The nearest rectangle point is (${nx}, ${ny}), at squared distance ${dist2} from the centre; the squared radius is ${radius * radius}.` })
  const result = dist2 <= radius * radius
  frames.push({ phase: 'done', activeLine: L('return dist2 <='), pythonLine: P('return dist2 <='), snapshot: snap({ nx, ny, dist2, result }),
    message: `${result ? 'The circle reaches the rectangle.' : 'The circle does not reach the rectangle.'} Return ${result}.`, result })
  return { input, result, frames }
}

export const code = `function checkOverlap(radius, xCenter, yCenter, x1, y1, x2, y2) {
  const nx = Math.min(Math.max(xCenter, x1), x2)
  const ny = Math.min(Math.max(yCenter, y1), y2)
  const dist2 = (nx - xCenter) ** 2 + (ny - yCenter) ** 2
  return dist2 <= radius * radius
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }

export const python = `def check_overlap(radius, x_center, y_center, x1, y1, x2, y2):
    nx = min(max(x_center, x1), x2)
    ny = min(max(y_center, y1), y2)
    dist2 = (nx - x_center) ** 2 + (ny - y_center) ** 2
    return dist2 <= radius * radius
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
