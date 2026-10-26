import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_PROBLEMS } from '../data/problemRoutes';
import { buildLearningIndex, prerequisitePath } from '../data/learningGraph';
import { LEARNING_CONCEPTS, LEARNING_TOPICS, CONCEPT_BY_ID, LEARNING_SOURCES, conceptPath, searchLearningCatalog } from '../data/learningTaxonomy';
import { isFreeProblem } from '../access/policy';
import './PrerequisitesPage.css';

const index = buildLearningIndex(ALL_PROBLEMS);
const position = concept => ({ x: 28 + concept.column * 260, y: 64 + concept.row * 156 });
const mapHeight = 64 + (Math.max(...LEARNING_TOPICS.map(item => item.row)) + 1) * 156;
const rootId = id => conceptPath(id)[0];
const label = id => CONCEPT_BY_ID[id].title;

function ConceptLinks({ ids, onSelect }) {
  return <div className="learning-chips">{ids.map(id => <button key={id} onClick={() => onSelect(id)}>{label(id)} ↗</button>)}</div>;
}

function ConceptCard({ concept, style, overview, active, ancestor, onPreview, onGuide, onExpand, buttonRef }) {
  const entry = index.byConcept[concept.id];
  return <div style={style} className={`${overview ? 'learning-node' : 'learning-concept-card'} ${active ? 'is-current' : ''} ${ancestor ? 'is-ancestor' : ''}`} onMouseEnter={() => onPreview(concept.id)} onFocus={() => onPreview(concept.id)}>
    <button className="learning-node-guide" onClick={() => onGuide(concept.id)} aria-label={`Open ${concept.title} guide`}>
      <span>{entry.problems.length ? `${entry.problems.length} problem visualizers` : 'Concept only · no indexed visualizer'} <span aria-hidden="true">↗</span></span>
      <strong>{concept.title}</strong>
      {!overview && <span className="learning-card-summary">{concept.summary}</span>}
      <small>{entry.capabilities.length ? `${entry.capabilities.length} indexed visual features` : 'Prerequisites & learning guide'}</small>
    </button>
    {entry.children.length > 0 && <button ref={buttonRef} className="learning-expand" onClick={() => onExpand(concept.id)} aria-label={`Expand ${concept.title}: ${entry.children.length} subtopics`}>+ {entry.children.length} subtopics <span aria-hidden="true">→</span></button>}
  </div>;
}

function ConceptWindow({ id, onClose, onConcept, onBrowse, onSelect, pro }) {
  const dialog = useRef(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);
  const [onlyDirect, setOnlyDirect] = useState(false);
  const concept = CONCEPT_BY_ID[id];
  const entry = index.byConcept[id];
  const members = onlyDirect ? entry.ungrouped : entry.problems;
  const filtered = members.filter(problem => `${problem.number} ${problem.title} ${problem.difficulty}`.toLowerCase().includes(query.toLowerCase().trim()));
  const path = conceptPath(id);
  const source = LEARNING_SOURCES[concept.source];
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} className="learning-dialog" aria-labelledby="learning-dialog-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="learning-dialog-content">
      <header><div><span className="learning-eyebrow">CONCEPT GUIDE</span><h2 id="learning-dialog-title">{concept.title}</h2></div><button autoFocus onClick={onClose} aria-label="Close concept guide">✕</button></header>
      {concept.parent && <nav className="learning-breadcrumb" aria-label="Concept home">{path.slice(0, -1).map(parent => <button key={parent} onClick={() => onConcept(parent)}>{label(parent)} /</button>)}</nav>}
      <p>{concept.summary}</p>
      {concept.note && <p className="learning-goal">{concept.note}</p>}
      {entry.children.length > 0 && <section className="learning-guide-children"><h3>Break this down</h3><button onClick={() => onBrowse(id)}>Expand {entry.children.length} subtopics on the map →</button><details><summary>Choose a subtopic here</summary><ConceptLinks ids={entry.children.map(item => item.id)} onSelect={onConcept} /></details></section>}
      <section><h3>Learn before this</h3>{concept.requires.length ? <ConceptLinks ids={concept.requires} onSelect={onConcept} /> : <p>No additional prerequisites on this learning path.</p>}
        <p className="learning-note">Prerequisites are separate from the topic’s home. They describe a suggested learning path, not every possible implementation.</p>
      </section>
      {concept.related.length > 0 && <section><h3>Also used with</h3><ConceptLinks ids={concept.related} onSelect={onConcept} /><p className="learning-note">These links open the same concept, not a second copy.</p></section>}
      {entry.capabilities.length > 0 && <section><h3>See it in motion</h3><div className="learning-features">{entry.capabilities.map(feature => <details key={feature.id}><summary>{feature.title}</summary><p>{feature.description}</p><div className="learning-chips">{feature.problems.map(number => index.byNumber.get(number)).map(problem => <button key={problem.number} onClick={() => onSelect(problem)}>#{problem.number} {problem.title}{!isFreeProblem(problem) && !pro ? ' · Pro' : ''} ↗</button>)}</div></details>)}</div></section>}
      <section><h3>Practice & visualizers <small aria-live="polite">{filtered.length} matches</small></h3>
        {!entry.problems.length ? <div className="learning-empty"><strong>Concept only for now</strong><p>No problem visualizer is indexed for this concept yet. Explore its prerequisites{source ? ' or the reference below' : ''}.</p></div> : <>
          {entry.children.length > 0 && <label className="learning-checkbox"><input type="checkbox" checked={onlyDirect} onChange={event => { setOnlyDirect(event.target.checked); setLimit(12); }} />Only problems not yet grouped into subtopics ({entry.ungrouped.length})</label>}
          <label className="learning-search">Find a problem<input value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }} placeholder="Title, number, or difficulty…" /></label>
          <div className="learning-problems">{filtered.slice(0, limit).map(problem => <button key={problem.number} onClick={() => onSelect(problem)}><span><small>#{problem.number} · {problem.difficulty}{!isFreeProblem(problem) && !pro ? ' · Pro' : ''}</small><strong>{problem.title}</strong></span><span>{entry.recommended.includes(problem) ? 'Suggested' : 'Catalog match'} ↗</span></button>)}</div>
          {!filtered.length && <p role="status">No problems match this filter. <button onClick={() => { setQuery(''); setOnlyDirect(false); }}>Reset filters</button></p>}
          {filtered.length > limit && <button className="learning-more" onClick={() => setLimit(value => value + 12)}>Show more ({filtered.length - limit} remaining)</button>}
          <p className="learning-note">Includes subtopics. Suggested problems are curated; other matches use catalog tags. A problem may have multiple approaches. Only the visual features listed above are explicitly indexed.</p>
        </>}
      </section>
      {source && <p><a href={source.url} target="_blank" rel="noreferrer">Read: {source.title} ↗</a></p>}
    </div>
  </dialog>;
}

export default function PrerequisitesPage({ onBack, onSelect, pro }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(12);
  const heading = useRef(null);
  const searchInput = useRef(null);
  const expandButtons = useRef(new Map());
  const returnTo = useRef(null);
  const current = CONCEPT_BY_ID[hovered];
  const ancestorRoots = useMemo(() => new Set(current ? prerequisitePath(current.id).map(rootId) : []), [current]);
  const results = searchLearningCatalog(query);
  const searching = Boolean(query.trim());
  const visibleRootIds = new Set(searching ? results.map(item => rootId(item.id)) : LEARNING_TOPICS.map(item => item.id));
  const branch = expanded && CONCEPT_BY_ID[expanded];
  const branchEntry = expanded && index.byConcept[expanded];
  function browse(id) {
    if (!index.byConcept[id].children.length) { setSelected(id); return; }
    setSelected(null); setExpanded(id); setHovered(id);
  }
  function overview() { returnTo.current = expanded && rootId(expanded); setExpanded(null); setHovered(null); }
  useEffect(() => {
    if (expanded) heading.current?.focus();
    else if (returnTo.current) {
      (expandButtons.current.get(returnTo.current) || searchInput.current)?.focus();
      returnTo.current = null;
    }
  }, [expanded]);
  return <main className="learning-page" onKeyDown={event => { if (event.key === 'Escape' && !selected) { if (expanded) overview(); setHovered(null); } }}>
    <header className="learning-header"><button onClick={onBack}>← Problems</button><span className="learning-eyebrow">LEARNING MAP / {LEARNING_TOPICS.length} AREAS / {LEARNING_CONCEPTS.length} CONCEPTS</span></header>
    <div className="learning-intro"><div><h1>One concept. One home.<br /><em>Many ways to connect.</em></h1><p>Expand an area, follow its prerequisites, and find a small practice path. Cross-topic links take you to the same concept wherever you start.</p></div><label className="learning-search">Find any concept<input ref={searchInput} type="search" placeholder="Prefix sums, knapsack, alpha-beta…" value={query} onChange={event => { setQuery(event.target.value); setSearchLimit(12); }} /></label></div>
    {searching && <section className="learning-search-results" aria-label="Concept search results"><span role="status">{results.length} concepts found</span><div className="learning-chips">{results.slice(0, searchLimit).map(item => <button key={item.id} onClick={() => browse(item.id)}><small>{conceptPath(item.id).slice(0, -1).map(label).join(' / ') || 'Topic'}</small><strong>{item.title}</strong></button>)}</div>{results.length > searchLimit && <button onClick={() => setSearchLimit(value => value + 12)}>Show more results</button>}<button onClick={() => setQuery('')}>Clear search</button></section>}
    <div className="learning-legend"><span><i />{expanded ? 'Dotted branches = belongs under' : 'Hover or focus = prerequisite connections'}</span><span>Title → guide · + subtopics → expand</span><span>Concept-only entries remain visible</span></div>
    <aside className="learning-preview" aria-live="polite"><span className="learning-preview-icon" aria-hidden="true">◎</span><div><strong>{current?.title || 'Start broad. Expand only what you need.'}</strong><p>{current?.summary || 'Prefix sums lives under Arrays; string and range-query techniques link to that same entry. Follow breadcrumbs to explore deeper without losing your place.'}</p>{current && <small>{index.byConcept[current.id].capabilities.slice(0, 2).map(feature => feature.title).join(' · ') || (index.byConcept[current.id].problems.length ? 'Open the guide for suggested problems' : 'Concept only · no indexed visualizer yet')}</small>}</div>{current && <button onClick={() => setSelected(current.id)}>Open guide ↗</button>}</aside>
    {branch ? <section className="learning-cluster" aria-labelledby="learning-cluster-title">
      <nav className="learning-breadcrumb" aria-label="Map location"><button onClick={overview}>← All areas</button>{conceptPath(expanded).map(id => <button key={id} aria-current={id === expanded ? 'location' : undefined} onClick={() => browse(id)}>{label(id)}</button>)}</nav>
      <div className="learning-cluster-parent"><span className="learning-eyebrow">{conceptPath(expanded).length === 1 ? 'TOPIC' : 'SUBTOPIC'}</span><h2 id="learning-cluster-title" ref={heading} tabIndex={-1}>{branch.title}</h2><p>{branch.summary}</p><button onClick={() => setSelected(expanded)}>Open guide & practice ↗</button></div>
      <div className="learning-pattern-grid" id="learning-expanded-patterns">{branchEntry.children.map(item => <ConceptCard key={item.id} concept={item} active={hovered === item.id} onPreview={setHovered} onGuide={setSelected} onExpand={browse} />)}</div>
      {(branch.requires.length > 0 || branch.related.length > 0) && <div className="learning-cluster-links">{branch.requires.length > 0 && <section><h3>Learn before this</h3><ConceptLinks ids={branch.requires} onSelect={setSelected} /></section>}{branch.related.length > 0 && <section><h3>Also used with</h3><ConceptLinks ids={branch.related} onSelect={setSelected} /></section>}</div>}
      <footer><p>Subtopic counts overlap. A canonical concept can apply to several data structures.</p><button onClick={() => branch.parent ? browse(branch.parent) : overview()}>← {branch.parent ? label(branch.parent) : 'All areas'}</button><button aria-expanded={true} aria-controls="learning-expanded-patterns" onClick={overview}>Collapse to overview</button></footer>
    </section> : <div className="learning-map-scroll" role="region" aria-label="Topic graph; scroll horizontally on narrow screens" tabIndex={0}>
      <div className="learning-map" style={{ height: mapHeight }}>
        <div className="learning-columns">{['01 / Represent data', '02 / Explore & transform', '03 / Reuse & optimize', '04 / Specialize'].map(text => <span key={text}>{text}</span>)}</div>
        <svg viewBox={`0 0 1060 ${mapHeight}`} style={{ height: mapHeight }} aria-hidden="true"><defs><marker id="learning-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>{current && LEARNING_TOPICS.flatMap(item => [...new Set(item.requires.map(rootId))].filter(id => id !== item.id && visibleRootIds.has(id) && visibleRootIds.has(item.id) && (item.id === rootId(current.id) || ancestorRoots.has(item.id))).map(id => {
          const start = position(CONCEPT_BY_ID[id]); const end = position(item);
          const direction = end.x >= start.x ? 1 : -1;
          const from = start.x + (direction > 0 ? 218 : 0); const to = end.x + (direction > 0 ? -3 : 221);
          const path = `M ${from} ${start.y + 40} C ${from + direction * 28} ${start.y + 40}, ${to - direction * 28} ${end.y + 40}, ${to} ${end.y + 40}`;
          return <path key={`${id}-${item.id}`} className="is-active" d={path} markerEnd="url(#learning-arrow)" />;
        }))}</svg>
        {LEARNING_TOPICS.filter(item => visibleRootIds.has(item.id)).map(item => { const pos = position(item); return <ConceptCard key={item.id} concept={item} style={{ left: pos.x, top: pos.y }} overview active={hovered === item.id} ancestor={ancestorRoots.has(item.id)} onPreview={setHovered} onGuide={setSelected} onExpand={browse} buttonRef={element => { if (element) expandButtons.current.set(item.id, element); else expandButtons.current.delete(item.id); }} />; })}
      </div>
    </div>}
    <p className="learning-footnote">This is a curated, expandable taxonomy, not a complete syllabus. The topic hierarchy, suggested prerequisites, and cross-topic links serve different purposes.</p>
    {selected && <ConceptWindow key={selected} id={selected} onClose={() => setSelected(null)} onConcept={setSelected} onBrowse={browse} onSelect={problem => { setSelected(null); onSelect(problem); }} pro={pro} />}
  </main>;
}
