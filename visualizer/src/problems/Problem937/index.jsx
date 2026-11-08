import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Logs in their original order.' },
    { id: 'classify', label: 'Classify', description: 'Decide whether each log is a letter-log or a digit-log.' },
    { id: 'sort', label: 'Sort letters', description: 'Order letter-logs by content then identifier.' },
    { id: 'done', label: 'Complete', description: 'Concatenate letter-logs and digit-logs.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Logs (JSON array of strings)',
  url: 'https://leetcode.com/problems/reorder-data-in-log-files/',
  complexity: 'O(n log n * m) time for n logs of length m. The visualization caps input at 30 logs.',
  examples: [
    { label: 'Own case 1', input: '["ejh2 9 2 6 2","mfu2 bsu dbo","ejh3 4 7","mfu3 pxo lju ejh","mfu4 bsu afsp"]' },
    { label: 'Own case 2', input: '["b2 0 3 4 2","h2 bdu dbs","ap5 5 8","bc2 pgg lfz eph","b9 bdu app"]' },
    { label: 'Single letter log', input: '["a1 x"]' },
    { label: 'Equal words sort by identifier', input: '["b2 x y","a1 x y"]' },
    { label: 'Long log line', input: '["z1 aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]' },
    { label: 'Long run: 30 logs', input: '["jqi0 owc cd","gpz1 yry wh","d2 038 52","d3 682 53","d4 116 57","d5 304 06","d6 519 73","vkh7 buw sf","grl8 urw an","iax9 rfr sn","kck10 jph xa","nxr11 ayf sl","d12 776 09","jab13 sqt iv","d14 003 84","d15 594 95","zwt16 coy po","d17 539 29","d18 738 72","d19 186 35","d20 335 41","mlb21 dpn bz","d22 649 18","wvi23 zij ud","d24 248 11","zru25 leo gj","d26 093 93","d27 635 93","kbr28 kpu zr","yfc29 twu cn"]' },
  ],
}

export default function ReorderLogFiles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Logs" length={step.order.length} active={step.index ?? -1} valueAt={i => step.order[i]}
      roleAt={i => step.kinds[i] === 'letter' ? 'match' : step.kinds[i] === 'digit' ? 'dropped' : ''} />
    <RecordStateTable label="Sort keys of the letter-logs (content first, identifier breaks ties)" columns={['content', 'identifier']}
      rows={step.order.filter((_, i) => step.kinds[i] === 'letter').map(log => { const sp = log.indexOf(' '); return { content: log.slice(sp + 1), identifier: log.slice(0, sp) } })} />
  </>} renderReasoning={() => <>
    <p>Letter logs compare by everything after the identifier; the identifier only breaks ties. Digit logs are never compared, so a stable partition keeps their order.</p>
    <p>Keying each letter log as (content, identifier, original) lets one plain sort implement both rules.</p>
  </>} />
}
