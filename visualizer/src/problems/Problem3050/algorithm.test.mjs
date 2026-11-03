import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('3050 sample builds ten pizzas in the required order', () => {
  const trace = run('{"Toppings":[{"topping_name":"Dates","cost":4},{"topping_name":"Anchovy","cost":2},{"topping_name":"Eggplant","cost":2.5},{"topping_name":"Corn","cost":3},{"topping_name":"Basil","cost":1}]}')
  checkFrames(trace)
  assert.equal(trace.result.length, 10)
  assert.deepEqual(trace.result.slice(0, 3), [
    { pizza: 'Corn,Dates,Eggplant', total_cost: 9.5 },
    { pizza: 'Anchovy,Corn,Dates', total_cost: 9 },
    { pizza: 'Anchovy,Dates,Eggplant', total_cost: 8.5 },
  ])
  assert.deepEqual(trace.result.slice(4, 6), [
    { pizza: 'Anchovy,Corn,Eggplant', total_cost: 7.5 },
    { pizza: 'Basil,Dates,Eggplant', total_cost: 7.5 },
  ])
  assert.deepEqual(trace.result.at(-1), { pizza: 'Anchovy,Basil,Eggplant', total_cost: 5.5 })
})

test('3050 three toppings give exactly one pizza', () => {
  const trace = run('{"Toppings":[{"topping_name":"Pepper","cost":1},{"topping_name":"Onion","cost":2},{"topping_name":"Ham","cost":3}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ pizza: 'Ham,Onion,Pepper', total_cost: 6 }])
})

test('3050 fewer than three toppings give no pizzas', () => {
  const trace = run('{"Toppings":[{"topping_name":"Pepper","cost":1},{"topping_name":"Onion","cost":2}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})
