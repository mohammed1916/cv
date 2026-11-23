import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HiringBudgetView from './HiringBudgetView'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
  question: "Find senior and junior candidates who can join a company when they are admitted in salary order within a budget, with the answer returned as a combined set.",
  approaches: [
    { name: "Cumulative sum with window", intuition: "Order candidates by salary and accumulate a running total to determine how many fit the budget.", time: "O(n log n)", space: "O(n)" },
  ],
}

export default function SeniorsAndJuniorsToJoinTheCompanyII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <HiringBudgetView run={run} step={step} />} renderReasoning={() => <>
    <p>Seniors spend first, so the junior budget is whatever they leave behind. The two levels are therefore settled in that fixed order.</p>
    <p>Within a level salaries only rise, so the first one that does not fit rules out everyone after it. In SQL, that same stop is a running total per level compared with the budget.</p>
  </>} />
}
