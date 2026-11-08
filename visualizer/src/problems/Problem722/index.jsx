import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Source', description: 'Start outside any comment.' },
    { id: 'block', label: 'Block comment', description: 'Everything until */ is removed.' },
    { id: 'emit', label: 'Keep line', description: 'The line still has code after removing comments.' },
    { id: 'drop', label: 'Drop line', description: 'The line is empty once comments are removed.' },
    { id: 'done', label: 'Complete', description: 'Return the remaining lines.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Source lines (JSON array of strings)',
  url: 'https://leetcode.com/problems/remove-comments/',
  complexity: 'O(total characters) time and O(total characters) space for the output.',
  examples: [
    { label: 'Line and block', input: '["/*Test program */", "int main()", "{ ", "  // variable declaration ", "int a, b, c;", "/* This is a test", "   multiline  ", "   comment for ", "   testing */", "a = b + c;", "}"]' },
    { label: 'Mixed on one line', input: '["a/*comment", "line", "more_comment*/b"]' },
    { label: 'Single code line', input: '["int x = 1;"]' },
    { label: 'Comment only', input: '["/* only */"]' },
    { label: 'Overlapping markers', input: '["/*/*","*/"]' },
    { label: 'Maximum 100 lines', input: '["/* open","}","// note","int z;","/* open","int z;","/* open","x = y;","}","x = y;","int z;","// note","a /* b */ c","x = y;","}","x = y;","/* a */","/* a */","a /* b */ c","a /* b */ c","int z;","a /* b */ c","/* a */","x = y;","}","/* a */","close */","int z;","// note","}","/* open","x = y;","a /* b */ c","// note","a /* b */ c","}","x = y;","close */","close */","/* a */","x = y;","int z;","/* open","close */","x = y;","/* open","close */","x = y;","/* a */","// note","a /* b */ c","a /* b */ c","/* a */","}","int z;","int z;","/* a */","x = y;","/* open","/* a */","/* a */","// note","}","/* open","}","/* open","a /* b */ c","/* a */","close */","int z;","a /* b */ c","}","close */","close */","a /* b */ c","close */","}","}","/* open","close */","x = y;","/* open","// note","/* open","int z;","// note","/* a */","int z;","// note","close */","int z;","close */","// note","a /* b */ c","a /* b */ c","int z;","// note","close */","x = y;","a /* b */ c"]' },
  ],
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', fontFamily: 'monospace', color: 'var(--text)', textAlign: 'left', verticalAlign: 'top' }

// Status of each source line, read from the frames played so far.
function statusRows(source, frames, current) {
  const rows = source.map((text, i) => ({ text, status: 'in block comment', kept: '' }))
  for (let k = 0; k <= current; k++) {
    const f = frames[k]
    if (f.line === undefined || f.line === null || !rows[f.line]) continue
    if (f.phase === 'emit') rows[f.line] = { text: rows[f.line].text, status: 'kept', kept: f.kept }
    if (f.phase === 'drop') rows[f.line] = { text: rows[f.line].text, status: 'dropped (empty)', kept: '' }
  }
  return rows
}

export default function RemoveComments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const current = run.frames.indexOf(step)
    const rows = statusRows(run.input, run.frames, current)
    return <>
      <table aria-label="Source lines and what remains" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th style={cell}>line</th><th style={cell}>source</th><th style={cell}>status</th><th style={cell}>kept text</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} data-line={i} style={{
          background: i === step.line ? 'var(--surface2)' : 'transparent',
          opacity: i > step.line ? 0.5 : 1,
        }}>
          <td style={cell}>{i}</td><td style={cell}><code style={{ whiteSpace: 'pre-wrap' }}>{r.text}</code></td>
          <td style={cell}>{i <= step.line ? r.status : 'not yet'}</td><td style={cell}><code>{i <= step.line ? r.kept : ''}</code></td>
        </tr>)}</tbody>
      </table>
      <output aria-label="Output lines" style={{ display: 'block', color: 'var(--text)', marginTop: 8 }}>
        Output: {step.output.length} line{step.output.length === 1 ? '' : 's'}{step.inBlock ? ' · inside a block comment' : ''}
      </output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>States:</strong> outside a block, a line comment drops the rest of the line; inside a block, only the closing */ matters.</p>
  </>} />
}
