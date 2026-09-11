import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function PlaygroundDialog({ title, onClose, children }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return createPortal(<dialog ref={ref} className="playground-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header><h2 id={titleId}>{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog">Close ×</button></header>
    <div className="playground-dialog__body">{children}</div>
  </dialog>, document.body);
}
