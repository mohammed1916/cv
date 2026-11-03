import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1166',
  phases: [
    { id: 'start', label: 'Empty', description: 'No paths exist yet.' },
    { id: 'create', label: 'Create', description: 'The parent exists and the path is new.' },
    { id: 'reject', label: 'Reject', description: 'The parent is missing or the path already exists.' },
    { id: 'get', label: 'Get', description: 'Return the stored value or -1.' },
    { id: 'done', label: 'Result', description: 'Report every recorded result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["create", "/path", value] or ["get", "/path"]',
  url: 'https://leetcode.com/problems/design-file-system/',
  complexity: 'O(L) per operation, where L is the path length. The visualization caps the input at 20 operations.',
  examples: [
    { label: 'Example', input: '{"ops":[["create","/a",1],["create","/a/b",2],["get","/a/b"],["create","/x/y",3],["create","/a",4],["get","/q"]]}' },
  ],
}

export default function DesignFileSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Stored paths">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A create checks two things: the parent path must already be stored (the root is always present), and the new path must not be stored yet.</p>
    <p>Using the full path as the key turns each operation into one hash lookup plus a parent lookup.</p>
  </>} />
}
