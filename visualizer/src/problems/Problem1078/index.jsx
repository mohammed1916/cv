import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function FollowingWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { words, index, window: current, collected, first, second } = step.state
    const pointers = index === null ? {} : { l: index, r: index + 2 }
    const marks = {}
    if (index !== null) for (let k = index; k < index + 3 && k < words.length; k++) marks[k] = 'window'
    if (step.phase === 'collect' && index !== null) marks[index + 2] = 'written'
    return <>
      <Sequence label={`Words; looking for "${first} ${second}" followed by a word`} values={words} pointers={pointers} marks={marks} />
      <Vars vars={{ 'i (window start)': index, 'window': current.length ? current.join(' ') : null, 'collected': collected.length ? collected.join(', ') : '-' }} />
      <output aria-label="Result">{step.phase === 'done' ? `Result: ${run.result.length ? run.result.join(', ') : 'empty'}` : step.message}</output>
    </>
  }} renderReasoning={() => <p>A window of three consecutive words slides through the text. When its first two words are the phrase, the third word is recorded in text order.</p>} />
}
