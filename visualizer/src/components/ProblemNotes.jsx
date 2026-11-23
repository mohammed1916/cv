import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import './ProblemNotes.css';

// One "Problem" section per page. A visualizer publishes its goal, question and approaches; every page shows them
// in the same place, with the statement link. Pages with nothing published fall back to the catalogue description.
const NotesContext = createContext(null);

export function ProblemNotesProvider({ problem, children }) {
  const [notes, setNotes] = useState(null);
  const publish = useCallback(value => setNotes(value), []);
  return <NotesContext.Provider value={{ notes, publish, problem }}>{children}</NotesContext.Provider>;
}

export function usePublishProblemNotes() {
  return useContext(NotesContext)?.publish ?? (() => {});
}

const isLeetCode = problem => !problem.tags?.some(tag => tag === 'Basics' || tag === 'Codeforces') && problem.slug !== 'query-batching';

// In the page (panel=false) it steps aside when a visualizer hosts it as a dock panel; in a dock panel it always shows.
export default function ProblemNotes({ problem: problemProp, panel = false }) {
  const context = useContext(NotesContext);
  const problem = problemProp ?? context?.problem;
  const notes = context?.notes ?? null;
  if (!problem) return null;
  if (!panel && notes?.hosted) return null;
  const ref = useRef(null);
  const [more, setMore] = useState(false);
  const update = () => { const el = ref.current; if (el) setMore(el.scrollHeight - el.clientHeight - el.scrollTop > 6); };
  useEffect(() => {
    update();
    const el = ref.current;
    const observer = typeof ResizeObserver !== 'undefined' && el ? new ResizeObserver(update) : null;
    if (observer) observer.observe(el);
    return () => observer?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);
  const url = notes ? notes.url : isLeetCode(problem) ? `https://leetcode.com/problems/${problem.slug}/` : null;
  return <details ref={ref} className="problem-notes" open onScroll={update}>
    <summary>Problem</summary>
    {url && <p className="problem-notes__statement">
      <a className="problem-notes__statement-btn" href={url} target="_blank" rel="noreferrer">View the original statement on LeetCode ↗</a>
    </p>}
    {notes?.goal && <section className="problem-notes__section" aria-label="Goal">
      <h3>Goal</h3>
      <p>{notes.goal.summary}</p>
      {notes.goalDiagram}
      <ul>{(notes.goal.requirement ?? []).map(item => <li key={item}>{item}</li>)}</ul>
      <p><strong>Worked example:</strong> {notes.goal.example}</p>
    </section>}
    {(notes?.question || notes?.approaches?.length) && <section className="problem-notes__section" aria-label="Question and approaches">
      <h3>Question and approaches</h3>
      {notes.question && <p>{notes.question}</p>}
      {notes.approaches?.length ? <table className="problem-notes__approaches">
        <thead><tr><th>Approach</th><th>Intuition</th><th>Time</th><th>Space</th></tr></thead>
        <tbody>{notes.approaches.map(row => <tr key={row.name}><td>{row.name}</td><td>{row.intuition}</td><td>{row.time}</td><td>{row.space}</td></tr>)}</tbody>
      </table> : null}
    </section>}
    {notes?.story && <section className="problem-notes__section" aria-label="Story">
      <h3>Story</h3>
      {notes.story}
    </section>}
    {notes?.complexity ? <p>{notes.complexity}</p> : problem.description ? <p>{problem.description}</p> : null}
    {more && <div className="problem-notes__more" aria-hidden="true">↓ more below</div>}
  </details>;
}
