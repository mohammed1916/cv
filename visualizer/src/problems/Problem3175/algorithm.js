export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with skills and k.')
  const { skills, k } = data
  if (!Array.isArray(skills) || skills.length < 2 || skills.length > 12) throw new Error('skills holds 2 to 12 players.')
  if (skills.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each skill is an integer from 1 to 100.')
  if (new Set(skills).size !== skills.length) throw new Error('Skills must be distinct so every game has one winner.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { skills, k }
}

export function buildTrace(input) {
  const { skills, k } = input
  const queue = skills.map((_, i) => i).slice(1)
  let champion = 0
  let streak = 0
  const frames = [{ phase: 'start', activeLine: L('put players 1 to n minus 1'), champion, challenger: -1, streak, queue: [...queue], message: `Player 0 starts as champion. The queue holds the other ${queue.length} players.` }]
  while (streak < k) {
    const challenger = queue.shift()
    const championWins = skills[champion] > skills[challenger]
    if (championWins) {
      streak += 1
      queue.push(challenger)
    } else {
      queue.push(champion)
      champion = challenger
      streak = 1
    }
    frames.push({ phase: 'game', activeLine: L(championWins ? 'add 1 to streak' : 'make the challenger the champion'), champion, challenger, streak, queue: [...queue],
      message: `Player ${champion} won this game. Streak: ${streak} of ${k}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the champion'), champion, challenger: -1, streak, queue: [...queue], message: `Player ${champion} is the first to win ${k} games in a row.` })
  return { input, result: champion, frames }
}

export const code = `find the first player to win k games in a row
  put players 1 to n minus 1 in a queue, with player 0 as the champion
  set streak to 0
  repeat
    take the challenger from the front of the queue
    if the champion has more skill than the challenger then
      add 1 to streak and put the challenger at the back of the queue
    otherwise
      put the champion at the back of the queue, make the challenger the champion, and set streak to 1
    if streak equals k then return the champion`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_first_to_win_k(skills, k):
    queue = list(range(1, len(skills)))
    champion = 0
    streak = 0
    while True:
        challenger = queue.pop(0)
        if skills[champion] > skills[challenger]:
            streak += 1
            queue.append(challenger)
        else:
            queue.append(champion)
            champion = challenger
            streak = 1
        if streak == k:
            return champion
`
