import "./SkillFitView.css";

export default function SkillFitView({ step }) {
  const view = step.view
  if (!view) return <p className="sf-muted">Projects are handled one at a time. The table for the current project appears here.</p>
  return (
    <div className="sf-view">
      <p className="sf-muted">Project {view.project_id}: a candidate needs every skill in the header. Score starts at 100.</p>
      <table className="sf-table" aria-label={`Candidates for project ${view.project_id}`}>
        <thead>
          <tr>
            <th scope="col">candidate</th>
            {view.skills.map(s => <th key={s.skill} scope="col">{s.skill} (importance {s.importance})</th>)}
            <th scope="col">score</th>
          </tr>
        </thead>
        <tbody>
          {view.candidates.map(c => (
            <tr key={c.candidate_id} className={`${c.current ? "is-current" : ""} ${c.candidate_id === step.current && step.phase === "pick" ? "is-picked" : ""} ${c.complete ? "" : "is-missing"}`}>
              <th scope="row">{c.candidate_id}</th>
              {c.cells.map((cell, i) => <td key={i}>{cell}</td>)}
              <td>{c.score ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
