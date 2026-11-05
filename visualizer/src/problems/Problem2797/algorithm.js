export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.bound) || !Array.isArray(input.call)) {
    throw new Error('Use an object with bound and call arrays, for example {"bound":[1,"_",3],"call":[2]}.')
  }
  const scalar = v => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean' || v === null
  if (input.bound.length > 6 || input.call.length > 6) throw new Error('bound and call hold at most 6 values each.')
  if (!input.bound.every(scalar) || !input.call.every(scalar)) throw new Error('Values are numbers, strings, booleans or null.')
  return { bound: input.bound, call: input.call }
}

export const code = `function partial(fn, args)
  RETURN function partialFn(...restArgs)
    out <- empty list, i <- 0
    for each a in args
      if a is "_", append restArgs[i] to out and move i forward
      else append a to out
    append every remaining restArgs[i..] to out
    RETURN fn(...out)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def partial(fn, args):
    def partial_fn(*rest_args):
        out, i = [], 0
        for a in args:
            if a == "_":
                out.append(rest_args[i])
                i += 1
            else:
                out.append(a)
        out.extend(rest_args[i:])
        return fn(*out)
    return partial_fn
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

// The function passed to partial returns the argument list it received, so the result shows the final call.
export function buildTrace({ bound, call }) {
  const frames = []
  const out = []
  let i = 0
  frames.push({ phase: 'setup', activeLine: CL('out <- empty list'), pythonLine: PL('out, i = [], 0'), bound, call, out: [], filled: -1, i, message: 'Start with an empty argument list and the first call argument.' })
  bound.forEach((a, j) => {
    if (a === '_') {
      out.push(call[i])
      frames.push({ phase: 'fill', activeLine: CL('if a is "_"'), pythonLine: PL('out.append(rest_args[i])'), bound, call, out: [...out], filled: j, i, message: `Placeholder ${j} takes call argument ${i}, which is ${JSON.stringify(call[i])}.` })
      i += 1
    } else {
      out.push(a)
      frames.push({ phase: 'keep', activeLine: CL('else append a'), pythonLine: PL('out.append(a)'), bound, call, out: [...out], filled: -1, i, message: `Position ${j} keeps its bound value ${JSON.stringify(a)}.` })
    }
  })
  for (; i < call.length; i++) {
    out.push(call[i])
    frames.push({ phase: 'rest', activeLine: CL('append every remaining'), pythonLine: PL('out.extend(rest_args[i:])'), bound, call, out: [...out], filled: -1, i, message: `Call argument ${i} is extra, so it goes to the end.` })
  }
  frames.push({ phase: 'done', activeLine: CL('RETURN fn'), pythonLine: PL('return fn(*out)'), bound, call, out: [...out], filled: -1, i, result: [...out], message: 'fn receives the final list as separate arguments.' })
  return { input: { bound, call }, result: [...out], frames }
}
