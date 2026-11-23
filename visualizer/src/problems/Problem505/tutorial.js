// Reason-first script for shortest distance over stopping cells.
const spokenReasons = {
  start: 'Here is the big picture. The ball cannot stop just anywhere; it stops only where a wall blocks it. So we only track the cells where it can rest, and find the shortest route between those resting points.',
  pick: 'Now we take the resting cell that is closest to the start and has not been finished yet. Its distance is final, because every shorter route has already been considered.',
  roll: 'From this cell, the ball rolls in one direction until a wall stops it. The distance it covers is the number of empty cells it passes, and the stop becomes a new candidate.',
  relax: 'The new stop can be reached more cheaply through this cell, so we record the shorter distance for it.',
  done: 'The ball has stopped at the destination, and this is the shortest distance to get there.',
  lose: 'Every reachable stop has been finished, and the destination was never reached, so no route exists.',
}

const reasons = {
  start: 'The ball only stops at walls, so the graph has one node per stopping cell, not per empty cell.',
  pick: 'Taking the closest unfinished cell guarantees its distance is final, so we never revisit it.',
  roll: 'Each direction gives one edge: the ball rolls to the cell before the next wall.',
  relax: 'If the route through this cell is shorter, the stop keeps the new distance.',
  done: 'The destination was finished with its shortest distance.',
  lose: 'No unfinished stop is reachable, so the answer is -1.',
}

export function mazeTutorial({ step }) {
  return {
    title: reasons[step.phase] ? step.phase[0].toUpperCase() + step.phase.slice(1) : 'Next step',
    reason: reasons[step.phase] ?? reasons.start,
    spoken: { reason: spokenReasons[step.phase] ?? spokenReasons.start },
    action: step.message,
    variables: { current: step.current ? `[${step.current}]` : '—', next: step.next ? `[${step.next}]` : '—', steps: step.steps ?? '—' },
    focus: [],
  }
}
