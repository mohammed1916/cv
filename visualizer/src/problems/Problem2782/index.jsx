import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CategoryGroupsView from './CategoryGroupsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No representatives yet.' },
    { id: 'pick', label: 'Pick', description: 'Take the next element.' },
    { id: 'query', label: 'Query', description: 'Ask the same-category handler about one representative.' },
    { id: 'match', label: 'Match', description: 'The answer is yes, so the element joins that category.' },
    { id: 'new', label: 'New', description: 'No representative matches, so a new category starts.' },
    { id: 'done', label: 'Result', description: 'Report the number of categories.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON list of hidden category labels (e.g. [0,1,0,2])',
  url: 'https://leetcode.com/problems/number-of-unique-categories/',
  complexity: 'O(n * k) same-category queries for n elements and k categories, so O(n^2) queries at worst; O(n) extra space for the representatives. The visualization caps the list at 12 elements and reveals the group membership only as the scan finds it. The official query-call limit is not restated here.',
  examples: [
    { label: 'Mixed groups', input: '[0,1,0,2,1,2,3]' },
    { label: 'One group', input: '[5,5,5,5]' },
    { label: 'All distinct', input: '[4,0,7,2,9]' },
    { label: 'Single label', input: '[0]' },
    { label: 'Equal labels', input: '[3,3,3,3]' },
    { label: 'Boundary: labels 0 and 11', input: '[11,0,11,0,11,0,11,0,11,0,11,0]' },
    { label: 'Long run: 12 labels', input: '[0,6,8,1,5,11,5,4,10,9,3,10]' },
  ],
}

export default function NumberOfUniqueCategories() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CategoryGroupsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
