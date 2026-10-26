import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No groups yet.' },
    { id: 'add', label: 'Add file', description: 'Append the path to its content group.' },
    { id: 'done', label: 'Complete', description: 'Keep groups with two or more files.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Path strings (JSON array)',
  url: 'https://leetcode.com/problems/find-duplicate-file-in-system/',
  complexity: 'O(total characters) time with a hash map keyed by file content.',
  examples: [
    { label: 'Two groups', input: '["root/a 1.txt(abcd) 2.txt(efgh)","root/c 3.txt(abcd)","root/c/d 4.txt(efgh)","root 4.txt(efgh)"]' },
    { label: 'No duplicates', input: '["root/a 1.txt(abcd) 2.txt(efgh)"]' },
    { label: 'Empty content', input: '["root 1.txt() 2.txt()"]' },
  ],
}

export default function DuplicateFiles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Content groups">
      <thead><tr><th>Content</th><th>Paths</th></tr></thead>
      <tbody>{step.groups.length === 0 ? <tr><td colSpan={2}>No files yet</td></tr> : step.groups.map(([content, paths]) => <tr key={content}>
        <td><code>{content || '(empty)'}</code></td><td>{paths.map(p => <div key={p} style={{ color: p === step.current ? 'var(--primary)' : undefined, fontWeight: p === step.current ? 700 : 400 }}>{p}</div>)}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Duplicate groups">Duplicate groups so far: {step.groups.filter(([, p]) => p.length > 1).length}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Grouping:</strong> identical content is the only key, so a hash map from content to paths finds all duplicates in one pass.</p>
  </>} />
}
