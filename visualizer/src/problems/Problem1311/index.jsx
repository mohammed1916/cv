import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const base = '"watchedVideos":[["a","b"],["c"],["b","c"],["d"]],"friends":[[1,2],[0,3],[0,3],[1,2]],"id":0'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set your distance to zero and queue yourself.' },
    { id: 'visit', label: 'Expand', description: 'Visit the next person in the queue and label unseen friends.' },
    { id: 'collect', label: 'Count', description: 'Count videos of people at the requested distance.' },
    { id: 'done', label: 'Sort', description: 'Sort by count, then by name.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with watchedVideos, friends, id and level (JSON)',
  url: 'https://leetcode.com/problems/get-watched-videos-by-your-friends/',
  complexity: 'O(n + E + V log V) time for n people, E friendships and V videos. The visualization caps people at 8.',
  examples: [
    { label: 'Level 1', input: `{${base},"level":1}` },
    { label: 'Level 2', input: `{${base},"level":2}` },
    { label: "Single person", input: "{\"watchedVideos\":[[\"alpha\"]],\"friends\":[[]],\"id\":0,\"level\":1}" },
    { label: "Equal counts sort by name", input: "{\"watchedVideos\":[[\"x\"],[\"beta\"],[\"alpha\"]],\"friends\":[[1,2],[0],[0]],\"id\":0,\"level\":1}" },
    { label: "Chain of eight, deepest level", input: "{\"watchedVideos\":[[\"alpha\"],[\"beta\",\"gamma\"],[\"alpha\"],[\"beta\",\"gamma\"],[\"alpha\"],[\"beta\",\"gamma\"],[\"alpha\"],[\"beta\",\"gamma\"]],\"friends\":[[1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[6]],\"id\":0,\"level\":8}" },
    { label: "Long run: eight people, random friends", input: "{\"watchedVideos\":[[\"gamma\"],[\"beta\",\"gamma\",\"alpha\"],[\"beta\"],[\"sigma\"],[\"alpha\"],[\"alpha\",\"beta\",\"gamma\"],[\"delta\",\"sigma\",\"gamma\"],[\"alpha\"]],\"friends\":[[1,2,4,5],[0,2,6,7],[0,1,7],[6],[0,5],[0,4,7],[1,3],[1,2,5]],\"id\":0,\"level\":3}" },
  ],
}

export default function WatchedVideos() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <GraphTraversalView title="Friend network (BFS)" n={run.input.friends.length} edges={run.edges}
      labels={run.input.friends.map((_, i) => `P${i}`)} current={step.current} visited={step.visited}
      done={step.done} frontier={step.frontier} frontierTitle="Queue" />
    <output aria-label="Watched state">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each step of breadth-first search adds one friendship, so the first time a person is reached is their true distance.</p>
    <p>Only people at exactly the requested distance contribute videos; closer friends and further friends are skipped.</p>
  </>} />
}
