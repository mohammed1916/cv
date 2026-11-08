import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the permutation.' },
    { id: 'check', label: 'Check', description: 'Confirm the value is within one slot of its index.' },
    { id: 'violation', label: 'Violation', description: 'A value is two or more slots from home.' },
    { id: 'done', label: 'Complete', description: 'Report whether global equals local inversions.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Permutation nums of 0..n-1 (JSON, up to 300)',
  url: 'https://leetcode.com/problems/global-and-local-inversions/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: '[1,0,2] -> true', input: '[1,0,2]' },
    { label: '[1,2,0] -> false', input: '[1,2,0]' },
    { label: 'Swapped pairs', input: '[1,0,3,2,5,4]' }, { label: 'Single element', input: '[0]' }, { label: 'Reversed four', input: '[3,2,1,0]' }, { label: 'Reversed 300', input: '[299,298,297,296,295,294,293,292,291,290,289,288,287,286,285,284,283,282,281,280,279,278,277,276,275,274,273,272,271,270,269,268,267,266,265,264,263,262,261,260,259,258,257,256,255,254,253,252,251,250,249,248,247,246,245,244,243,242,241,240,239,238,237,236,235,234,233,232,231,230,229,228,227,226,225,224,223,222,221,220,219,218,217,216,215,214,213,212,211,210,209,208,207,206,205,204,203,202,201,200,199,198,197,196,195,194,193,192,191,190,189,188,187,186,185,184,183,182,181,180,179,178,177,176,175,174,173,172,171,170,169,168,167,166,165,164,163,162,161,160,159,158,157,156,155,154,153,152,151,150,149,148,147,146,145,144,143,142,141,140,139,138,137,136,135,134,133,132,131,130,129,128,127,126,125,124,123,122,121,120,119,118,117,116,115,114,113,112,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60,59,58,57,56,55,54,53,52,51,50,49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]' }, { label: 'Long run: shuffled 300', input: '[191,48,218,187,76,294,257,232,281,67,279,156,73,102,129,275,45,243,157,297,223,151,204,251,30,72,169,230,7,168,289,212,3,253,176,59,1,46,50,150,52,158,100,263,12,164,88,34,128,226,148,8,199,87,227,203,170,299,213,133,284,219,19,178,54,265,117,196,235,81,55,249,172,145,2,112,153,14,198,16,183,71,144,119,116,240,214,63,160,25,205,273,9,28,123,56,216,229,75,125,121,122,85,245,288,10,51,261,135,103,77,277,66,268,188,99,6,108,90,80,32,239,295,134,4,248,86,136,225,0,269,179,190,97,233,247,110,286,236,298,184,154,291,91,118,126,280,15,234,201,40,252,221,246,60,31,11,131,74,189,166,120,141,47,206,44,109,33,26,224,254,69,287,283,200,57,29,24,146,43,192,197,242,270,272,127,139,147,217,84,207,41,104,185,274,130,64,17,155,42,282,37,163,13,107,161,193,250,38,209,159,70,237,22,27,101,228,222,21,39,35,256,62,111,137,173,96,210,266,149,175,220,49,162,181,140,182,202,152,292,78,98,115,58,267,290,5,79,124,68,211,114,271,95,18,165,36,20,82,276,89,208,231,262,255,105,238,132,296,92,83,241,186,142,278,113,174,61,94,264,106,143,258,194,293,53,195,138,65,285,171,93,180,167,215,23,260,177,259,244]' },
  ],
}
export default function GlobalAndLocalInversions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (step.offenders.includes(i) ? 'violation' : '')} />
    <IndexedSequence label="Distance |nums[i] - i|" length={run.input.length} active={step.index} valueAt={i => (i <= step.index ? Math.abs(run.input[i] - i) : '?')} />
    <output aria-label="Verdict">{step.phase === 'done' ? `Ideal permutation: ${run.result}` : 'Scanning...'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Proof sketch:</strong> if some value is two or more away from its index, a smaller or larger value must be displaced past an element not adjacent to it, giving a non-adjacent inversion. Conversely if every value is within 1, only adjacent swaps can exist.</p>
  </>} />
}
