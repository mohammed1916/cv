import { describeTrieOps, trieWalkCells } from './trieModel.js'
import './TrieView.css'

/**
 * Trie operations in words: the characters of the current walk (created / reused / missing) and one
 * sentence per operation. The node diagram itself is TrieStateDiagram. `ops` come from the trie helper.
 */
export default function TrieView({ word, ops = [], title = 'Trie operations' }) {
  const lines = describeTrieOps(ops)
  const cells = trieWalkCells(ops)
  if (!lines.length) return null
  return <section className="trie-view" aria-label="Trie operations">
    <h3>{title}</h3>
    {cells.length > 0 && <div className="trie-view__walk" aria-label={`Characters walked${word ? ` for ${word}` : ''}`}>
      {word && <span className="trie-view__word">{word}</span>}
      {cells.map((cell, i) => <span key={i} className="trie-view__char" data-status={cell.status}>{cell.char}<small>{cell.status}</small></span>)}
    </div>}
    <ol className="trie-view__ops">{lines.map((line, i) => <li key={i}>{line}</li>)}</ol>
    <p className="trie-view__legend">
      <span className="is-created">new node</span>
      <span className="is-reused">reused node</span>
      <span className="is-missing">missing edge</span>
      <span className="is-end">double border = end of a stored word</span>
    </p>
  </section>
}
