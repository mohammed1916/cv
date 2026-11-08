import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Load pairs', description: 'Store each similar pair in both orders.' },
    { id: 'match', label: 'Compare a position', description: 'Equal words match, or a listed pair must connect them.' },
    { id: 'fail', label: 'Mismatch', description: 'A position has neither equal words nor a listed pair.' },
    { id: 'done', label: 'Similar', description: 'Every position matched.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sentences and similar pairs (JSON)',
  url: 'https://leetcode.com/problems/sentence-similarity/',
  complexity: 'O(n + p) time for n words and p pairs. The visualization caps input at 20 words and 20 pairs.',
  examples: [
    { label: 'Similar', input: '{"s1":["great","acting","skills"],"s2":["fine","drama","talent"],"pairs":[["great","fine"],["acting","drama"],["skills","talent"]]}' },
    { label: 'Not similar', input: '{"s1":["an","unusual","meal"],"s2":["one","good","dinner"],"pairs":[["great","good"],["any","one"],["some","one"]]}' },
    { label: 'Single matching word', input: '{"s1":["a"],"s2":["a"],"pairs":[]}' },
    { label: 'Unpaired words differ', input: '{"s1":["hi"],"s2":["hey"],"pairs":[]}' },
    { label: 'Twenty words each', input: '{"s1":["wkvols","xtv","qnpqd","oourj","eoxqxgqw","mryin","cwbii","nmayk","hyex","wwhab","vmslrdyn","yyq","lla","rgmtcdm","imtif","npu","shpylbi","gxwzrlqs","xvhkpso","flqqq"],"s2":["wecld","depyz","brit","klk","wkxgimg","odzulm","usxqadp","pvnmmbxo","xsii","wvqcs","gapor","xbbqmf","mtbul","bznjte","krdspl","eit","jwzfmmf","pfkg","nogxgzxs","vpint"],"pairs":[["wkvols","wecld"],["xtv","depyz"],["qnpqd","brit"],["oourj","klk"],["eoxqxgqw","wkxgimg"],["mryin","odzulm"],["cwbii","usxqadp"],["nmayk","pvnmmbxo"],["hyex","xsii"],["wwhab","wvqcs"],["vmslrdyn","gapor"],["yyq","xbbqmf"],["lla","mtbul"],["rgmtcdm","bznjte"],["imtif","krdspl"],["npu","eit"],["shpylbi","jwzfmmf"],["gxwzrlqs","pfkg"],["xvhkpso","nogxgzxs"],["flqqq","vpint"]]}' },
    { label: 'Long run: chained pairs', input: '{"s1":["wkvols","xtv","qnpqd","oourj","eoxqxgqw","mryin","cwbii","nmayk","hyex","wwhab","vmslrdyn","yyq","lla","rgmtcdm","imtif","npu","shpylbi","gxwzrlqs","xvhkpso","flqqq"],"s2":["wkvols","xtv","qnpqd","oourj","eoxqxgqw","mryin","cwbii","nmayk","hyex","wwhab","vmslrdyn","yyq","lla","rgmtcdm","imtif","npu","shpylbi","gxwzrlqs","xvhkpso","flqqq"],"pairs":[["xtv","wkvols"],["qnpqd","xtv"],["oourj","qnpqd"],["eoxqxgqw","oourj"],["mryin","eoxqxgqw"],["cwbii","mryin"],["nmayk","cwbii"],["hyex","nmayk"],["wwhab","hyex"],["vmslrdyn","wwhab"],["yyq","vmslrdyn"],["lla","yyq"],["rgmtcdm","lla"],["imtif","rgmtcdm"],["npu","imtif"],["shpylbi","npu"],["gxwzrlqs","shpylbi"],["xvhkpso","gxwzrlqs"],["flqqq","xvhkpso"]]}' },
  ],
}

export default function SentenceSimilarity() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="First sentence" length={run.s1.length} active={step.index ?? -1} valueAt={i => run.s1[i]}
      roleAt={i => (step.index !== null && i < step.index ? 'read' : '')} />
    <IndexedSequence label="Second sentence" length={run.s2.length} active={step.index ?? -1} valueAt={i => run.s2[i]}
      roleAt={i => (step.index !== null && i < step.index ? 'read' : '')} />
    <output aria-label="Comparison">{step.result === undefined || step.result === null ? step.message : `Similar: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Positions are compared one at a time. A position is fine when the words are equal or when the two words appear together in the list.</p>
    <p>Similarity is not transitive, so a pair that connects a to b and b to c does not connect a to c. The check only looks at direct pairs.</p>
  </>} />
}
