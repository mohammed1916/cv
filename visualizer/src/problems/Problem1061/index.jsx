import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Letters', description: 'Every letter starts as its own group.' },
    { id: 'merge', label: 'Merge', description: 'Join the letters from one position of s1 and s2; the smaller letter becomes the representative.' },
    { id: 'done', label: 'Complete', description: 'Replace each letter of the base string with its representative.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"s1": "...", "s2": "...", "baseStr": "..."} (lowercase letters)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-equivalent-string/',
  complexity: 'O((|s1| + |baseStr|) * alpha) time with a union-find over 26 letters.',
  examples: [
    { label: 'Own case 1', input: '{"s1":"qbslfs","s2":"npssjt","baseStr":"qbstfs"}' },
    { label: 'Own case 2', input: '{"s1":"ifmmp","s2":"xpsme","baseStr":"ipme"}' },
    { label: 'Chain', input: '{"s1":"xyz","s2":"yzw","baseStr":"wxyzq"}' },
    { label: 'Single letter pair', input: '{"s1":"a","s2":"b","baseStr":"a"}' },
    { label: 'Identical pairs leave base unchanged', input: '{"s1":"aa","s2":"aa","baseStr":"aab"}' },
    { label: 'Longest strings: eight and ten letters', input: '{"s1":"abcdefgh","s2":"ijklmnop","baseStr":"zyxwvutsrq"}' },
    { label: 'Long run: eight letters', input: '{"s1":"daddeeba","s2":"cadaedea","baseStr":"eadebcaebd"}' },
  ],
}

export default function SmallestEquivalentString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s1, s2, baseStr } = run.input
    const letters = [...new Set(s1 + s2)].sort()
    const at = c => letters.indexOf(c)
    const edges = s1.slice(0, step.merged).split('').map((c, i) => [at(c), at(s2[i])])
    const rep = c => step.roots[c.charCodeAt(0) - 97]
    const tags = Object.fromEntries(letters.map((c, i) => [i, `group ${rep(c)}`]))
    const current = step.phase === 'merge' ? at(s1[step.merged - 1]) : null
    const neighbour = step.phase === 'merge' ? at(s2[step.merged - 1]) : null
    return <>
      <GraphTraversalView title="Letters joined so far (labels show each letter's group)" n={letters.length} edges={edges} labels={letters}
        current={current} neighbour={neighbour} tags={tags} showFrontier={false} />
      <IndexedSequence label="baseStr letters" length={baseStr.length} valueAt={i => baseStr[i]} active={-1} />
      <IndexedSequence label="Replaced by group representative" length={baseStr.length} valueAt={i => rep(baseStr[i])}
        roleAt={i => (step.phase === 'done' ? 'written' : '')} active={-1} />
      <p>{step.pair ? `Merging ${step.pair[0]} and ${step.pair[1]}.` : 'No merge in this step.'}</p>
      <p>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each merge joins two groups of letters. Always keeping the smaller letter as the root means every group is represented by its smallest letter.</p>
    <p>Replacing each letter of the base string by its group representative gives the lexicographically smallest equivalent string.</p>
  </>} />
}
