import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = JSON.stringify({
  customers: [
    { customer_id: 1, customer_name: 'Ana', email: 'ana@x.io' },
    { customer_id: 2, customer_name: 'Ben', email: 'ben@x.io' },
    { customer_id: 3, customer_name: 'Cy', email: 'cy@x.io' },
  ],
  contacts: [
    { user_id: 1, contact_name: 'Ben', contact_email: 'ben@x.io' },
    { user_id: 1, contact_name: 'Zed', contact_email: 'zed@y.io' },
    { user_id: 2, contact_name: 'Ana', contact_email: 'ana@x.io' },
  ],
  invoices: [
    { invoice_id: 13, user_id: 3, price: 90 },
    { invoice_id: 11, user_id: 1, price: 50 },
    { invoice_id: 12, user_id: 2, price: 20 },
  ],
})

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  const phaseIds = phases.map(p => p.id)
  for (const f of run.frames) {
    assert.ok(phaseIds.includes(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('1364 sample gives hand-computed trusted contact counts', () => {
  const run = buildTrace(parseInput(sample))
  assert.deepEqual(run.result, [
    { invoice_id: 11, customer_name: 'Ana', price: 50, contacts_cnt: 2, trusted_contacts_cnt: 1 },
    { invoice_id: 12, customer_name: 'Ben', price: 20, contacts_cnt: 1, trusted_contacts_cnt: 1 },
    { invoice_id: 13, customer_name: 'Cy', price: 90, contacts_cnt: 0, trusted_contacts_cnt: 0 },
  ])
  checkFrames(run)
})

test('1364 a contact that matches no customer email is not trusted', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    customers: [{ customer_id: 1, customer_name: 'Ana', email: 'ana@x.io' }],
    contacts: [{ user_id: 1, contact_name: 'Q', contact_email: 'q@z.io' }],
    invoices: [{ invoice_id: 5, user_id: 1, price: 7 }],
  })))
  assert.deepEqual(run.result, [{ invoice_id: 5, customer_name: 'Ana', price: 7, contacts_cnt: 1, trusted_contacts_cnt: 0 }])
  checkFrames(run)
})

test('1364 rejects a contact whose user is not a customer', () => {
  assert.throws(() => parseInput(JSON.stringify({
    customers: [{ customer_id: 1, customer_name: 'A', email: 'a@x.io' }],
    contacts: [{ user_id: 9, contact_name: 'B', contact_email: 'b@x.io' }],
    invoices: [],
  })))
})
