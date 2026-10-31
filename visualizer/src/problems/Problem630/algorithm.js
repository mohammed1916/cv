import { TracedHeap, heapView } from '../../components/shared/heapModel.js'
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
  const heap = new TracedHeap((a, b) => b - a, { order: 'max' })
  const hv = () => heapView(heap, { title: 'Max-heap of taken durations (root = longest, the one to drop)' }).heap
  const frames = [{ phase: 'start', time, taken: [], course: null, heapState: hv(), activeLine: L('sort the courses'), pythonLine: 6, message: 'Process courses in order of their last day.' }]
  for (const course of sorted) {
    time += course.duration
    taken.push(course)
    heap.push(course.duration)
    frames.push({ phase: 'take', time, taken: taken.map(c => c.duration), course, heapState: hv(), activeLine: L('add duration to time'), pythonLine: 7, message: `Take [${course.duration}, ${course.last}]; finish time ${time}.` })
    if (time > course.last) {
      let longest = 0
      for (let i = 1; i < taken.length; i++) if (taken[i].duration > taken[longest].duration) longest = i
      const dropped = taken.splice(longest, 1)[0]
      heap.pop()
      time -= dropped.duration
      frames.push({ phase: 'drop', time, taken: taken.map(c => c.duration), course: dropped, heapState: hv(), activeLine: L('pop the longest'), pythonLine: 10, message: `Past its deadline. Drop the longest course taken so far, duration ${dropped.duration}; time ${time}.` })
    }
  }
  const result = taken.length
  frames.push({ phase: 'done', time, taken: taken.map(c => c.duration), course: null, result, heapState: hv(), activeLine: L('return the number'), pythonLine: 11, message: `Maximum courses: ${result}.` })
  return { input: courses, result, frames }
}

export const code = `sort the courses by last day, earliest first
set time to 0 and keep a max-heap of the durations taken
for each course with a duration and a last day:
  add duration to time and push duration onto the heap
  if time is greater than last day:
    pop the longest duration from the heap and subtract it from time
return the number of durations left in the heap`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def schedule_course(courses):
    time = 0
    heap = []
    for duration, last in sorted(courses, key=lambda c: c[1]):
        time += duration
        heapq.heappush(heap, -duration)
        if time > last:
            time += heapq.heappop(heap)
    return len(heap)`
