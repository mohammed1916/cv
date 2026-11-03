import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function ChoiceView({ step }) {
  return <div>
    <ol aria-label="Words" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0 }}>
      {step.words.map((word, i) => {
        const chosen = step.chosen.includes(i)
        const current = i === step.index
        return <li key={i} style={{ padding: '6px 10px', border: '2px solid currentColor', borderRadius: 6, opacity: chosen || current ? 1 : 0.5, background: chosen ? 'rgba(8,145,178,0.25)' : 'transparent' }}>
          <strong>{word}</strong>{chosen ? ' · taken' : ''}{current ? ' · deciding' : ''}
        </li>
      })}
    </ol>
    <p>Letters used: <code>{step.used || 'none'}</code> · Current length: {step.length}</p>
    <p>Best so far: {step.best}{step.bestChoice?.length ? ` (${step.bestChoice.map(i => step.words[i]).join(' + ')})` : ''}</p>
  </div>
}

export default function UniqueConcatenationVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <ChoiceView step={step} />}
    renderReasoning={() => <p>Each word is either skipped or taken. Taking is allowed only when the word has no repeated letter and none of its letters are already used, so the search tracks the letters chosen so far.</p>} />
}
