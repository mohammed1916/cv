export function parseInput(text) {
  const input = JSON.parse(text)
  const { buses, passengers, capacity } = input ?? {}
  const inRange = v => Number.isInteger(v) && v >= 2 && v <= 100
  if (!Array.isArray(buses) || buses.length < 1 || buses.length > 10 || buses.some(b => !inRange(b))) throw new Error('buses is 1 to 10 departure times from 2 to 100.')
  if (!Array.isArray(passengers) || passengers.length < 1 || passengers.length > 20 || passengers.some(p => !inRange(p))) throw new Error('passengers is 1 to 20 arrival times from 2 to 100.')
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 5) throw new Error('capacity is an integer from 1 to 5.')
  return { buses, passengers, capacity }
}

export function buildTrace(input) {
  const { capacity } = input
  const buses = [...input.buses].sort((a, b) => a - b)
  const passengers = [...input.passengers].sort((a, b) => a - b)
  const frames = [{ phase: 'start', activeLine: L('sort the buses'), bus: null, boarded: 0, answer: null, message: 'Sort the buses and the passengers by time.' }]
  let next = 0
  let load = 0
  for (const bus of buses) {
    load = 0
    while (next < passengers.length && passengers[next] <= bus && load < capacity) {
      next++
      load++
    }
    frames.push({ phase: 'bus', activeLine: L('for each bus in order'), bus, boarded: next, load, answer: null, message: `Bus ${bus} boards ${load} passenger(s) of capacity ${capacity}.` })
  }
  const lastBus = buses[buses.length - 1]
  let answer
  if (load < capacity) {
    answer = lastBus
    frames.push({ phase: 'answer', activeLine: L('set answer to the last bus time'), bus: lastBus, boarded: next, load, answer, message: `The last bus has a free seat, so the bus time ${answer} is the first candidate.` })
  } else {
    answer = passengers[next - 1] - 1
    frames.push({ phase: 'answer', activeLine: L('set answer to the last boarded'), bus: lastBus, boarded: next, load, answer, message: `The last bus is full, so you must arrive before passenger ${passengers[next - 1]}: first candidate ${answer}.` })
  }
  while (next > 0 && passengers[next - 1] >= answer) {
    if (passengers[next - 1] === answer) {
      answer--
      frames.push({ phase: 'step', activeLine: L('if that passenger is exactly answer'), bus: lastBus, boarded: next, load, answer, message: `A passenger arrives at that minute, so step back to ${answer}.` })
    } else {
      frames.push({ phase: 'scan', activeLine: L('while the boarded passenger'), bus: lastBus, boarded: next, load, answer, message: `Passenger ${passengers[next - 1]} arrives after ${answer}, so no clash here.` })
    }
    next--
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), bus: null, boarded: next, load, answer, message: `Latest arrival time that still boards: ${answer}.` })
  return { input, sortedPassengers: passengers, result: answer, frames }
}

export const code = `latest time you can arrive and still board the last bus
  sort the buses and the passengers in ascending order
  set next to zero and set last load to zero
  for each bus in order
    set last load to zero
    while the next passenger arrived by this bus and last load is below capacity board that passenger
  if last load is below capacity then set answer to the last bus time
  otherwise set answer to the last boarded passenger time minus one
  while the boarded passenger just before next is not earlier than answer
    if that passenger is exactly answer then step answer back by one
    move next back by one
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def latest_time_catch_bus(buses, passengers, capacity):
    buses = sorted(buses)
    passengers = sorted(passengers)
    nxt = 0
    load = 0
    for bus in buses:
        load = 0
        while nxt < len(passengers) and passengers[nxt] <= bus and load < capacity:
            nxt += 1
            load += 1
    if load < capacity:
        answer = buses[-1]
    else:
        answer = passengers[nxt - 1] - 1
    while nxt > 0 and passengers[nxt - 1] >= answer:
        if passengers[nxt - 1] == answer:
            answer -= 1
        nxt -= 1
    return answer
`
