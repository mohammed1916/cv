import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'free: min-heap of ids released by remove; next_id counts fresh ids',
  'upload: reuse the smallest free id, otherwise take next_id',
  'remove: delete the video and push its id onto free',
  'watch: add one view to the video if it exists',
  'like or dislike: add one reaction if it exists',
  'stats: return [likes, dislikes] for the video',
  'return one result per operation that answers a question',
].map((text, index) => ({ line: index + 1, text }))

const python = `import heapq

def run_ops(ops):
    free, next_id, videos, out = [], 0, {}, []
    for op in ops:
        name = op[0]
        if name == "upload":
            if free:
                vid = heapq.heappop(free)
            else:
                vid = next_id
                next_id += 1
            videos[vid] = {"views": 0, "likes": 0, "dislikes": 0}
            out.append(vid)
        elif name == "remove":
            if op[1] in videos:
                del videos[op[1]]
                heapq.heappush(free, op[1])
            out.append(None)
        elif name == "watch":
            if op[1] in videos:
                videos[op[1]]["views"] += 1
            out.append(None)
        elif name in ("like", "dislike"):
            if op[1] in videos:
                videos[op[1]][name + "s"] += 1
            out.append(None)
        else:
            v = videos.get(op[1])
            out.append([v["likes"], v["dislikes"]] if v else [-1])
    return out
`

const PY = { upload: 14, remove: 18, watch: 22, react: 26, stats: 30, done: 31 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input?.ops) || input.ops.length > 20) throw new Error('ops is at most 20 operations.')
  const names = ['upload', 'remove', 'watch', 'like', 'dislike', 'stats']
  input.ops.forEach(op => {
    if (!Array.isArray(op) || !names.includes(op[0])) throw new Error('Operations are upload, remove, watch, like, dislike or stats.')
    if (op[0] !== 'upload' && !Number.isInteger(op[1])) throw new Error('Operations on a video need its integer id.')
  })
  return { ops: input.ops }
}

export function build({ ops }) {
  const free = []
  let nextId = 0
  const videos = new Map()
  const frames = []
  const results = []
  const snap = () => ({
    free: [...free].sort((a, b) => a - b),
    videos: [...videos.entries()].sort((a, b) => a[0] - b[0]).map(([id, v]) => ({ id, ...v })),
  })
  ops.forEach((op, index) => {
    const [name, id] = op
    let result = null
    let line = 2, pyLine = PY.upload
    if (name === 'upload') {
      line = 2
      pyLine = PY.upload
      let vid
      if (free.length) {
        free.sort((a, b) => a - b)
        vid = free.shift()
      } else {
        vid = nextId
        nextId += 1
      }
      videos.set(vid, { views: 0, likes: 0, dislikes: 0 })
      result = vid
    } else if (name === 'remove') {
      line = 3; pyLine = PY.remove
      if (videos.has(id)) { videos.delete(id); free.push(id) }
    } else if (name === 'watch') {
      line = 4; pyLine = PY.watch
      if (videos.has(id)) videos.get(id).views += 1
    } else if (name === 'like' || name === 'dislike') {
      line = 5; pyLine = PY.react
      if (videos.has(id)) videos.get(id)[`${name}s`] += 1
    } else {
      line = 6; pyLine = PY.stats
      const v = videos.get(id)
      result = v ? [v.likes, v.dislikes] : [-1]
    }
    results.push(result)
    frames.push({ phase: name === 'like' || name === 'dislike' ? 'react' : name, activeLine: line, pythonLine: pyLine, message: `Operation ${index + 1}: ${op.join(' ')}`, op, state: snap(), result })
  })
  frames.push({ phase: 'done', activeLine: 7, pythonLine: PY.done, message: 'All operations processed.', op: null, state: snap(), result: null })
  return { input: { ops }, result: results, frames }
}

const definition = {
  phases: [
    { id: 'upload', label: 'Upload', description: 'Reuse the smallest free id.' },
    { id: 'remove', label: 'Remove', description: 'Free an id for reuse.' },
    { id: 'watch', label: 'Watch', description: 'Count a view.' },
    { id: 'react', label: 'Reactions', description: 'Count a like or dislike.' },
    { id: 'stats', label: 'Stats', description: 'Read likes and dislikes.' },
    { id: 'done', label: 'Result', description: 'All operations processed.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with ops: [\'upload\'], [\'remove\', id], [\'watch\', id], [\'like\', id], [\'dislike\', id], [\'stats\', id]',
  url: 'https://leetcode.com/problems/design-video-sharing-platform/',
  complexity: 'Upload and remove use a heap for free ids; the visualization sorts the free list for display. Watch and reactions are constant-time updates. The content of a watched video is not modelled, only the view count.',
  examples: [
    { label: 'Example', input: '{"ops":[["upload"],["upload"],["like",0],["watch",0],["remove",0],["upload"],["stats",1]]}' },
  ],
}

export default function DesignVideoSharingPlatform() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Videos">
      <thead><tr><th>Id</th><th>Views</th><th>Likes</th><th>Dislikes</th></tr></thead>
      <tbody>{step.state.videos.map(v => <tr key={v.id}><td>{v.id}</td><td>{v.views}</td><td>{v.likes}</td><td>{v.dislikes}</td></tr>)}</tbody>
    </table>
    <p aria-label="Free ids">Free ids: {step.state.free.join(', ') || 'none'}</p>
    <output aria-label="Operation result">{step.op ? `${step.op.join(' ')} → ${JSON.stringify(step.result)}` : `${run.result.length} operations`}</output>
  </>} renderReasoning={() => <>
    <p>Removed ids wait in a min-heap so the next upload always gets the smallest free id. Only when nothing is free does a fresh id appear.</p>
    <p>Views and reactions are plain counters attached to each live video.</p>
  </>} />
}
