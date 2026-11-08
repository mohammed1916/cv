import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RainLandscapeView from './RainLandscapeView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Heights table of id and height rows',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n log n) to order the rows for the window functions, then O(n) work and O(n) space. This page draws up to 24 rows.',
  examples: [
    { label: 'Two pools', input: '{"Heights":[{"id":1,"height":4},{"id":2,"height":1},{"id":3,"height":2},{"id":4,"height":5},{"id":5,"height":0},{"id":6,"height":3},{"id":7,"height":1}]}' },
    { label: 'Shuffled rows', input: '{"Heights":[{"id":3,"height":0},{"id":1,"height":2},{"id":5,"height":3},{"id":2,"height":1},{"id":4,"height":1}]}' },
    { label: 'Nothing pools', input: '{"Heights":[{"id":1,"height":1},{"id":2,"height":3},{"id":3,"height":6},{"id":4,"height":2}]}' },
    { label: 'Single row', input: '{"Heights":[{"id":1,"height":0}]}' },
    { label: 'Equal heights', input: '{"Heights":[{"id":1,"height":2},{"id":2,"height":2},{"id":3,"height":2}]}' },
    { label: 'Tallest walls', input: '{"Heights":[{"id":1,"height":9},{"id":2,"height":0},{"id":3,"height":9}]}' },
    { label: 'Long run: 24 rows', input: '{"Heights":[{"id":1,"height":0},{"id":2,"height":3},{"id":3,"height":4},{"id":4,"height":3},{"id":5,"height":0},{"id":6,"height":3},{"id":7,"height":2},{"id":8,"height":1},{"id":9,"height":0},{"id":10,"height":5},{"id":11,"height":4},{"id":12,"height":3},{"id":13,"height":0},{"id":14,"height":1},{"id":15,"height":2},{"id":16,"height":1},{"id":17,"height":0},{"id":18,"height":1},{"id":19,"height":2},{"id":20,"height":3},{"id":21,"height":2},{"id":22,"height":5},{"id":23,"height":2},{"id":24,"height":3}]}' },
  ],
}

export default function CalculateTrappingRainWater() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <RainLandscapeView step={step} />} renderReasoning={() => <>
    <p>Water above a bar can only escape over the tallest bar on its left or the tallest bar on its right, so it rises to the lower of those two peaks and no higher.</p>
    <p>SQL has no pointers to move, but a running MAX window computes each peak for every row at once: one window ordered by id and one ordered by id descending.</p>
    <p>Each peak includes the row itself, so the level is never below the bar and the water on a row is never negative.</p>
  </>} />
}
