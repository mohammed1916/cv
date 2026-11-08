import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'No representation seen yet.' },
    { id: 'new', label: 'New code', description: 'This transformation is added to the set.' },
    { id: 'repeat', label: 'Repeat', description: 'This transformation was already counted.' },
    { id: 'done', label: 'Complete', description: 'The set size is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Words (JSON array of lowercase words)',
  url: 'https://leetcode.com/problems/unique-morse-code-words/',
  complexity: 'O(total letters) time and O(total length) space.',
  examples: [
    { label: 'Pair', input: '["gin","zen","gig","msg"]' },
    { label: 'Repeats', input: '["ab","ba","aab","ab"]' }, { label: 'Single word', input: '["a"]' }, { label: 'Identical words', input: '["a","a","a"]' }, { label: 'Long run: 100 words', input: '["gmr","mcisdiuzdwj","v","uplls","nch","uhvzlqrvlq","fqobywyh","dixacvrtko","sthrs","guizshwq","vnkyuuikvbv","lmqsyg","hwj","tqzoydezytq","sa","qbxu","ruxd","s","sfuibprsmg","lbmkb","uuo","xynwhqeo","j","xxpur","fmly","usqyukulz","dowmmcxeabz","yvt","h","judwnbycdvjb","wtfnfsp","vlgacsfuvpmw","rdcpv","dnxl","hlxk","o","eonmzbgujj","cjtj","rojhukhqzk","zmwwfhadcala","ywz","syx","ozfelhnyyen","p","sakzzjviwavi","vpsj","lfhiinz","fxzqas","ifjfrpjej","f","fsb","oref","ladxqxosd","kla","tryhmvxgaiv","hlqo","tidbplyeho","apjr","mdsk","h","mglyj","tnfdbfdk","bqhtnfzqd","igbjogjwwydc","wgrxamqstlmm","cliwmazlp","mdyitrbiqhuw","icg","oayshzxixhc","ketzgs","jugmwsfcqzh","zoz","clbfwcpuxvc","jplyxzdu","tiwvsyyfxd","fgwbrhq","ysfxxur","omp","nyiqv","eucuoa","bb","dygaucolkrsp","vsu","klkdmn","qvkzd","vdqllmsjqnk","brvoe","qjrimlwig","tjuxshmkgkd","dbr","dtlgh","eugcqoq","fhyngqyse","isbtuipbcv","janepdistp","fumnbh","szddzwseab","ddooizpezjt","fbxrjzje","olqidyn"]' },
  ],
}

export default function UniqueMorseCodeWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.input.length} valueAt={k => run.input[k]} active={step.index ?? -1} />
    <RecordStateTable label="Words, their Morse strings, and whether they are new" columns={['word', 'morse', 'status']}
      rows={step.rows.map(r => ({ word: r.word, morse: r.code, status: r.fresh ? 'new' : 'repeat' }))}
      activeRow={step.rows.length - 1} />
    <output aria-label="Distinct count">{`Distinct so far: ${step.distinct}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each letter maps to its Morse code. A word's transformation is the concatenation, and the answer counts distinct concatenations.</p>
  </>} />
}
