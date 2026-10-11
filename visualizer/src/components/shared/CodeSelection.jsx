/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { useOptionalChatContext } from '../../context/ChatContext';
import { codeSelectionPayload, selectCodeLines } from './codeSelection.js';
import './CodeSelection.css';

export function SelectModeToggle({ enabled, onChange }) {
  return <button type="button" className="code-select-toggle" role="switch" aria-checked={enabled} onClick={onChange}>
    <span className="code-select-switch" aria-hidden="true" /> Select mode <strong>{enabled ? 'On' : 'Off'}</strong>
  </button>;
}

// Shared by both code renderers; practice mode never attaches or sends a message.
export function useCodeSelection(code, title, practice = false) {
  const chat = useOptionalChatContext();
  const source = JSON.stringify(code);
  const [localMode, setLocalMode] = useState(false);
  const [state, setState] = useState({ source, selected: [], anchor: null });
  const [notice, setNotice] = useState('');
  const selected = state.source === source ? state.selected : [];
  const enabled = practice || !chat ? localMode : chat.selectMode;
  const toggle = () => {
    if (practice || !chat) setLocalMode(value => !value); else chat.toggleSelectMode();
  };
  const choose = (line, event) => {
    if (!enabled) return;
    event.preventDefault(); event.stopPropagation();
    setNotice('');
    setState(previous => ({ source, anchor: line, selected: selectCodeLines(code, previous.source === source ? previous.selected : [], line, previous.source === source ? previous.anchor : null, event.shiftKey) }));
  };
  const attach = () => {
    if (!selected.length) return;
    if (practice) { setNotice('Practice complete. These lines would be attached; nothing was sent.'); return; }
    if (!chat) return;
    chat.attachContext(`${title} · ${selected.length} selected line${selected.length === 1 ? '' : 's'}`, codeSelectionPayload(code, selected, title));
    chat.disableSelectMode(); chat.openChat();
    setNotice('Code attached. Add your question in chat, then send.');
  };
  const rowProps = line => ({
    'data-code-selected': selected.includes(line) || undefined,
    role: enabled ? 'button' : undefined,
    tabIndex: enabled ? 0 : undefined,
    'aria-pressed': enabled ? selected.includes(line) : undefined,
    'aria-label': enabled ? `Select code line ${line}` : undefined,
    onClick: event => choose(line, event),
    onKeyDown: event => { if (enabled && (event.key === 'Enter' || event.key === ' ')) choose(line, event); },
  });
  return { enabled, selected, rowProps, toolbar: <div className="code-selection-toolbar" data-chat-ignore>
    <SelectModeToggle enabled={enabled} onChange={toggle} />
    <span>{selected.length ? `${selected.length} lines selected` : 'Choose code to discuss'}</span>
    <button type="button" disabled={!selected.length || (!chat && !practice)} onClick={attach}>{practice ? 'Try attaching' : 'Attach to chat'}</button>
    <button type="button" disabled={!selected.length} onClick={() => { setState({ source, selected: [], anchor: null }); setNotice(''); }}>Clear</button>
    {enabled && <small>Click lines to toggle them. Shift-click selects a range. Keyboard: Tab, then Enter or Space.</small>}
    {notice && <small role="status">{notice}</small>}
  </div> };
}
