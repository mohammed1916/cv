// Knowledge-derived teaching model written for this visualizer. Not the official statement text.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the project and candidate tables.' },
  { id: 'join', label: 'Join', description: 'Pair each project with candidates who have its skill.' },
  { id: 'rank', label: 'Rank', description: 'Order candidates by proficiency, then candidate id.' },
  { id: 'pick', label: 'Pick', description: 'Keep the first candidate for the project.' },
  { id: 'skip', label: 'Skip', description: 'No candidate has this skill, so the project has no row.' },
  { id: 'output', label: 'Result', description: 'Return one row per project that has a pick.' },
]

export const code = `WITH ranked AS (
  SELECT p.project_id, c.candidate_id, c.proficiency,
    ROW_NUMBER() OVER (PARTITION BY p.project_id ORDER BY c.proficiency DESC, c.candidate_id) AS pick
  FROM Projects p
  JOIN Candidates c ON c.skill = p.skill
)
SELECT project_id, candidate_id, proficiency
FROM ranked
WHERE pick = 1
ORDER BY project_id`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def best_candidates(projects, candidates):
    joined = projects.merge(candidates, on='skill')
    joined = joined.sort_values(['project_id', 'proficiency', 'candidate_id'], ascending=[True, False, True])
    best = joined.groupby('project_id').head(1)
    return best[['project_id', 'candidate_id', 'proficiency']].sort_values('project_id')
`

const lookupCode = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
const lookupPython = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Projects) || !Array.isArray(input.Candidates)) throw new Error('Use an object with Projects and Candidates lists.')
  if (input.Projects.length > 8 || input.Candidates.length > 10) throw new Error('Use at most 8 projects and 10 candidates.')
  for (const p of input.Projects) {
    if (!Number.isInteger(p.project_id) || typeof p.skill !== 'string' || !/^[a-z]+$/.test(p.skill)) throw new Error('Each project needs an integer project_id and a lowercase skill.')
  }
  for (const c of input.Candidates) {
    if (!Number.isInteger(c.candidate_id) || typeof c.skill !== 'string' || !/^[a-z]+$/.test(c.skill)) throw new Error('Each candidate needs an integer candidate_id and a lowercase skill.')
    if (!Number.isInteger(c.proficiency) || c.proficiency < 1 || c.proficiency > 5) throw new Error('proficiency is a whole number from 1 to 5.')
  }
  return input
}

export function buildTrace(input) {
  const projects = [...input.Projects].sort((a, b) => a.project_id - b.project_id)
  const picks = []
  const rows = () => picks.map(r => ({ ...r }))
  const frames = []
  const push = (phase, sqlText, pyText, message) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message, rows: rows(),
  })
  push('load', 'FROM Projects p', 'projects.merge', `Load ${projects.length} projects and ${input.Candidates.length} candidates.`)
  for (const project of projects) {
    const matches = input.Candidates.filter(c => c.skill === project.skill)
      .sort((a, b) => b.proficiency - a.proficiency || a.candidate_id - b.candidate_id)
    push('join', 'JOIN Candidates', 'joined = projects.merge', `Project ${project.project_id} (${project.skill}) matches ${matches.length} candidate${matches.length === 1 ? '' : 's'}.`)
    if (matches.length === 0) {
      push('skip', 'JOIN Candidates', 'joined = projects.merge', `Project ${project.project_id} has no candidate with ${project.skill}, so it gets no row.`)
      continue
    }
    push('rank', 'ROW_NUMBER()', 'ascending=', `Order project ${project.project_id}'s candidates by proficiency, highest first, then by id.`)
    const top = matches[0]
    picks.push({ project_id: project.project_id, candidate_id: top.candidate_id, proficiency: top.proficiency })
    push('pick', 'WHERE pick = 1', 'head(1)', `Keep candidate ${top.candidate_id} for project ${project.project_id}.`)
  }
  const result = rows().sort((a, b) => a.project_id - b.project_id)
  push('output', 'ORDER BY project_id', 'return best', `Return ${result.length} project row${result.length === 1 ? '' : 's'}.`)
  return { input, result, frames }
}
