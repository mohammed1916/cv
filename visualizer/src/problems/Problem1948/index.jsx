import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1948',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of folder paths (e.g. [["a"],["a","x"],["b"],["b","x"]])',
  url: 'https://leetcode.com/problems/delete-duplicate-folders-in-system/',
  complexity: 'O(total path length · log) time for the signature sort and hash counts. The visualization caps input at 12 paths.',
  examples: [
    { label: 'Two identical branches', input: '[["a"],["a","x"],["a","x","y"],["a","z"],["b"],["b","x"],["b","x","y"],["b","z"]]' },
    { label: 'Distinct sibling', input: '[["a"],["a","x"],["a","x","y"],["a","z"],["b"],["b","w"],["b","x"],["b","x","y"],["b","z"]]' },
    { label: 'Single folder', input: '[["a"]]' },
    { label: 'Identical subfolders', input: '[["a","x"],["a","x"]]' },
    { label: 'Long run: twelve paths', input: '[["c","z"],["b"],["z","a","z"],["x","c","x"],["b","c","b"],["b","c","b"],["z","a","b"],["x","c","b"],["b","a","b"],["z","y","b"],["z","a","z"],["z","a","z"]]' },
  ],
}

export default function Problem1948Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <table aria-label="Folder signatures" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th style={{ textAlign: 'left' }}>Folder</th><th style={{ textAlign: 'left' }}>Signature</th><th>Seen</th></tr></thead>
        <tbody>{step.rows.map((r, i) => {
          const dup = r.repeats > 1
          const deleted = step.marked.some(p => p.length <= r.path.length && p.every((n, k) => n === r.path[k]))
          return <tr key={i} style={{ background: deleted ? 'color-mix(in srgb, var(--error) 16%, transparent)' : dup ? 'color-mix(in srgb, var(--primary) 14%, transparent)' : 'transparent' }}>
            <td style={{ fontFamily: 'monospace' }}>/{r.path.join('/')}</td><td style={{ fontFamily: 'monospace' }}>{r.sig || '(empty)'}</td><td style={{ textAlign: 'center' }}>{r.repeats}</td>
          </tr>
        })}</tbody>
      </table>
      <p>Red rows are marked for deletion with their subfolders. Blue rows are signatures seen more than once.</p>
      {step.out && <output aria-label="Remaining folders">Remaining: {step.out.map(p => '/' + p.join('/')).join('  ') || 'none'}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
