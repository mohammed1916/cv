import { lazy, Suspense, useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import './PrerequisiteDrawer.css';

const Map = lazy(() => import('./PrerequisitesPage'));

export default function PrerequisiteDrawer({ open, onOpen, onClose, onSelect, pro }) {
  const dialog = useRef(null);
  const handle = useRef(null);
  const start = useRef(null);
  const dragged = useRef(false);
  const reduce = useReducedMotion();
  const pull = useMotionValue(0);
  const spring = useSpring(pull, { stiffness: 260, damping: 24 });
  const width = useTransform(spring, value => 36 + value);
  useEffect(() => {
    if (open && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current.open) { dialog.current.close(); handle.current?.focus(); }
  }, [open]);
  function finish(event, cancelled = false) {
    if (start.current === null) return;
    const distance = event.clientX - start.current;
    start.current = null;
    pull.set(0);
    if (!cancelled && distance > 65) onOpen();
  }
  return <>
    <motion.button ref={handle} className="prerequisite-edge" style={{ width }}
      aria-label="Open prerequisite map. Drag right or press Enter." aria-haspopup="dialog" aria-expanded={open}
      onPointerDown={event => {
        if (event.button !== 0) return;
        start.current = event.clientX; dragged.current = false;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (start.current === null) return;
        const distance = Math.max(0, event.clientX - start.current);
        if (distance > 6) dragged.current = true;
        pull.set(reduce ? 0 : Math.min(135, distance * .55));
      }}
      onPointerUp={event => finish(event)} onPointerCancel={event => finish(event, true)}
      onClick={event => { if (event.detail === 0 || !dragged.current) onOpen(); }}>
      <span className="prerequisite-edge-label">Prerequisite map</span><span aria-hidden="true">❯</span>
    </motion.button>
    <dialog ref={dialog} className="prerequisite-drawer" aria-label="Prerequisite map"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      {open && <motion.div className="prerequisite-drawer-surface" initial={{ x: reduce ? 0 : '-100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 230, damping: 29 }}>
        <div className="prerequisite-drawer-bar"><span>YOUR LEARNING PATH</span><button autoFocus onClick={onClose} aria-label="Close prerequisite map">Close ×</button></div>
        <Suspense fallback={<p className="prerequisite-loading">Loading prerequisite map…</p>}><Map onBack={onClose} onSelect={problem => { onClose(); onSelect(problem); }} pro={pro} /></Suspense>
      </motion.div>}
    </dialog>
  </>;
}
