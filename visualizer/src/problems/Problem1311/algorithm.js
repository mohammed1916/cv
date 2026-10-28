export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with watchedVideos, friends, id and level.')
  const { watchedVideos, friends, id, level } = input
  if (!Array.isArray(friends) || friends.length < 1 || friends.length > 8) throw new Error('Use 1 to 8 people in friends.')
  const n = friends.length
  if (friends.some(list => !Array.isArray(list))) throw new Error('Each friends entry is a list of person indices.')
  if (!Array.isArray(watchedVideos) || watchedVideos.length !== n) throw new Error('watchedVideos needs one list per person.')
  if (watchedVideos.some(list => !Array.isArray(list) || list.length > 4 || new Set(list).size !== list.length || list.some(v => typeof v !== 'string' || !/^[a-z]{1,8}$/.test(v)))) throw new Error('Each video is a distinct lowercase name of 1 to 8 letters.')
  if (!Number.isInteger(id) || id < 0 || id >= n) throw new Error('id must be a person index.')
  if (!Number.isInteger(level) || level < 1 || level > n) throw new Error('level must be from 1 to the number of people.')
  friends.forEach((list, i) => list.forEach(j => {
    if (!Number.isInteger(j) || j < 0 || j >= n || j === i || !friends[j].includes(i)) throw new Error('friends must list symmetric person indices with no self-links.')
  }))
  return { watchedVideos, friends, id, level }
}

export function buildTrace({ watchedVideos, friends, id, level }) {
  const n = friends.length
  const edges = []
  friends.forEach((list, i) => list.forEach(j => { if (i < j) edges.push([i, j]) }))
  const dist = new Array(n).fill(-1)
  dist[id] = 0
  const queue = [id]
  const frames = [{ phase: 'start', activeLine: L('set every distance to unset'), current: null, visited: [id], done: [], frontier: [id], message: `Start at person ${id} with distance 0.` }]
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]
    frames.push({ phase: 'visit', activeLine: L('take the first person'), current, visited: queue.slice(), done: queue.slice(0, head), frontier: queue.slice(head + 1), message: `Person ${current} is at distance ${dist[current]}.` })
    for (const friend of friends[current]) {
      if (dist[friend] === -1) { dist[friend] = dist[current] + 1; queue.push(friend) }
    }
  }
  const counts = new Map()
  const atLevel = []
  for (let p = 0; p < n; p++) {
    if (dist[p] !== level) continue
    atLevel.push(p)
    for (const v of watchedVideos[p]) counts.set(v, (counts.get(v) || 0) + 1)
  }
  frames.push({ phase: 'collect', activeLine: L('count the videos'), current: null, visited: queue.slice(), done: queue.slice(), frontier: [], message: `People at distance ${level}: ${atLevel.join(', ') || 'none'}.` })
  const result = [...counts.keys()].sort((a, b) => counts.get(a) - counts.get(b) || (a < b ? -1 : a > b ? 1 : 0))
  frames.push({ phase: 'done', activeLine: L('return the videos'), current: null, visited: queue.slice(), done: queue.slice(), frontier: [], message: `Videos: ${result.join(', ') || 'none'}.` })
  return { input: { watchedVideos, friends, id, level }, result, frames, edges }
}

export const code = `watched videos of friends at an exact level:
  set every distance to unset and set the start person to distance zero
  set the queue to hold the start person
  while the queue is not empty
    take the first person from the queue as current
    for each friend of current with unset distance
      set that friend's distance to current distance plus one and add the friend to the queue
  set the counts of videos to empty
  for each person whose distance equals level
    count the videos that person watched
  sort the videos by count and then by name
  return the videos`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def watched_videos_by_friends(watchedVideos, friends, id, level):
    dist = {id: 0}
    queue = [id]
    for current in queue:
        for friend in friends[current]:
            if friend not in dist:
                dist[friend] = dist[current] + 1
                queue.append(friend)
    counts = {}
    for person, d in dist.items():
        if d == level:
            for video in watchedVideos[person]:
                counts[video] = counts.get(video, 0) + 1
    return sorted(counts, key=lambda v: (counts[v], v))
`
