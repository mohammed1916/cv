import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ActivationView from './ActivationView'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples, url } from './algorithm'
import { meta } from './meta'

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples, url }

export default function MinimumTimeToActivateString() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <ActivationView run={run} step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>Stars are never removed, so the count of valid substrings only grows and the first time it reaches k is the answer. There is no need to recount from scratch: only substrings that had no star before can become valid now.</p>
      <p>Such a substring must include the new star and must stay strictly between the nearest stars or walls on each side. Its start and end can be chosen independently, so the gain is the number of starts times the number of ends, the rectangle in the view.</p>
      <p>A string of length n has n(n+1)/2 substrings in all, and once every character is a star they are all valid. If k is larger than that, the answer is -1.</p>
    </>} />
}
