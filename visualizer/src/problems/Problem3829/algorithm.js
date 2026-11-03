const NAMES = ['addRider', 'addDriver', 'matchDriverWithRider', 'cancelRider']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.ops)) throw new Error('Use an object with an ops list.')
  if (input.ops.length < 1 || input.ops.length > 12) throw new Error('ops has 1 to 12 operations.')
  for (const op of input.ops) {
    if (!Array.isArray(op) || !NAMES.includes(op[0])) throw new Error('Each operation is addRider, addDriver, matchDriverWithRider or cancelRider.')
    const want = op[0] === 'matchDriverWithRider' ? 0 : 1
    if (op.length !== want + 1 || !op.slice(1).every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error(`${op[0]} takes ${want} integer id from 1 to 30.`)
  }
  return { ops: input.ops }
}

export function buildTrace({ ops }) {
  const riders = []
  const drivers = []
  const frames = []
  const results = []
  ops.forEach((op, k) => {
    const [name, id] = op
    let result = null
    let phase
    let message
    if (name === 'addRider') {
      riders.push(id)
      phase = 'rider'
      message = `Rider ${id} joins the back of the waiting line.`
    } else if (name === 'addDriver') {
      drivers.push(id)
      phase = 'driver'
      message = `Driver ${id} becomes available at the back.`
    } else if (name === 'matchDriverWithRider') {
      if (drivers.length && riders.length) {
        result = [drivers.shift(), riders.shift()]
        message = `Earliest driver ${result[0]} is matched with earliest rider ${result[1]}.`
      } else {
        result = [-1, -1]
        message = 'Nobody can be matched yet.'
      }
      phase = 'match'
    } else {
      const index = riders.indexOf(id)
      if (index >= 0) {
        riders.splice(index, 1)
        message = `Rider ${id} cancels a waiting request.`
      } else {
        message = `Rider ${id} is not waiting, so nothing changes.`
      }
      phase = 'cancel'
    }
    results.push(result)
    frames.push({ pythonLine: P(pythonMarker(name)), phase, activeLine: C(codeMarker(name)), at: k, op: name, result, results: [...results],
      riders: [...riders], drivers: [...drivers], message })
  })
  frames.push({ pythonLine: P('return [-1, -1]'), phase: 'done', activeLine: C('return the answers'), at: -1, op: '', result: null, results: [...results],
    riders: [...riders], drivers: [...drivers], message: 'All operations processed.' })
  return { input: { ops }, result: results, frames }
}

export function solve(ops) {
  return buildTrace({ ops }).result
}

function pythonMarker(name) {
  return { addRider: 'riders.append', addDriver: 'drivers.append', matchDriverWithRider: 'popleft', cancelRider: 'riders.remove' }[name]
}

function codeMarker(name) {
  return { addRider: 'addRider and addDriver', addDriver: 'addRider and addDriver', matchDriverWithRider: 'pairs the front', cancelRider: 'cancelRider removes' }[name]
}

export const code = `run the ride operations in arrival order
  keep two queues, one for riders and one for drivers
  addRider and addDriver join the back of their queue
  matchDriverWithRider pairs the front of each queue, or answers [-1, -1]
  cancelRider removes that rider only if the rider is still waiting
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `from collections import deque

class RideSharingSystem:
    def __init__(self):
        self.riders = deque()
        self.drivers = deque()

    def add_rider(self, rider_id):
        self.riders.append(rider_id)

    def add_driver(self, driver_id):
        self.drivers.append(driver_id)

    def match_driver_with_rider(self):
        if self.drivers and self.riders:
            return [self.drivers.popleft(), self.riders.popleft()]
        return [-1, -1]

    def cancel_rider(self, rider_id):
        if rider_id in self.riders:
            self.riders.remove(rider_id)
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
