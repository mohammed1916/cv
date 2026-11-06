import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FontFitView from './FontFitView'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Set the search range to every size.' },
    { id: 'loop', label: 'Range', description: 'Check that the range is not empty.' },
    { id: 'mid', label: 'Probe', description: 'Pick the middle size.' },
    { id: 'measure', label: 'Measure', description: 'Add every glyph width and compare the height.' },
    { id: 'fit', label: 'Fit', description: 'The size works; keep the answer and go larger.' },
    { id: 'miss', label: 'Miss', description: 'The size is too large; go smaller.' },
    { id: 'done', label: 'Result', description: 'Return the largest fitting size or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with text, sizes, w and h (e.g. {"text":"tiny words","sizes":[6,8],"w":50,"h":18})',
  url: 'https://leetcode.com/problems/maximum-font-to-fit-a-sentence-in-a-screen/',
  complexity: 'O(log k) probes for k font sizes, each probe measuring n characters, so O(n log k) time. The visualization uses a stand-in glyph metric (narrow letters are cheaper) and caps the text at 20 characters and the sizes at 10 entries.',
  examples: [
    { label: 'Width limit', input: '{"text":"screen fit","sizes":[6,8,10,12,14,18,24],"w":60,"h":40}' },
    { label: 'Height limit', input: '{"text":"tall","sizes":[4,8,12,16,20],"w":200,"h":10}' },
    { label: 'Nothing fits', input: '{"text":"mmmm","sizes":[10,20,30],"w":5,"h":40}' },
  ],
}

export default function MaxFontToFit() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const { sizes } = run.input
      const low = step.lo >= 0 && step.lo < sizes.length ? sizes[step.lo] : sizes[sizes.length - 1]
      const high = step.hi >= 0 && step.hi < sizes.length ? sizes[step.hi] : sizes[0]
      return <>
        <AnswerRangeBar title="Font size search" min={sizes[0]} max={sizes[sizes.length - 1]} low={Math.min(low, high)} high={Math.max(low, high)}
          probe={step.size ?? null} verdict={step.verdict === 'fit'} />
        <FontFitView run={run} step={step} />
      </>
    }}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>The width and height both grow with the font size, so a size that fits makes every smaller size fit too, and the search can halve the range each probe.</p>
    </>}
  />
}
