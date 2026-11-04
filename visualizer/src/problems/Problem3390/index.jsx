import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PassLanes from './PassLanes'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'

const definition = {
  number: '3390', phases,
  parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: 'Object with teams (name to player ids) and passes ([from, "MM:SS", to])',
  url: 'https://leetcode.com/problems/longest-team-pass-streak/',
  complexity: 'O(p log p + t) for p passes and t players: sorting by time dominates. The visualization shows up to 20 passes with distinct times and up to 6 teams.',
  examples: [
    { label: 'Run broken, then rebuilt', input: '{"teams":{"Rovers":[11,12,13],"Comets":[21,22]},"passes":[[11,"02:10",12],[12,"03:40",13],[21,"05:00",22],[13,"06:20",21],[22,"07:05",21],[21,"08:15",22],[11,"09:30",13]]}' },
    { label: 'Team with no kept pass', input: '{"teams":{"Aces":[1,2],"Bears":[3,4]},"passes":[[1,"10:00",3],[2,"11:00",4],[3,"12:00",4]]}' },
    { label: 'Listed out of order', input: '{"teams":{"Lynx":[5,6,7],"Owls":[8]},"passes":[[6,"30:00",7],[5,"10:00",6],[7,"20:00",8],[7,"40:00",5]]}' },
    { label: 'No passes', input: '{"teams":{"Solo":[1]},"passes":[]}' },
  ],
}

export default function LongestTeamPassStreak() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PassLanes run={run} step={step} />} renderReasoning={() => <>
    <p>A run belongs to the team that sends the ball, so each team keeps its own counter. A pass by a rival sits in another lane and does not touch this team's counter; only this team losing the ball resets it.</p>
    <p>The SQL tab reaches the same answer with a window sum: counting lost passes so far gives every kept pass a run number, then grouping by that number gives each run's size. A team that never kept a pass produces no row.</p>
  </>} />
}
