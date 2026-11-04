import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import GroupView from './GroupView'

const definition = {
  number: '2631',
  phases: [
    { id: 'start', label: 'Start', description: 'Empty result.' },
    { id: 'read', label: 'Read key', description: 'Read one item key value.' },
    { id: 'new', label: 'New group', description: 'Create a bucket when needed.' },
    { id: 'append', label: 'Append', description: 'Add the id to its bucket.' },
    { id: 'done', label: 'Result', description: 'The grouped object.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with items (objects with an integer id) and key (the property to group by)',
  url: 'https://leetcode.com/problems/group-by/',
  complexity: 'O(n) time for n items, O(n) extra space for the buckets.',
  examples: [
    { label: 'Two groups', input: '{"items":[{"id":1,"g":"a"},{"id":2,"g":"b"},{"id":3,"g":"a"}],"key":"g"}' },
  ],
}

export default function GroupBy() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <GroupView view={step.view} />}
    renderReasoning={() => <>
      <p>One pass over the items: the key value of each item picks its bucket, and the bucket is created the first time its name appears.</p>
    </>} />
}
