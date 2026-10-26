import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
import './GameTreeScene.css'

/** One scene for every frame: the current tree, the slots of the vertex in focus, and the scores so far. */
export default function GameTreeScene({ frame, index }) {
  const s = frame.scene
  const slotsOf = s.panel && s.slots ? s.slots[s.panel - 1] : null
  const incoming = s.incoming && s.incoming.to === s.panel ? s.incoming : null
  return <div className="gt-scene">
    <div className="gt-scene__tree">
      <RootedTreeDiagram root={s.root} roles={s.roles} title={`Tree after query ${s.query}`} />
      <p className="gt-legend">
        <span className="gt-key is-new" /> new vertex
        <span className="gt-key is-focus" /> sender
        <span className="gt-key is-target" /> receiver
        <span className="gt-key is-best" /> best vertex
      </p>
    </div>
    <div className="gt-scene__side">
      {slotsOf && <section className="gt-slots" aria-label={`Slots of vertex ${s.panel}`}>
        <h4>Vertex {s.panel}: three longest branches</h4>
        <div className="gt-slots__row">
          {[0, 1, 2].map(r => <div key={r} className={`gt-slot ${incoming && incoming.rank === r + 1 ? 'is-kept' : ''}`}>
            <small>slot {r + 1}</small><strong>{slotsOf[r] || '·'}</strong>
          </div>)}
        </div>
        {incoming && <div key={index} className={`gt-chip ${incoming.rank ? 'is-kept' : 'is-pruned'}`}>
          branch {incoming.value} {incoming.rank ? `→ slot ${incoming.rank}` : '→ pruned'}
        </div>}
      </section>}
      {frame.scene.scoreOfQuery !== undefined && <p className="gt-score">Score after query {s.query}: <strong>{frame.scene.scoreOfQuery}</strong></p>}
      <section className="gt-answers" aria-label="Scores so far">
        <h4>Scores so far</h4>
        {s.answers.length === 0 ? <p className="gt-muted">None yet.</p> : <div className="gt-answers__list">
          {s.answers.map((value, i) => <span key={i} className="gt-answer">{i + 1}: <strong>{value}</strong></span>)}
        </div>}
      </section>
    </div>
  </div>
}
