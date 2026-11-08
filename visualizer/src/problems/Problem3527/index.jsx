import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DailyCountView from './DailyCountView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3527',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with responses (a list of days, each a list of lowercase answers)',
  url: 'https://leetcode.com/problems/find-the-most-common-response/',
  complexity: 'O(L) time and space up to the final scan, where L is the total number of letters across all answers. The official limits are 1000 days of 1000 answers; the visualization caps these at 8 days of 10 answers.',
  examples: [
    { label: 'Three-way tie', input: '{"responses":[["mint","lime","mint"],["lime","kiwi"],["kiwi","mint","kiwi"],["plum"]]}' },
    { label: 'Repeats cannot win', input: '{"responses":[["tea","tea","tea","tea"],["milk"],["milk","soda"],["soda","milk"]]}' },
    { label: 'One answer in total', input: '{"responses":[["solo"]]}' },
    { label: 'Single answer', input: '{"responses":[["a"]]}' },
    { label: 'Repeated answer across days', input: '{"responses":[["x","x"],["x"],["x","y"]]}' },
    { label: 'Longest words', input: '{"responses":[["abcdefghij","abcdefghij"]]}' },
    { label: 'Long run: 8 days', input: '{"responses":[["pyzkubik","apeo","fgb","kvtko","roqbqpe","q","siwyn","kn","iinijuvrep","qpciwhhoqz"],["ek","dy","yyg","fyur","olmg","wryrmjaei","qmnyaau","pkvfcuatua","a","umxbmeffru"],["kfnpd","ubdejlk","scdmlosao","uo","hmtvrsxgqk","ujjhamdly","mkjfntlcn","vaz","my","jjoumf"],["yxx","hgrvfv","ifrbzix","vlee","aceakr","hffiwl","exv","jdnrracxt","ygyrzq","rqor"],["wwlzmn","apiminzuo","xithsirok","ak","jhx","n","oy","dwhtca","yzrwagrumn","pgvojue"],["y","wx","sbwxq","zsapkewqdt","ymqbtyyeen","ptqtauz","gxodwobca","suz","ekfl","qadmis"],["tvrjcnsh","sjtt","fdlkeuo","miockrbm","hhgxbwtnso","fxvce","rvdhtiwhyz","akhww","gatdwvcuz","pbjmlcm"],["rcdsmqjh","hketieali","bsvtqrnvk","mscnjf","ifkgjydl","dla","euibkbrwp","rq","rup","qxajlq"]]}' },
  ],
}

export default function FindTheMostCommonResponse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DailyCountView run={run} step={step} />} renderReasoning={() => <>
    <p>The seen set is reset each day, so the count of an answer is really the number of days it appeared on, however many times it was repeated.</p>
    <p>Once the table is full, a single scan finds the winner. Comparing the count first and the word second means a tie always resolves to the alphabetically earliest answer, whatever order the table happens to be in.</p>
  </>} />
}
