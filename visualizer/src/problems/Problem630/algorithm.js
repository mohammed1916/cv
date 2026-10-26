export function parseInput(text) {
  const courses = JSON.parse(text)
  if (!Array.isArray(courses) || courses.length < 1 || courses.length > 200) throw new Error('Enter a JSON array of 1–200 [duration, lastDay] pairs.')
  if (courses.some(c => !Array.isArray(c) || c.length !== 2 || !Number.isInteger(c[0]) || !Number.isInteger(c[1]) || c[0] < 1 || c[1] < 1 || c[0] > 10000 || c[1] > 10000000)) throw new Error('Each course needs an integer duration 1–10,000 and a last day 1–10,000,000.')
  return courses
}

// Process courses by deadline. Keep a max-heap of durations taken; when a deadline breaks,
// drop the longest course taken so far (it frees the most time at no cost to the count).
export function buildTrace(courses) {
  const sorted = courses.map(([duration, last], index) => ({ duration, last, index })).sort((a, b) => a.last - b.last || a.index - b.index)
  let time = 0
  const taken = []
  const frames = [{ phase: 'start', time, taken: [], course: null, activeLine: 2, message: 'Process courses in order of their last day.' }]
  for (const course of sorted) {
    time += course.duration
    taken.push(course)
    frames.push({ phase: 'take', time, taken: taken.map(c => c.duration), course, activeLine: 5, message: `Take [${course.duration}, ${course.last}]; finish time ${time}.` })
    if (time > course.last) {
      let longest = 0
      for (let i = 1; i < taken.length; i++) if (taken[i].duration > taken[longest].duration) longest = i
      const dropped = taken.splice(longest, 1)[0]
      time -= dropped.duration
      frames.push({ phase: 'drop', time, taken: taken.map(c => c.duration), course: dropped, activeLine: 8, message: `Past its deadline. Drop the longest course taken so far, duration ${dropped.duration}; time ${time}.` })
    }
  }
  const result = taken.length
  frames.push({ phase: 'done', time, taken: taken.map(c => c.duration), course: null, result, activeLine: 10, message: `Maximum courses: ${result}.` })
  return { input: courses, result, frames }
}

export const code = `def scheduleCourse(courses):
    time, heap = 0, []
    for duration, last in sorted(courses, key=lambda c: c[1]):
        time += duration
        heapq.heappush(heap, -duration)
        if time > last:
            time += heapq.heappop(heap)
    return len(heap)`.split('\n').map((text, index) => ({ line: index + 1, text }))
