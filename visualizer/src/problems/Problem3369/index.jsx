import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TrackerView from './TrackerView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3369', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with calls: ["addNumber", value], ["removeFirstAddedNumber"], ["getMean"], ["getMedian"] or ["getMode"]',
  url: 'https://leetcode.com/problems/design-an-array-statistics-tracker/',
  complexity: 'Add and remove take O(log c) with balanced sorted lists; queries take O(1) or O(log c) for c stored numbers. The official limit is 100000 calls; the visualization caps at 30.',
  examples: [
    { label: 'Add and remove', input: '{"calls":[["addNumber",8],["addNumber",3],["addNumber",8],["addNumber",5],["getMean"],["getMedian"],["getMode"],["removeFirstAddedNumber"],["getMode"],["getMedian"]]}' },
    { label: 'Tied mode', input: '{"calls":[["addNumber",9],["addNumber",6],["addNumber",9],["addNumber",6],["getMode"],["removeFirstAddedNumber"],["getMode"]]}' },
    { label: 'Tracker refills after emptying', input: '{"calls":[["addNumber",7],["removeFirstAddedNumber"],["addNumber",2],["getMean"],["getMedian"],["getMode"]]}' },
  ],
}

export default function DesignAnArrayStatisticsTracker() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <TrackerView step={step} />} renderReasoning={() => <>
    <p>No single structure answers everything. The queue remembers arrival order for removal, the total gives the mean, the sorted list gives the median by position, and the ranking gives the mode.</p>
    <p>Each add or remove touches all four, so they never disagree. Ranking on the pair (highest count, smallest value) makes a tie resolve itself, and an even count naturally lands on the larger middle value at position count // 2.</p>
  </>} />
}
