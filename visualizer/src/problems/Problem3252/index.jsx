import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LeagueView from './LeagueView'
import { buildTrace, parseInput, code, sql, python, phases, inputLabel, complexity, examples, url } from './algorithm'
import { meta } from './meta'

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples, url }

export default function PremierLeagueTableRankingII() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <LeagueView step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>Tiers are decided from the position, not from the row number. RANK gives every tied team the position of the first of them, then skips ahead, so a team tied across a cutoff has the same position as a team inside it and stays in the higher tier.</p>
      <p>The cutoffs are the ceilings of one third and two thirds of the league, so rounding also favours the higher tiers. If everyone is level, everyone is at position 1 and in Tier 1, leaving the other tiers empty.</p>
    </>} />
}
