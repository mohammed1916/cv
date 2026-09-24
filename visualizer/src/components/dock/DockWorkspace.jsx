import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createLayout, findGroup, ids, insert, move, remove, update, visible } from './layout';
import './DockWorkspace.css';
import { minimizeMotion } from './minimizeMotion';

// Move stable DOM hosts, never React portal destinations. Inputs, editors, and
// playback survive regrouping, collapse, and floating without remounting.
function HostSlot({ host, parking, active }) {
  const slot = useRef(null);
  useLayoutEffect(() => {
    if (!host || !slot.current) return;
    const element = slot.current, storage = parking.current;
    element.appendChild(host);
    return () => { if (storage && host.parentNode === element) storage.appendChild(host); };
  }, [host, parking]);
  return <div ref={slot} className="local-dock-slot" hidden={!active} />;
}

function Split({ node, children, resize }) {
  const root = useRef(null), drag = useRef(null);
  const horizontal = node.axis === 'horizontal';
  const change = value => resize(node.key, Math.max(.08, Math.min(.92, value)));
  return <div ref={root} className={`local-dock-split ${node.axis}`}>
    <div className="local-dock-branch" style={{ flex: `${node.ratio} 1 0` }}>{children[0]}</div>
    <div className="local-dock-divider" role="separator" tabIndex={0} aria-label="Resize panels"
      aria-orientation={horizontal ? 'vertical' : 'horizontal'} aria-valuemin={8} aria-valuemax={92} aria-valuenow={Math.round(node.ratio * 100)}
      onKeyDown={event => {
        if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          change(event.key === 'Home' ? .08 : event.key === 'End' ? .92 : node.ratio + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -.03 : .03));
        }
      }}
      onPointerDown={event => {
        if (event.button !== 0) return;
        event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = root.current.getBoundingClientRect();
      }}
      onPointerMove={event => {
        const rect = drag.current;
        if (rect) change(horizontal ? (event.clientX - rect.left) / rect.width : (event.clientY - rect.top) / rect.height);
      }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} />
    <div className="local-dock-branch" style={{ flex: `${1 - node.ratio} 1 0` }}>{children[1]}</div>
  </div>;
}

export default function DockWorkspace({ panels, onPanelReady }) {
  const container = useRef(null), parking = useRef(null), records = useRef(new Map()), ready = useRef(onPanelReady);
  const external = useRef(new Map()), serial = useRef(0);
  const [tree, setTree] = useState(null), [hidden, setHidden] = useState(new Set()), [dragged, setDragged] = useState(null);
  const [entries, setEntries] = useState(new Map());
  const [minimizing, setMinimizing] = useState(new Set());
  const flights = useRef(new Map());
  const signature = JSON.stringify(panels);
  useLayoutEffect(() => { ready.current = onPanelReady; }, [onPanelReady]);
  const collapse = (id, collapsed = true) => {
    const commit = () => setHidden(current => {
      const next = new Set(current); if (collapsed) next.add(id); else next.delete(id); return next;
    });
    if (flights.current.has(id)) {
      if (collapsed) return;
      flights.current.get(id)(); flights.current.delete(id);
      setMinimizing(current => { const next = new Set(current); next.delete(id); return next; });
    }
    const workspace = container.current;
    const source = workspace?.querySelector(`[data-dock-tab="${CSS.escape(id)}"]`)?.closest('.local-dock-group');
    if (!collapsed || !source) { commit(); return; }
    setMinimizing(current => new Set([...current, id]));
    const cancel = minimizeMotion(workspace, source, id, () => {
      flights.current.delete(id);
      commit();
      setMinimizing(current => { const next = new Set(current); next.delete(id); return next; });
      const button = workspace.querySelector(`[data-restore-panel="${CSS.escape(id)}"]`);
      button?.animate([{ boxShadow: '0 0 0 3px var(--primary)', background: 'var(--primary)' }, { boxShadow: '0 0 0 0px transparent', background: 'var(--surface2)' }], { duration: 1400, easing: 'ease-out' });
    });
    flights.current.set(id, cancel);
  };
  useEffect(() => {
    const active = flights.current;
    return () => { active.forEach(cancel => cancel()); active.clear(); };
  }, []);

  useLayoutEffect(() => {
    const configs = JSON.parse(signature);
    const inlineStatus = configs.some(p => p.id === 'code') && configs.some(p => p.id === 'status');
    const docked = configs.filter(p => !(inlineStatus && p.id === 'status'));
    const allowed = new Set(docked.map(p => p.id));
    setHidden(current => new Set([...current].filter(id => allowed.has(id) || external.current.has(id))));
    for (const [id, record] of records.current) {
      if (!allowed.has(id)) { record.host.remove(); records.current.delete(id); }
    }
    const hosts = {};
    for (const config of docked) {
      let record = records.current.get(config.id);
      if (!record) {
        const host = document.createElement('div');
        host.className = 'local-dock-content';
        host.dataset.panelId = config.id;
        record = { host }; records.current.set(config.id, record);
      }
      record.title = config.title;
      if (config.id === 'code' && inlineStatus) {
        if (!record.status) {
          record.status = document.createElement('div'); record.status.className = 'local-dock-status'; record.status.dataset.panelId = 'status';
          record.code = document.createElement('div'); record.code.className = 'local-dock-code';
          record.host.append(record.status, record.code);
        }
        hosts.status = record.status; hosts.code = record.code;
      } else hosts[config.id] = record.code || record.host;
    }
    setTree(current => {
      if (!current) return createLayout(docked);
      let next = current;
      for (const id of ids(current)) if (!allowed.has(id) && !external.current.has(id)) next = remove(next, id);
      for (const config of docked) if (!ids(next).includes(config.id)) next = insert(next, config.id, null, config.dockMode?.replace('split-', '') || 'right', config.ratio);
      return next;
    });
    setEntries(new Map([...records.current, ...external.current]));
    ready.current?.(hosts, { applyCollapse: collapse });
  }, [signature]);

  useEffect(() => {
    const element = container.current;
    const mounted = external.current;
    function dock(event) {
      const { host, title, side = 'bottom', done } = event.detail;
      if (!host || [...mounted.values()].some(record => record.host === host)) return;
      const id = `floating:${++serial.current}`;
      mounted.set(id, { host, title }); host.classList.add('local-dock-content');
      setEntries(new Map([...records.current, ...mounted]));
      setTree(current => insert(current, id, null, side, .3));
      const undock = () => {
        if (!mounted.has(id)) return;
        mounted.delete(id); setEntries(new Map([...records.current, ...mounted])); host.classList.remove('local-dock-content'); document.body.appendChild(host);
        setTree(current => remove(current, id)); collapse(id, false);
      };
      done(undock);
    }
    // A docked floating panel's own collapse button must collapse its layout too.
    function collapseFloating(event) {
      const found = [...mounted].find(([, record]) => record.host.contains(event.target));
      if (found) collapse(found[0], event.detail.collapsed);
    }
    element.addEventListener('cpviz-dock-panel', dock);
    element.addEventListener('cpviz-collapse-panel', collapseFloating);
    return () => {
      element.removeEventListener('cpviz-dock-panel', dock);
      element.removeEventListener('cpviz-collapse-panel', collapseFloating);
      mounted.forEach(({ host }) => { host.classList.remove('local-dock-content'); document.body.appendChild(host); });
      mounted.clear();
    };
  }, []);

  const recordFor = id => entries.get(id);
  const layout = visible(tree, hidden);
  const relocate = (id, target, side) => { setTree(current => move(current, id, target, side)); collapse(id, false); setDragged(null); };
  const restore = id => {
    collapse(id, false);
    const record = external.current.get(id);
    record?.host.dispatchEvent(new CustomEvent('cpviz-restore-panel'));
    setTree(current => { const group = findGroup(current, id); return group ? update(current, group.key, node => ({ ...node, active: id })) : current; });
  };
  function renderNode(node) {
    if (!node) return null;
    if (node.type === 'split') return <Split key={node.key} node={node} resize={(key, ratio) => setTree(current => update(current, key, value => ({ ...value, ratio })))}>{[renderNode(node.first), renderNode(node.second)]}</Split>;
    return <section key={node.key} className="local-dock-group lumino-panel-widget" data-dock-group={node.key}>
      <header className="local-dock-header">
        <div className="local-dock-tabs" role="tablist" aria-label="Workspace panels">
          {node.tabs.map(id => <button key={id} type="button" role="tab" aria-selected={id === node.active} data-dock-tab={id}
            draggable onDragStart={event => { event.dataTransfer.setData('application/x-cpviz-panel', id); event.dataTransfer.effectAllowed = 'move'; setDragged(id); }} onDragEnd={() => setDragged(null)}
            onClick={() => setTree(current => update(current, node.key, value => ({ ...value, active: id })))}>{recordFor(id)?.title || id}</button>)}
        </div>
        <select aria-label={`Move ${recordFor(node.active)?.title || node.active}`} value="" onChange={event => { const [side, target] = JSON.parse(event.target.value); relocate(node.active, target, side); }}>
          <option value="" disabled>Move</option>
          {ids(tree).filter(id => id !== node.active && !hidden.has(id)).flatMap(id => ['left', 'right', 'top', 'bottom', 'tab'].map(side => <option key={`${id}:${side}`} value={JSON.stringify([side, id])}>{side === 'tab' ? 'Group with' : side + ' of'} {recordFor(id)?.title || id}</option>))}
        </select>
        <button type="button" aria-label={`Collapse ${recordFor(node.active)?.title || node.active}`} title="Collapse panel to restore strip" onClick={() => collapse(node.active)}>−</button>
      </header>
      <div className="local-dock-body">{node.tabs.map(id => <HostSlot key={id} host={recordFor(id)?.host} parking={parking} active={id === node.active} />)}</div>
      {dragged && <div className="local-dock-zones">{['left', 'right', 'top', 'bottom', 'tab'].map(side => <div key={side} className={`local-dock-zone ${side}`} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }} onDrop={event => { event.preventDefault(); if (dragged && ids(tree).includes(dragged)) relocate(dragged, node.active, side); }}>{side === 'tab' ? 'Group as tab' : side}</div>)}</div>}
    </section>;
  }
  return <div ref={container} className="local-dock-workspace lumino-dock-container" data-layout-panels={entries.size}>
    <div className="local-dock-layout">{layout ? renderNode(layout) : <p className="local-dock-empty">All panels are collapsed. Restore one below.</p>}</div>
    <footer className="local-dock-restore" aria-label="Collapsed panels">
      {[...new Set([...hidden, ...minimizing])].filter(id => recordFor(id)).map(id => <button type="button" key={id} data-restore-panel={id} className={minimizing.has(id) ? 'is-arriving' : ''} onClick={() => restore(id)}>{minimizing.has(id) ? '↓ Minimizing' : 'Restore'} {recordFor(id).title}</button>)}
      <span>Drag a tab or use Move to arrange panels · Drag dividers to resize</span>
    </footer>
    <div ref={parking} hidden />
    <div className="workspace-drop-targets" aria-hidden="true">{['left', 'right', 'bottom'].map(side => <div key={side} data-dock-side={side} className={`workspace-drop-target ${side}`}>Dock {side}</div>)}</div>
  </div>;
}
