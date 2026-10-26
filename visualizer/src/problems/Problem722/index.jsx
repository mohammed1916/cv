import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Source', description: 'Start outside any comment.' },
    { id: 'block', label: 'Block comment', description: 'Everything until */ is removed.' },
    { id: 'emit', label: 'Keep line', description: 'The line still has code after removing comments.' },
    { id: 'drop', label: 'Drop line', description: 'The line is empty once comments are removed.' },
    { id: 'done', label: 'Complete', description: 'Return the remaining lines.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Source lines (JSON array of strings)',
  url: 'https://leetcode.com/problems/remove-comments/',
  complexity: 'O(total characters) time and O(total characters) space for the output.',
  examples: [
    { label: 'Line and block', input: '["/*Test program */", "int main()", "{ ", "  // variable declaration ", "int a, b, c;", "/* This is a test", "   multiline  ", "   comment for ", "   testing */", "a = b + c;", "}"]' },
    { label: 'Mixed on one line', input: '["a/*comment", "line", "more_comment*/b"]' },
  ],
}

export default function RemoveComments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Source and output">
      <thead><tr><th>Source line</th><th>Status</th></tr></thead>
      <tbody>{run.input.map((line, i) => <tr key={i} style={{ fontWeight: i === step.line ? 700 : 400 }}>
        <td><code>{line}</code></td><td>{i === step.line ? step.phase : i < step.line ? 'done' : ''}</td></tr>)}</tbody>
    </table>
    <output aria-label="Output lines">Output: {step.output.length} line{step.output.length === 1 ? '' : 's'}{step.inBlock ? ' · inside a block comment' : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>States:</strong> outside a block, a line comment drops the rest of the line; inside a block, only the closing */ matters.</p>
  </>} />
}
