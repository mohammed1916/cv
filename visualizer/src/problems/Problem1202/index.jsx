import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function SmallestStringWithSwapsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { letters, result, group, pair } = step.snapshot
    const pairs = run.input.pairs
    const n = letters.length
    const current = pair !== undefined && pair !== null && pairs[pair] ? pairs[pair][0] : null
    const neighbour = pair !== undefined && pair !== null && pairs[pair] ? pairs[pair][1] : null
    const tags = Object.fromEntries(letters.map((_, i) => [i, `${letters[i]}→${result[i]}`]))
    return <>
      <GraphTraversalView
        title="Swap graph: positions joined by allowed swaps"
        n={n}
        edges={pairs}
        labels={letters.map((ch, i) => `${i}:${ch}`)}
        current={current}
        neighbour={neighbour}
        done={group ?? []}
        tags={tags}
        showFrontier={false}
        notes={step.phase === 'update' ? [`Sorted letters placed at positions ${(group ?? []).join(', ')}`] : []}
      />
      <p>Original: {letters.join('')} · Current: {result}</p>
    </>
  }} renderReasoning={() => <p><strong>Components:</strong> positions linked by any chain of allowed swaps can exchange letters freely, so each component is sorted independently. Tags show original letter to rebuilt letter.</p>} />
}
