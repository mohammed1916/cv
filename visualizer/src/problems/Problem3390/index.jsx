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
    { label: 'Single pass', input: '{"teams":{"Only":[1,2]},"passes":[[1,"00:01",2]]}' },
    { label: 'Passes at both time limits', input: '{"teams":{"Ash":[1,2,3],"Birch":[4,5]},"passes":[[1,"00:00",2],[2,"90:00",3],[4,"45:00",5]]}' },
    { label: 'Two teams interleaved', input: '{"teams":{"Ash":[1,2],"Birch":[3,4]},"passes":[[1,"10:00",3],[2,"10:01",4],[3,"10:02",2],[4,"10:03",1]]}' },
    { label: 'Long run: 12 players, 20 passes', input: '{"teams":{"Team1":[1,2,3],"Team2":[4,5,6],"Team3":[7,8,9],"Team4":[10,11,12]},"passes":[[9,"55:56",1],[8,"39:39",3],[10,"85:45",3],[10,"60:10",8],[4,"00:42",10],[12,"17:18",2],[6,"56:32",2],[3,"80:38",8],[6,"87:56",7],[7,"89:40",12],[11,"37:08",6],[9,"06:55",1],[1,"80:54",5],[11,"37:07",6],[4,"50:12",1],[6,"20:08",1],[3,"21:27",2],[3,"11:30",1],[8,"29:00",12],[8,"12:53",9]]}' },
  ],
}

export default function LongestTeamPassStreak() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PassLanes run={run} step={step} />} renderReasoning={() => <>
    <p>A run belongs to the team that sends the ball, so each team keeps its own counter. A pass by a rival sits in another lane and does not touch this team's counter; only this team losing the ball resets it.</p>
    <p>The SQL tab reaches the same answer with a window sum: counting lost passes so far gives every kept pass a run number, then grouping by that number gives each run's size. A team that never kept a pass produces no row.</p>
  </>} />
}
