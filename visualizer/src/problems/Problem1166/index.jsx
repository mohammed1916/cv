import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

// Folder tree built from the stored full paths: each path is one node, and its value sits on that node.
function FolderTree({ entries }) {
  const root = { children: new Map(), value: null }
  for (const [path, value] of entries) {
    let node = root
    for (const part of path.split('/').slice(1)) {
      if (!node.children.has(part)) node.children.set(part, { name: part, children: new Map(), value: null })
      node = node.children.get(part)
    }
    node.value = value
  }
  const render = (node, prefix) => <ul style={{ listStyle: 'none', paddingLeft: 18, margin: 0 }}>
    {[...node.children.values()].map(child => {
      const full = `${prefix}/${child.name}`
      return <li key={full} style={{ margin: '4px 0' }}>
        <code>{child.name}</code>{child.value !== null && <strong>{` = ${child.value}`}</strong>}
        {child.children.size > 0 && render(child, full)}
      </li>
    })}
  </ul>
  return entries.length
    ? <div aria-label="Stored paths as a tree">{render(root, '')}</div>
    : <p>No paths stored yet. The root is always present.</p>
}

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
    { label: 'Get before any create', input: '{"ops":[["get","/a"]]}' },
    { label: 'Create a top-level path', input: '{"ops":[["create","/x",5],["get","/x"]]}' },
    { label: 'Parent must exist first', input: '{"ops":[["create","/p/q/r",1],["create","/p",2],["create","/p/q",3],["create","/p/q/r",4],["get","/p/q/r"]]}' },
    { label: 'Long run: 20 operations', input: '{"ops":[["get","/a/b/c"],["create","/d/e",66],["create","/a/b/c",36],["get","/a"],["get","/d/e"],["get","/d"],["create","/d",52],["create","/a/b/c",4],["create","/f",79],["create","/f",2],["create","/a/b",26],["create","/d/e",89],["get","/d/e"],["create","/a",73],["create","/a/b",71],["create","/f",40],["get","/a/b/c"],["create","/d/e",52],["get","/a/b"],["create","/d/e",84]]}' },
  ],
}

export default function DesignFileSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <FolderTree entries={step.entries} />
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A create checks two things: the parent path must already be stored (the root is always present), and the new path must not be stored yet.</p>
    <p>Using the full path as the key turns each operation into one hash lookup plus a parent lookup.</p>
  </>} />
}
