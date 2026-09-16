import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createProblemWorkspace } from './problemWorkspace';
import '../access/access.css';

export default function OpenProblemInPlayground({ source, input, disabled }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef(null);
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);
  function launch() {
    try {
      const metadata = createProblemWorkspace(localStorage, { source, input }, crypto.randomUUID());
      const url = new URL(window.location.href);
      url.searchParams.set('workspace', metadata.id);
      url.hash = 'playground';
      window.location.assign(url.href);
    } catch (failure) { setError(failure.message); }
  }
  return <>
    <button type="button" className="ctp-copy-btn" disabled={disabled} onClick={() => { setError(''); setOpen(true); }}>Open in Code Playground</button>
    {open && createPortal(<dialog ref={dialog} className="access-dialog" onCancel={() => setOpen(false)} aria-labelledby="problem-playground-title">
      <h2 id="problem-playground-title">Open Climbing Stairs in Code Playground?</h2>
      <p>Copy the solution and current input (n = {input.n}) into a separate saved workspace. Your existing playground draft stays intact.</p>
      <p>The staircase follows the supported solution’s Python trace. Changed code uses general execution visuals. AI fixes are applied only after you review and accept them.</p>
      <p>Normal playground sign-in and usage limits still apply.</p>
      {error && <p role="alert">{error}</p>}
      <div className="access-actions"><button type="button" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="access-primary" onClick={launch}>Open playground</button></div>
    </dialog>, document.body)}
  </>;
}
