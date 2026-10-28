import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

const EXAMPLE = '{"operations":[["checkIn",45,"Leyton",3],["checkIn",32,"Paradise",8],["checkIn",27,"Leyton",10],["checkOut",45,"Waterloo",15],["checkOut",27,"Waterloo",20],["checkOut",32,"Cambridge",22],["getAverageTime","Paradise","Cambridge"],["getAverageTime","Leyton","Waterloo"],["checkIn",10,"Leyton",24],["getAverageTime","Leyton","Waterloo"],["checkOut",10,"Waterloo",38],["getAverageTime","Leyton","Waterloo"]]}'

test('1396 official example', () => {
  assert.deepEqual(solve(EXAMPLE), [null, null, null, null, null, null, 14, 11, null, 11, null, 12])
})

test('1396 an average uses every finished trip on the route, not only the last one', () => {
  const text = '{"operations":[["checkIn",1,"Ab",1],["checkOut",1,"Cd",5],["checkIn",2,"Ab",6],["checkOut",2,"Cd",8],["getAverageTime","Ab","Cd"]]}'
  assert.deepEqual(solve(text).at(-1), 3)
})

test('1396 rejects a check-out with no open check-in', () => {
  assert.throws(() => parseInput('{"operations":[["checkOut",1,"Ab",3]]}'), /no open check-in/)
})

test('1396 rejects an average before any trip on that route finished', () => {
  assert.throws(() => parseInput('{"operations":[["checkIn",1,"Ab",1],["getAverageTime","Ab","Cd"]]}'), /no finished trip/)
})

// Independent oracle: keep a plain list of finished trips and scan it for every average.
function oracle(ops) {
  const open = new Map(), trips = []
  return ops.map(([name, ...a]) => {
    if (name === 'checkIn') {
      open.set(a[0], { station: a[1], time: a[2] })
      return null
    }
    if (name === 'checkOut') {
      const start = open.get(a[0])
      open.delete(a[0])
      trips.push({ from: start.station, to: a[1], took: a[2] - start.time })
      return null
    }
    const matching = trips.filter(trip => trip.from === a[0] && trip.to === a[1])
    return matching.reduce((sum, trip) => sum + trip.took, 0) / matching.length
  })
}

test('1396 random sequences match a list-scan oracle', () => {
  let seed = 1396
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const stations = ['Ab', 'Cd', 'Ef']
  for (let round = 0; round < 200; round++) {
    const ops = [], open = new Map(), finished = []
    let time = 1, nextId = 1
    const steps = 3 + rnd(12)
    for (let i = 0; i < steps; i++) {
      time += 1 + rnd(4)
      const roll = rnd(10)
      if (open.size && roll < 4) {
        const id = [...open.keys()][rnd(open.size)]
        const end = stations[rnd(3)]
        ops.push(['checkOut', id, end, time])
        finished.push([open.get(id), end])
        open.delete(id)
      } else if (finished.length && roll < 6) {
        const [from, to] = finished[rnd(finished.length)]
        ops.push(['getAverageTime', from, to])
      } else {
        const station = stations[rnd(3)]
        ops.push(['checkIn', nextId, station, time])
        open.set(nextId, station)
        nextId++
      }
    }
    const text = JSON.stringify({ operations: ops })
    assert.deepEqual(solve(text), oracle(ops), text)
  }
})
