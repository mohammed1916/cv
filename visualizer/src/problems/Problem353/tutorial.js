// Reason-first script. Each scene says why this step of the game is needed, then what it does.
const spokenReasons = {
  start: 'Here is the big picture. The snake lives on a grid, and every move either takes it to a free cell, onto food, or into a wall or its own body. We need to track the head, the body and the food, and check each move before we make it.',
  move: 'Now a move. The head goes one cell in the chosen direction, and before anything else we ask whether that cell is still on the grid. Leaving the grid ends the game.',
  eat: 'The head landed on the next food. Food makes the snake grow, so the tail stays where it is, and the score goes up by one.',
  slide: 'The head moved to an empty cell. The tail moves up by one, which keeps the length the same, and the score does not change.',
  lose: 'The move can no longer be played. The game is over, and this move returns minus one.',
  done: 'That completes every move. The list of results is the answer.',
}

const reasons = {
  start: 'Keep the body as a queue of cells, with the head first. Each move changes the body in one place at each end.',
  move: 'Check the new head cell before changing the body. Leaving the grid is an immediate loss.',
  eat: 'Eating keeps the tail in place, so the body grows by one cell and the score increases.',
  slide: 'Without food the tail is removed before the collision check, so moving into the cell the tail just vacated is allowed.',
  lose: 'A collision with the body or the wall ends the game, and the move returns minus one.',
  done: 'Every move has produced its result.',
}

export function snakeTutorial({ step }) {
  const phase = step.phase
  return {
    title: phase === 'move' ? `Move ${step.move}` : (reasons[phase] ? phase[0].toUpperCase() + phase.slice(1) : 'Next step'),
    reason: reasons[phase] ?? reasons.start,
    spoken: { reason: spokenReasons[phase] ?? spokenReasons.start },
    action: step.message,
    variables: {
      score: step.score,
      length: step.body.length,
      head: step.body[0] ? `[${step.body[0]}]` : '—',
    },
    focus: [],
  }
}
