import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_PROBLEMS } from '../data/problemRoutes';
import { LEARNING_TOPICS, TOPIC_BY_ID, buildLearningIndex, prerequisitePath } from '../data/learningGraph';
import { isFreeProblem } from '../access/policy';
import './PrerequisitesPage.css';

const index = buildLearningIndex(ALL_PROBLEMS);
const position = topic => ({ x: 28 + topic.column * 260, y: 64 + topic.row * 125 });

function TopicWindow({ topic, onClose, onTopic, onSelect, pro }) {
  const dialog = useRef(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);
  const entry = index.byTopic[topic.id];
  const filtered = entry.problems.filter(problem => `${problem.number} ${problem.title} ${problem.difficulty}`.toLowerCase().includes(query.toLowerCase().trim()));
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className="learning-dialog" aria-labelledby="learning-dialog-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="learning-dialog-content">
      <header><div><span className="learning-eyebrow">TOPIC GUIDE</span><h2 id="learning-dialog-title">{topic.title}</h2></div><button autoFocus onClick={onClose} aria-label="Close topic guide">✕</button></header>
      <p>{topic.summary}</p>
      <div className="learning-goal"><strong>What you’ll learn</strong><p>{topic.goal}</p></div>
      <section><h3>Learn before this</h3>{topic.requires.length ? <div className="learning-chips">{topic.requires.map(id => <button key={id} onClick={() => onTopic(id)}>{TOPIC_BY_ID[id].title} ↗</button>)}</div> : <p>No prerequisites on this map. Start here.</p>}
        {topic.note && <p className="learning-note">{topic.note}</p>}
        {topic.related?.length > 0 && <div className="learning-chips"><span>Related:</span>{topic.related.map(id => <button key={id} onClick={() => onTopic(id)}>{TOPIC_BY_ID[id].title} ↗</button>)}</div>}
      </section>
      {entry.capabilities.length > 0 && <section><h3>See it in motion <small>{entry.capabilities.length} visual features</small></h3><div className="learning-features">{entry.capabilities.map(feature => <details key={feature.id}><summary>{feature.title}</summary><p>{feature.description}</p><div className="learning-chips">{feature.problems.map(number => index.byNumber.get(number)).filter(Boolean).map(problem => <button key={problem.number} onClick={() => onSelect(problem)}>#{problem.number} {problem.title}{!isFreeProblem(problem) && !pro ? ' · Pro' : ''} ↗</button>)}</div></details>)}</div></section>}
      <section><h3>Practice this topic <small>{entry.problems.length} available</small></h3><label className="learning-search">Find a problem<input value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }} placeholder="Title, number, or difficulty…" /></label>
        <div className="learning-problems">{filtered.slice(0, limit).map(problem => <button key={problem.number} onClick={() => onSelect(problem)}><span><small>#{problem.number} · {problem.difficulty}{!isFreeProblem(problem) && !pro ? ' · Pro' : ''}</small><strong>{problem.title}</strong></span><span>{entry.recommended.includes(problem) ? 'Start here' : 'Explore'} ↗</span></button>)}</div>
        {!filtered.length && <p>No matching problems. Try another title or number.</p>}
        {filtered.length > limit && <button className="learning-more" onClick={() => setLimit(value => value + 12)}>Show more ({filtered.length - limit} remaining)</button>}
        <p className="learning-note">“Start here” entries are curated. Other matches come from catalog topic tags and indexed visual features.</p>
      </section>
      <section><h3>Where to go next</h3><div className="learning-chips">{LEARNING_TOPICS.filter(item => item.requires.includes(topic.id)).map(item => <button key={item.id} onClick={() => onTopic(item.id)}>{item.title} ↗</button>)}</div>{!LEARNING_TOPICS.some(item => item.requires.includes(topic.id)) && <p>Apply this idea in the recommended problems above.</p>}</section>
    </div>
  </dialog>;
}

export default function PrerequisitesPage({ onBack, onSelect, pro }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [escapeHidden, setEscapeHidden] = useState(false);
  const current = hovered && !escapeHidden ? TOPIC_BY_ID[hovered] : null;
  const ancestors = useMemo(() => new Set(current ? prerequisitePath(current.id) : []), [current]);
  const matches = LEARNING_TOPICS.filter(topic => `${topic.id} ${topic.title} ${topic.summary}`.toLowerCase().includes(query.toLowerCase().trim()));
  const matchingIds = new Set(matches.map(topic => topic.id));
  function preview(id) { setHovered(id); setEscapeHidden(false); }
  return <main className="learning-page" onKeyDown={event => { if (event.key === 'Escape') { setHovered(null); setEscapeHidden(true); } }}>
    <header className="learning-header"><button onClick={onBack}>← Problems</button><span className="learning-eyebrow">THE LEARNING MAP / 12 CONNECTED IDEAS</span></header>
    <div className="learning-intro"><div><h1>Build the foundations.<br /><em>Then connect the dots.</em></h1><p>Find what to learn first, see how ideas connect, and choose a visualizer to make it click.</p></div><label className="learning-search">Find a concept<input type="search" placeholder="Try queue, recursion, or DP…" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
    <div className="learning-legend"><span><i /> Prerequisite → next concept</span><span>Hover or focus to preview · Click to explore</span><span>{matches.length} concepts shown</span></div>
    <div className="learning-map-scroll" role="region" aria-label="Prerequisite graph, scroll horizontally on small screens" tabIndex={0}>
      <div className="learning-map">
        <div className="learning-columns">{['01 / Foundations', '02 / Build intuition', '03 / Solve & explore', '04 / Go deeper'].map(label => <span key={label}>{label}</span>)}</div>
        <svg viewBox="0 0 1060 575" aria-hidden="true"><defs><marker id="learning-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>{LEARNING_TOPICS.flatMap(topic => topic.requires.map(id => {
          const start = position(TOPIC_BY_ID[id]); const end = position(topic);
          const active = current && (topic.id === current.id || ancestors.has(topic.id)) && ancestors.has(id);
          const path = topic.column - TOPIC_BY_ID[id].column > 1
            ? `M ${start.x + 218} ${start.y + 40} C ${start.x + 240} ${start.y + 40}, ${start.x + 230} ${start.y - 14}, ${start.x + 250} ${start.y - 14} L ${end.x - 30} ${start.y - 14} C ${end.x - 12} ${start.y - 14}, ${end.x - 24} ${end.y + 40}, ${end.x - 3} ${end.y + 40}`
            : `M ${start.x + 218} ${start.y + 40} C ${start.x + 242} ${start.y + 40}, ${end.x - 24} ${end.y + 40}, ${end.x - 3} ${end.y + 40}`;
          return <path key={`${id}-${topic.id}`} className={`${active ? 'is-active' : ''} ${!matchingIds.has(id) || !matchingIds.has(topic.id) ? 'is-dim' : ''}`} d={path} markerEnd="url(#learning-arrow)" />;
        }))}</svg>
        {LEARNING_TOPICS.map(topic => {
          const pos = position(topic); const entry = index.byTopic[topic.id];
          return <button key={topic.id} style={{ left: pos.x, top: pos.y }} className={`learning-node ${current?.id === topic.id ? 'is-current' : ''} ${ancestors.has(topic.id) ? 'is-ancestor' : ''} ${!matchingIds.has(topic.id) ? 'is-dim' : ''}`} hidden={!matchingIds.has(topic.id)} onMouseEnter={() => preview(topic.id)} onFocus={() => preview(topic.id)} onClick={() => setSelected(topic.id)} aria-label={`${topic.title}, ${entry.problems.length} problems. Open topic guide.`} aria-describedby={current?.id === topic.id ? 'learning-preview' : undefined}>
            <span>{topic.requires.length ? `${topic.requires.length} prerequisites` : 'Start here'} <span aria-hidden="true">↗</span></span><strong>{topic.title}</strong><small>{entry.problems.length} problems{entry.capabilities.length ? ` · ${entry.capabilities.length} visual features` : ''}</small>
          </button>;
        })}
      </div>
    </div>
    {!matches.length && <p role="status">No concepts match “{query}”. <button onClick={() => setQuery('')}>Clear search</button></p>}
    <aside className="learning-preview" id="learning-preview" aria-live="polite"><span className="learning-preview-icon" aria-hidden="true">◎</span><div><strong>{current ? current.title : 'Your next “aha” starts with one concept.'}</strong><p>{current ? current.summary : 'Follow the arrows from left to right. Select any concept for prerequisites, visual features, and practice problems.'}</p>{current && <small>{index.byTopic[current.id].capabilities.slice(0, 2).map(feature => feature.title).join(' · ') || 'Explore the recommended problem visualizers'}</small>}</div>{current && <button onClick={() => setSelected(current.id)}>Explore topic ↗</button>}</aside>
    <p className="learning-footnote">A curated starting map, not a required syllabus. Prerequisites describe this learning path; related ideas appear inside each topic guide.</p>
    {selected && <TopicWindow key={selected} topic={TOPIC_BY_ID[selected]} onClose={() => setSelected(null)} onTopic={setSelected} onSelect={problem => { setSelected(null); onSelect(problem); }} pro={pro} />}
  </main>;
}
