import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createProblemWorkspace } from './problemWorkspace';
import '../access/access.css';

export default function OpenProblemInPlayground({ source, input, disabled, generic = false }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef(null);
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);
  const slug = generic ? (window.location.hash.slice(1).split('?')[0] || 'solution') : 'climbing-stairs';
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  function launch() {
    try {
      const metadata = createProblemWorkspace(localStorage, { source, input, slug, title }, crypto.randomUUID());
      const url = new URL(window.location.href);
      url.searchParams.set('workspace', metadata.id);
      url.hash = 'playground';
      window.location.assign(url.href);
    } catch (failure) { setError(failure.message); }
  }
  return <>
    <button type="button" className="ctp-copy-btn" disabled={disabled} onClick={() => { setError(''); setOpen(true); }}>Edit in Code Playground</button>
    {open && createPortal(<dialog ref={dialog} className="access-dialog" onCancel={() => setOpen(false)} aria-labelledby="problem-playground-title">
      <h2 id="problem-playground-title">Edit {title} in Code Playground?</h2>
      <p>Copy this solution {input ? 'and the current input' : 'with suggested sample inputs'} into a separate saved workspace. Your existing playground draft stays intact.</p>
      <p>Edit and run Python there to inspect its execution. Custom edits use general execution visuals; AI suggestions still require your acceptance.</p>
      <p>Normal playground sign-in and usage limits still apply.</p>
      {error && <p role="alert">{error}</p>}
      <div className="access-actions"><button type="button" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="access-primary" onClick={launch}>Open playground</button></div>
    </dialog>, document.body)}
  </>;
}
