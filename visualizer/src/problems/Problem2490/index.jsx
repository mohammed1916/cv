import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2490',
  phases: [
    { id: 'setup', label: 'Split', description: 'Split the sentence into words.' },
    { id: 'compare', label: 'Compare', description: 'Check one link of the circle.' },
    { id: 'fail', label: 'Fail', description: 'A link does not match.' },
    { id: 'done', label: 'Result', description: 'Every link matches.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"sentence": "tree eel lab bat"}',
  url: 'https://leetcode.com/problems/circular-sentence/',
  complexity: 'O(n) time and O(n) extra space for a sentence of n characters. The visualization caps sentences at 200 characters.',
  examples: [
    { label: 'Circular', input: '{"sentence":"tree eel lab bat"}' },
    { label: 'Broken link', input: '{"sentence":"tree eel lab cat"}' },
    { label: 'Single word', input: '{"sentence":"abc"}' },
    { label: 'Repeated words', input: '{"sentence":"aba aba"}' },
    { label: 'Longest sentence, 200 characters', input: '{"sentence":"ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab ba ab"}' },
    { label: 'Long run: random words', input: '{"sentence":"ojp cev tvl jgqq d srb nmen qm vdq pr y vylc cec rmh adkm om vd nbn wzgb q lr rj xa yuru ift rou jwg ugq d ql xc zzh ac id egb c p uc j ouy h crv xg abte ubti g l qqty fxo yxz cqx rwfr sjoq k fahc"}' },
  ],
}

export default function CircularSentence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="words" length={step.words.length} valueAt={i => step.words[i]} active={step.at}
      roleAt={i => (step.next !== null && step.next !== undefined && i === step.next ? 'next' : '')} />
    <output aria-label="Circular check">{step.result === null ? 'checking' : step.result ? 'circular' : 'not circular'}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A sentence is circular when the last letter of each word matches the first letter of the next word, and the last word's last letter matches the first word's first letter.</p>
    <p>Checking each word against its successor, with the successor wrapping around to the first word, covers every link once.</p>
  </>} />
}
