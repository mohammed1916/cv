import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the rabbits\' answers.' },
    { id: 'count', label: 'Count', description: 'Tally how many rabbits gave each answer.' },
    { id: 'group', label: 'Form groups', description: 'Round each tally up to whole colour groups.' },
    { id: 'done', label: 'Complete', description: 'Return the minimum total.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array answers (JSON, up to 200)',
  url: 'https://leetcode.com/problems/rabbits-in-forest/',
  complexity: 'O(n) time and O(k) space for k distinct answers.',
  examples: [
    { label: '[1,1,2] -> 5', input: '[1,1,2]' },
    { label: '[10,10,10] -> 11', input: '[10,10,10]' },
    { label: '[0,0,1,1,1] -> 5', input: '[0,0,1,1,1]' },
    { label: 'Mixed', input: '[2,2,2,2,2,3,3,0,1,1,1]' }, { label: 'No rabbits', input: '[0]' }, { label: 'Equal answers form one group', input: '[1,1]' }, { label: 'Largest answer', input: '[999]' }, { label: 'Long run: 200 answers', input: '[858,256,524,19,817,799,769,590,424,271,349,106,203,957,203,465,256,4,777,384,945,970,817,467,443,129,792,549,338,438,898,235,266,756,898,977,126,433,989,267,139,79,615,189,181,635,956,42,599,256,231,127,439,323,893,928,271,689,146,728,859,579,826,76,345,928,648,832,251,730,641,256,358,663,889,384,606,184,892,379,735,436,198,14,204,725,322,140,802,696,429,483,229,841,378,261,400,972,519,327,289,396,158,149,178,118,332,322,488,62,332,164,182,32,668,805,9,839,806,777,221,880,919,374,214,511,275,254,168,272,533,62,678,230,514,874,301,590,558,101,785,212,789,460,285,932,306,723,967,209,418,846,969,152,785,209,928,405,819,287,991,44,211,885,203,344,95,519,472,190,465,848,978,106,573,61,821,856,57,66,708,299,639,515,700,256,868,260,825,827,291,536,79,688,138,500,345,338,651,332]' },
  ],
}
export default function RabbitsInForest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Answers" length={run.input.length} valueAt={i => run.input[i]} />
    <IndexedSequence label="Distinct answers (tally)" length={run.entries.length} active={step.phase === 'group' ? step.groups.length - 1 : -1} valueAt={i => `${run.entries[i][0]} x${run.entries[i][1]}`} roleAt={i => (i < step.groups.length ? 'grouped' : '')} />
    <IndexedSequence label="Rabbits contributed per answer" length={run.entries.length} valueAt={i => (step.groups[i] ? step.groups[i].added : '?')} />
    <output aria-label="Running total">Total so far: {step.total}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Greedy argument:</strong> rabbits with different answers cannot share a colour, and rabbits with the same answer a share as many colour groups of size a+1 as needed, so rounding up is minimal.</p>
  </>} />
}
