const NAMES = ['pushFront', 'pushMiddle', 'pushBack', 'popFront', 'popMiddle', 'popBack']

export function parseInput(text) {
  const ops = JSON.parse(text)
  if (!Array.isArray(ops) || ops.length < 1 || ops.length > 40) throw new Error('Use 1 to 40 operations, each like ["pushMiddle", 7] or ["popFront"].')
  for (const op of ops) {
    if (!Array.isArray(op) || !NAMES.includes(op[0])) throw new Error(`Unknown operation ${JSON.stringify(op)}. Use pushFront, pushMiddle, pushBack, popFront, popMiddle or popBack.`)
    if (op[0].startsWith('push')) {
      if (op.length !== 2 || !Number.isInteger(op[1]) || op[1] < 1 || op[1] > 99) throw new Error('Push operations take one integer value from 1 to 99.')
    } else if (op.length !== 1) throw new Error('Pop operations take no value.')
  }
  return ops
}

export function buildTrace(ops) {
  // front holds floor(n / 2) items and back holds the rest, so the middle sits at the seam.
  const front = []
  const back = []
  const size = () => front.length + back.length
  const rebalance = () => {
    const target = Math.floor(size() / 2)
    while (front.length > target) back.unshift(front.pop())
    while (front.length < target) front.push(back.shift())
  }
  const results = []
  const frames = [{ phase: 'start', activeLine: L('design a queue'), front: [], back: [], results: [], message: 'Start with an empty queue. The front half holds floor(n / 2) items.' }]
  for (const [name, value] of ops) {
    let out = null
    let message
    if (name === 'pushFront') { front.unshift(value); message = `Push ${value} to the front.` }
    else if (name === 'pushMiddle') { front.push(value); message = `Push ${value} to the middle, at the end of the front half.` }
    else if (name === 'pushBack') { back.push(value); message = `Push ${value} to the back.` }
    else if (size() === 0) { out = -1; message = `${name} on an empty queue returns -1.` }
    else if (name === 'popFront') {
      out = front.length ? front.shift() : back.shift()
      message = `Pop ${out} from the front.`
    } else if (name === 'popBack') {
      out = back.length ? back.pop() : front.pop()
      message = `Pop ${out} from the back.`
    } else {
      out = size() % 2 === 0 ? front.pop() : back.shift()
      message = `Pop ${out} from the middle.`
    }
    if (out !== null && name.startsWith('pop')) results.push(out)
    rebalance()
    frames.push({ phase: name.startsWith('push') ? 'push' : 'pop', activeLine: L(`${name}:`), front: [...front], back: [...back], results: [...results], message: `${message} Rebalance so the front half holds ${Math.floor(size() / 2)}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return results'), front: [...front], back: [...back], results: [...results], message: `Popped values: [${results.join(', ')}].` })
  return { input: ops, result: results, frames }
}

export const code = `design a queue that supports front, middle and back operations
keep the front half and the back half as two deques
keep the front half at floor(n / 2) items
pushFront: place the value at the front of the front half
pushMiddle: append the value to the end of the front half
pushBack: append the value to the end of the back half
popFront: remove from the front half, or from the back half if the front half is empty
popMiddle: remove the last front item when n is even, else the first back item
popBack: remove the last item of the back half
rebalance halves so the front half holds floor(n / 2) items
pop operations return -1 when the queue is empty
return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def front_middle_back(operations):
    front = deque()
    back = deque()
    results = []

    def rebalance():
        target = (len(front) + len(back)) // 2
        while len(front) > target:
            back.appendleft(front.pop())
        while len(front) < target:
            front.append(back.popleft())

    for name, *args in operations:
        if name == 'pushFront':
            front.appendleft(args[0])
        elif name == 'pushMiddle':
            front.append(args[0])
        elif name == 'pushBack':
            back.append(args[0])
        elif len(front) + len(back) == 0:
            results.append(-1)
            continue
        elif name == 'popFront':
            results.append(front.popleft() if front else back.popleft())
        elif name == 'popBack':
            results.append(back.pop() if back else front.pop())
        else:
            results.append(front.pop() if (len(front) + len(back)) % 2 == 0 else back.popleft())
        rebalance()
    return results
`
