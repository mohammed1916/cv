import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3664',
  phases: [
    { id: 'start', label: 'Groups', description: 'Sort each card by where x sits.' },
    { id: 'option', label: 'Split', description: 'Choose how many only-x cards pair with each group.' },
    { id: 'done', label: 'Result', description: 'Report the best total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with cards (two-letter strings) and x (one letter)',
  url: 'https://leetcode.com/problems/two-letter-card-game/',
  complexity: 'Tries each number of only-x cards and counts 26 letters per group, so the work is about 26 times the number of cards.',
  examples: [
    { label: 'Mixed', input: '{"cards":["ca","bc","cc","ac","cb","bb"],"x":"c"}' },
    { label: 'No partner', input: '{"cards":["ab","cd","ef"],"x":"z"}' },
    { label: 'Two cards', input: '{"cards":["ab","ac"],"x":"a"}' },
    { label: 'Equal cards', input: '{"cards":["aa","aa","bb"],"x":"a"}' },
    { label: 'Largest card count', input: '{"cards":["zz","zz","zz","zz","zz","zz","zz","zz","zz","zz","zz","zz"],"x":"z"}' },
    { label: 'Long run: 12 cards', input: '{"cards":["fb","bg","af","gd","ca","ge","dc","ed","cf","bf","gf","gg"],"x":"c"}' },
  ],
}

export default function TwoLetterCardGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section className="algorithm-sequence" aria-label="Card groups">
      <h3>Groups for x = {run.input.x}</h3>
      <table>
        <tbody>
          <tr><th scope="row">x first, like "x?"</th><td>{step.summary.firstTotal} cards</td></tr>
          <tr><th scope="row">x second, like "?x"</th><td>{step.summary.secondTotal} cards</td></tr>
          <tr><th scope="row">only x, like "xx"</th><td>{step.summary.both} cards</td></tr>
        </tbody>
      </table>
    </section>
    <output aria-label="Split check">{step.p < 0
      ? `Best total: ${step.best}`
      : `p = ${step.p} only-x cards pair with x-first cards, q = ${step.q} pair with x-second cards. Total ${step.total}, best so far ${step.best}.`}</output>
  </>} renderReasoning={() => <>
    <p>A card that contains x can pair only with another card in the same group or with an only-x card. Cards with x first never pair with cards with x second.</p>
    <p>Inside a group, two cards pair only when their other letters differ, so the largest letter class limits the pairs.</p>
  </>} />
}
