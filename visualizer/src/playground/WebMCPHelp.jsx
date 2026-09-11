import { useState } from 'react';
import PlaygroundDialog from './PlaygroundDialog';
export default function WebMCPHelp() {
  const [open, setOpen] = useState(false);
  const [browser, setBrowser] = useState(() => /Edg\//.test(navigator.userAgent) ? 'edge' : 'chrome');
  const [notice, setNotice] = useState('');
  const address = `${browser}://flags/#enable-webmcp-testing`;
  return <><button className="runtime-playground__button" onClick={() => setOpen(true)}>WebMCP setup ↗</button>
    {open && <PlaygroundDialog title="Connect a browser agent with WebMCP" onClose={() => setOpen(false)}>
      <p>WebMCP lets a compatible browser agent work with this playground’s tools. It is optional: you can run code and use the playground without it.</p>
      <label>Browser<select value={browser} onChange={e => { setBrowser(e.target.value); setNotice(''); }}><option value="chrome">Google Chrome</option><option value="edge">Microsoft Edge</option></select></label>
      <ol><li>Copy this address and paste it into your browser’s address bar.</li><li>Find <strong>WebMCP for testing</strong>, select <strong>Enabled</strong>, and relaunch the browser.</li><li>Return to this playground. Check its WebMCP status, then connect your compatible agent.</li></ol>
      <div className="webmcp-copy"><input aria-label="WebMCP flags address" readOnly value={address} onFocus={e => e.target.select()} /><button onClick={async () => { try { await navigator.clipboard.writeText(address); setNotice('Copied. Paste into the address bar.'); } catch { setNotice('Select and copy the address above.'); } }}>Copy address</button></div>
      <p role="status">{notice}</p><p>If the flag is missing, update your browser or consult the preview documentation. Availability varies by version; enabling a flag does not install an AI agent.</p>
      <p><a href="https://developer.chrome.com/docs/ai/webmcp/" target="_blank" rel="noreferrer">Official WebMCP guide ↗</a> · <a href="https://developer.microsoft.com/en-us/microsoft-edge/origin-trials/trials" target="_blank" rel="noreferrer">Edge preview availability ↗</a></p>
    </PlaygroundDialog>}
  </>;
}
