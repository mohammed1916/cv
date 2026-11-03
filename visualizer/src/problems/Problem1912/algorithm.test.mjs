import test from 'node:test'
import assert from 'node:assert/strict'
import { MovieRentingSystem } from './algorithm.js'

const sample = () => new MovieRentingSystem(3, [[0, 4, 8], [0, 5, 9], [1, 4, 6], [2, 4, 2]])

test('1912 search orders unrented copies by price then shop', () => {
  const sys = sample()
  assert.deepEqual(sys.search(4), [2, 1, 0])
  assert.deepEqual(sys.search(9), [])
})

test('1912 rent removes a copy from search and adds it to report', () => {
  const sys = sample()
  sys.rent(2, 4)
  assert.deepEqual(sys.search(4), [1, 0])
  assert.deepEqual(sys.report(), [[2, 4]])
})

test('1912 drop returns the copy to search and removes it from report', () => {
  const sys = sample()
  sys.rent(2, 4)
  sys.drop(2, 4)
  assert.deepEqual(sys.report(), [])
  assert.deepEqual(sys.search(4), [2, 1, 0])
})

test('1912 report sorts rented copies by price, shop and movie', () => {
  const sys = new MovieRentingSystem(4, [[0, 1, 5], [1, 1, 5], [0, 2, 5], [3, 1, 2]])
  sys.rent(1, 1)
  sys.rent(0, 2)
  sys.rent(3, 1)
  assert.deepEqual(sys.report(), [[3, 1], [0, 2], [1, 1]])
})

test('1912 search returns at most five shops', () => {
  const entries = [0, 1, 2, 3, 4, 5].map(s => [s, 7, 10 - s])
  assert.deepEqual(new MovieRentingSystem(6, entries).search(7), [5, 4, 3, 2, 1])
})
