import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty answer.' },
    { id: 'mask', label: 'Bitmasks', description: 'Turn each list into a bitmask.' },
    { id: 'scan', label: 'Scan', description: 'Check whether another mask contains this one.' },
    { id: 'keep', label: 'Keep', description: 'Keep a person no other list contains.' },
    { id: 'done', label: 'Complete', description: 'Report the kept indexes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with favorite_companies (list of lists of names, JSON)',
  url: 'https://leetcode.com/problems/people-whose-list-of-favorite-companies-is-not-a-subset-of-another-list/',
  complexity: 'O(n^2) mask checks for n lists. The visualization caps input at 6 lists.',
  examples: [
    { label: 'Example 1', input: '{"favorite_companies":[["leetcode","google","facebook"],["google","microsoft"],["google","facebook"],["google"],["amazon"]]}' },
    { label: 'Example 2', input: '{"favorite_companies":[["leetcode","google","facebook"],["leetcode","amazon"],["facebook","google"]]}' },
  ],
}

export default function FavoriteCompanies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Lists and bitmasks">
      <thead><tr><th>Person</th><th>Companies</th><th>Bitmask</th><th>Status</th></tr></thead>
      <tbody>{run.lists.map((list, i) => <tr key={i} data-role={i === step.current ? 'active' : undefined}>
        <td>{i}</td>
        <td>{list.join(', ')}</td>
        <td>{step.masks[i] === null ? '-' : step.masks[i].toString(2).padStart(Math.max(1, step.bits.length), '0')}</td>
        <td>{step.kept.includes(i) ? 'kept' : i === step.current && step.beatenBy !== -1 ? `inside ${step.beatenBy}` : ''}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Companies">{`Bits: ${step.bits.map(([name, bit]) => `${name}=${bit}`).join(', ') || 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each company gets a bit, so a list is a mask. List i is contained in list j exactly when every bit of i is also set in j, which is one AND and one comparison.</p>
    <p>A person is kept only when no other list contains theirs. Two identical lists are never allowed, so a contained list always has a strictly larger partner.</p>
  </>} />
}
