import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { buildTrace, parseInput, examples, phases, code, python, sql, BUDGET } from './algorithm.js'

const c = (employee_id, experience, salary) => ({ employee_id, experience, salary })
const solve = rows => buildTrace({ Candidates: rows }).result

test('2010 hand-computed tables', () => {
  // Seniors 21000 + 33000 = 54000; 41000 does not fit in 16000. Juniors 6000 + 9000 leave 1000.
  assert.deepEqual(solve(JSON.parse(examples[0].input).Candidates), [104, 106, 103, 107])
  // No senior fits; junior 30000 leaves 40000, too little for 45000.
  assert.deepEqual(solve(JSON.parse(examples[1].input).Candidates), [204])
  // Seniors use exactly 70000, which is allowed, and leave nothing for a junior.
  assert.deepEqual(solve(JSON.parse(examples[2].input).Candidates), [302, 301])
  assert.deepEqual(solve([]), [])
  assert.deepEqual(solve([c(1, 'Junior', 70000)]), [1])
  assert.deepEqual(solve([c(1, 'Junior', 70001)]), [])
})

test('2010 an expensive senior stops later seniors but juniors still get a turn', () => {
  const { frames, result } = buildTrace({ Candidates: [c(1, 'Senior', 69000), c(2, 'Senior', 2000), c(3, 'Junior', 1000), c(4, 'Junior', 3000)] })
  // Cheapest first: 2000 then 69000 = 71000 fails. Left 68000 buys both juniors.
  assert.deepEqual(result, [2, 3, 4])
  assert.equal(frames.filter(f => f.phase === 'stop').length, 1)
  assert.equal(frames.at(-1).seniors.find(e => e.employee_id === 1).status, 'unaffordable')
})

function bruteForce(rows) {
  let remaining = BUDGET
  const hired = []
  for (const level of ['Senior', 'Junior']) {
    const pool = rows.filter(r => r.experience === level)
    // Take the cheapest remaining candidate each round; no sort involved.
    while (pool.length) {
      const min = pool.reduce((a, b) => (b.salary < a.salary ? b : a))
      if (min.salary > remaining) break
      remaining -= min.salary
      hired.push(min.employee_id)
      pool.splice(pool.indexOf(min), 1)
    }
  }
  return hired
}

function randomTables(count) {
  let seed = 2010
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % n }
  const tables = []
  for (let t = 0; t < count; t++) {
    const used = new Set()
    const rows = []
    const size = rnd(11)
    for (let i = 0; i < size; i++) {
      let salary = 1000 * (1 + rnd(50))
      while (used.has(salary)) salary += 1000
      used.add(salary)
      rows.push(c(i + 1, rnd(2) ? 'Senior' : 'Junior', salary))
    }
    tables.push(rows)
  }
  return tables
}

test('2010 random tables match a cheapest-first simulation', () => {
  for (const rows of randomTables(400)) assert.deepEqual(solve(rows), bruteForce(rows), JSON.stringify(rows))
})

test('2010 the published SQL returns the same ids as the trace', () => {
  const db = new DatabaseSync(':memory:')
  db.exec('CREATE TABLE Candidates (employee_id INT, experience TEXT, salary INT)')
  const insert = db.prepare('INSERT INTO Candidates VALUES (?, ?, ?)')
  const query = db.prepare(sql)
  const tables = [...randomTables(150), ...examples.map(e => JSON.parse(e.input).Candidates)]
  for (const rows of tables) {
    db.exec('DELETE FROM Candidates')
    for (const r of rows) insert.run(r.employee_id, r.experience, r.salary)
    const fromSql = query.all().map(r => r.employee_id).sort((a, b) => a - b)
    assert.deepEqual(fromSql, [...solve(rows)].sort((a, b) => a - b), JSON.stringify(rows))
  }
  db.close()
})

test('2010 parseInput rejects rows outside the schema', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"Candidates":[{"employee_id":1,"experience":"Lead","salary":5}]}'))
  assert.throws(() => parseInput('{"Candidates":[{"employee_id":1,"experience":"Senior","salary":5},{"employee_id":2,"experience":"Junior","salary":5}]}'))
  assert.throws(() => parseInput('{"Candidates":[{"employee_id":1,"experience":"Senior","salary":5},{"employee_id":1,"experience":"Junior","salary":6}]}'))
})

test('2010 examples parse and frames are well formed', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyCount = python.trim().split('\n').length
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const { frames } = buildTrace(parseInput(example.input))
    let spent = 0
    for (const f of frames) {
      assert.ok(ids.has(f.phase), f.phase)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyCount)
      assert.ok(f.message.length > 0)
      assert.equal(f.spent + f.remaining, BUDGET)
      assert.ok(f.spent >= spent, 'spending never falls')
      spent = f.spent
      assert.ok(f.remaining >= 0)
      assert.equal(f.paid.reduce((sum, e) => sum + e.salary, 0), f.spent)
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
})
