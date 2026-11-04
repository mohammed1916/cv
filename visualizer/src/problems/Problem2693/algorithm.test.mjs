import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, FUNCTIONS, show } from './algorithm.js'

const run = (fn, args) => buildTrace(parseInput(JSON.stringify({ fn, args })))

test('2693 hand-computed cases', () => {
  assert.equal(run('discount', [{ price: 80 }, 0.25]).result, 60)
  assert.equal(run('badge', [{ name: 'Mira' }, '<', '>']).result, '<Mira>')
  assert.equal(run('bump', [{ hits: 3 }, 4]).result, 7)
  assert.equal(run('keyCount', [{ red: 1, blue: 2 }]).result, 2)
  assert.equal(run('lastItem', [[5, 6, 9]]).result, 9)
})

test('2693 edge cases', () => {
  assert.equal(run('readOwner', [{ city: 'Oslo' }]).result, undefined)
  assert.equal(run('keyCount', [{}]).result, 0)
  assert.equal(run('lastItem', [[]]).result, undefined)
  assert.equal(run('keyCount', [{ fn: 1, key: 2 }]).result, 2, 'keys that look like a temporary name are safe')
  assert.equal(run('readOwner', [{ owner: null }]).result, null)
  assert.ok(Number.isNaN(run('discount', [{ price: 80 }]).result), 'a missing argument is undefined inside the function')
  assert.equal(run('discount', [{ price: 80 }, 0.5, 'ignored']).result, 40, 'extra arguments are ignored')
})

test('2693 parseInput rejects bad input', () => {
  const bad = obj => assert.throws(() => parseInput(JSON.stringify(obj)))
  bad({ fn: 'nope', args: [{}] })
  bad({ fn: 'toString', args: [{}] })
  bad({ fn: 'discount', args: [] })
  bad({ fn: 'discount', args: [null] })
  bad({ fn: 'discount', args: [5] })
  bad({ fn: 'discount', args: ['text'] })
  assert.throws(() => parseInput('[]'))
})

test('2693 the result matches the built-in, and the caller input is untouched', () => {
  const cases = [
    ['discount', [{ price: 12 }, 0.5]], ['badge', [{ name: 'Teo' }, '[', ']']], ['bump', [{ hits: 10 }, -3]],
    ['keyCount', [{ a: 1 }]], ['lastItem', [[7, 8]]], ['readOwner', [{ owner: 'Ana' }]],
  ]
  for (const [fn, args] of cases) {
    const before = JSON.stringify(args)
    const oracleContext = JSON.parse(JSON.stringify(args[0]))
    const expected = Reflect.apply(FUNCTIONS[fn].run, oracleContext, args.slice(1))
    assert.deepEqual(run(fn, args).result, expected, fn)
    assert.equal(JSON.stringify(args), before)
  }
})

test('2693 the temporary key exists only between attach and removal', () => {
  const { frames } = run('bump', [{ hits: 3 }, 4])
  const hasKey = frame => frame.contextRows.some(row => row.temporary)
  const first = frames.findIndex(hasKey)
  const last = frames.length - 1 - [...frames].reverse().findIndex(hasKey)
  assert.equal(frames[first].phase, 'attach')
  assert.equal(frames[last + 1].phase, 'remove')
  assert.ok(frames.slice(first, last + 1).every(hasKey))
  assert.ok(frames.slice(last + 1).every(frame => !hasKey(frame)))
})

test('2693 changes made through this stay on the object after cleanup', () => {
  const { frames } = run('bump', [{ hits: 3 }, 4])
  assert.deepEqual(frames.at(-1).contextRows, [{ key: 'hits', value: '7', temporary: false }])
  assert.deepEqual(frames.filter(frame => frame.phase === 'body').slice(0, 3).map(frame => frame.reads.at(-1)), [
    'this.hits is 3', 'this.hits changes from 3 to 7', 'this.hits is 7',
  ])
})

test('2693 the Symbol key is hidden from Object.keys', () => {
  const { frames } = run('keyCount', [{ red: 1 }])
  const body = frames.find(frame => frame.phase === 'body')
  assert.ok(body.contextRows.some(row => row.temporary), 'the key is really there during the body')
  assert.equal(body.reads[0], 'Object.keys(this) sees ["red"]; the symbol key stays hidden')
})

test('2693 frames are well formed and this is bound only during the body', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const pyCount = python.split('\n').length
  for (const [fn, args] of [['discount', [{ price: 1 }, 1]], ['badge', [{ name: 'A' }, 'b', 'c']], ['bump', [{ hits: 0 }, 1]], ['keyCount', [{}]], ['lastItem', [[1]]], ['readOwner', [{}]]]) {
    const { frames, result } = run(fn, args)
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(frames.at(-1).returned, result)
    assert.equal(frames[0].plainFailure !== null, true, `${fn} needs an object for this`)
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
      assert.equal(frame.thisValue === 'context', frame.stack.includes(fn), frame.phase)
    }
  }
})

test('2693 show covers values JSON cannot express', () => {
  assert.equal(show(undefined), 'undefined')
  assert.equal(show(NaN), 'NaN')
  assert.equal(show('a'), '"a"')
})
