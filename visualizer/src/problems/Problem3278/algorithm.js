// Teaching model written for this visualizer. Scores follow the rule: start at 100, plus 10 for each
// skill where proficiency is above importance, minus 5 where it is below, and a candidate must cover every skill.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the projects and the candidate skills.' },
  { id: 'check', label: 'Check', description: 'A candidate must have every skill the project requires.' },
  { id: 'score', label: 'Score', description: 'Start at 100 and adjust for each skill by proficiency against importance.' },
  { id: 'pick', label: 'Pick', description: 'Keep the highest score, and the lower candidate_id on a tie.' },
  { id: 'skip', label: 'Skip', description: 'No candidate covers every skill, so the project gets no row.' },
  { id: 'output', label: 'Result', description: 'Return one row per project that has a pick, ordered by project_id.' },
]

export const code = `WITH matched AS (
  SELECT p.project_id, c.candidate_id, c.proficiency, p.importance
  FROM Projects p
  JOIN Candidates c ON c.skill = p.skill
),
scored AS (
  SELECT project_id, candidate_id, COUNT(*) AS matched_skills,
    100 + SUM(CASE WHEN proficiency > importance THEN 10
                   WHEN proficiency < importance THEN -5 ELSE 0 END) AS score
  FROM matched
  GROUP BY project_id, candidate_id
),
complete AS (
  SELECT s.project_id, s.candidate_id, s.score
  FROM scored s
  JOIN (SELECT project_id, COUNT(*) AS required FROM Projects GROUP BY project_id) r USING (project_id)
  WHERE s.matched_skills = r.required
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY score DESC, candidate_id) AS pick
  FROM complete
)
SELECT project_id, candidate_id, score FROM ranked WHERE pick = 1 ORDER BY project_id`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def best_candidates(projects, candidates):
    matched = projects.merge(candidates, on='skill')
    needed = projects.groupby('project_id').size().rename('required')
    rows = []
    for (project_id, candidate_id), group in matched.groupby(['project_id', 'candidate_id']):
        if len(group) != needed[project_id]:
            continue
        score = 100 + sum(10 if p > i else -5 if p < i else 0 for p, i in zip(group.proficiency, group.importance))
        rows.append((project_id, candidate_id, score))
    best = sorted(rows, key=lambda r: (r[0], -r[2], r[1]))
    picked = [r for k, r in enumerate(best) if k == 0 or best[k - 1][0] != r[0]]
    return picked`

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

const SKILL = /^[a-z][a-z0-9 ]{0,19}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Projects) || !Array.isArray(input.Candidates)) throw new Error('Use an object with Projects and Candidates lists.')
  if (input.Projects.length > 8 || input.Candidates.length > 10) throw new Error('Use at most 8 project rows and 10 candidate rows.')
  for (const p of input.Projects) {
    if (!Number.isInteger(p.project_id) || typeof p.skill !== 'string' || !SKILL.test(p.skill)) throw new Error('Each project needs an integer project_id and a lowercase skill.')
    if (!Number.isInteger(p.importance) || p.importance < 1 || p.importance > 5) throw new Error('importance is a whole number from 1 to 5.')
  }
  for (const c of input.Candidates) {
    if (!Number.isInteger(c.candidate_id) || typeof c.skill !== 'string' || !SKILL.test(c.skill)) throw new Error('Each candidate needs an integer candidate_id and a lowercase skill.')
    if (!Number.isInteger(c.proficiency) || c.proficiency < 1 || c.proficiency > 5) throw new Error('proficiency is a whole number from 1 to 5.')
  }
  return input
}

export function buildTrace(input) {
  const projectIds = [...new Set(input.Projects.map(p => p.project_id))].sort((a, b) => a - b)
  const candidateIds = [...new Set(input.Candidates.map(c => c.candidate_id))].sort((a, b) => a - b)
  const skillsOf = new Map()
  for (const c of input.Candidates) {
    if (!skillsOf.has(c.candidate_id)) skillsOf.set(c.candidate_id, new Map())
    skillsOf.get(c.candidate_id).set(c.skill, c.proficiency)
  }
  const picks = []
  const frames = []
  let view = null
  const push = (phase, sqlText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: lookupCode(sqlText), pythonLine: lookupPython(pyText), message,
    rows: picks.map(r => ({ ...r })), view: view && { ...view, candidates: view.candidates.map(c => ({ ...c })) }, ...extra,
  })
  push('load', 'FROM Projects p', 'matched = projects.merge', `Load ${projectIds.length} project${projectIds.length === 1 ? '' : 's'} and ${candidateIds.length} candidate${candidateIds.length === 1 ? '' : 's'}.`)
  for (const project_id of projectIds) {
    const required = input.Projects.filter(p => p.project_id === project_id).sort((a, b) => a.skill.localeCompare(b.skill))
    const skills = required.map(p => ({ skill: p.skill, importance: p.importance }))
    const candidates = []
    view = { project_id, skills, candidates }
    let best = null
    for (const candidate_id of candidateIds) {
      const have = skillsOf.get(candidate_id)
      const complete = required.every(p => have.has(p.skill))
      const cells = required.map(p => (have.has(p.skill) ? have.get(p.skill) : '-'))
      const entry = { candidate_id, cells, complete, score: null, current: true }
      candidates.forEach(c => { c.current = false })
      candidates.push(entry)
      push('check', 'JOIN Candidates', 'matched = projects.merge', complete
        ? `Candidate ${candidate_id} has every skill that project ${project_id} needs.`
        : `Candidate ${candidate_id} misses at least one skill for project ${project_id}.`, { current: candidate_id })
      if (!complete) continue
      let score = 100
      required.forEach(p => {
        const prof = have.get(p.skill)
        if (prof > p.importance) score += 10
        else if (prof < p.importance) score -= 5
        push('score', 'CASE WHEN proficiency > importance', 'sum(10 if p > i', `${p.skill}: proficiency ${prof} against importance ${p.importance}, score now ${score}.`, { current: candidate_id })
      })
      entry.score = score
      if (best === null || score > best.score) best = { candidate_id, score }
    }
    view.candidates.forEach(c => { c.current = false })
    if (best === null) {
      push('skip', 'WHERE s.matched_skills', 'continue', `Project ${project_id} has no candidate who covers every skill, so it gets no row.`)
      continue
    }
    picks.push({ project_id, candidate_id: best.candidate_id, score: best.score })
    push('pick', 'WHERE pick = 1', 'picked = [r for', `Project ${project_id} takes candidate ${best.candidate_id} with score ${best.score}.`, { current: best.candidate_id })
  }
  view = null
  const result = picks.map(r => ({ ...r })).sort((a, b) => a.project_id - b.project_id)
  push('output', 'ORDER BY project_id', 'return picked', `Return ${result.length} project row${result.length === 1 ? '' : 's'}.`)
  return { input, result, frames }
}
