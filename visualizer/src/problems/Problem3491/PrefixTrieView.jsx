import './PrefixTrieView.css'

// The digit trie drawn as nested branches. A filled node ends a number; a red node is where the conflict was found.
function TrieBranch({ node, label, depth, path, focus }) {
  const isPath = focus && path.length <= focus.consumed && path.every((d, i) => focus.prefix[i] === d)
  const cls = ['trie-node', node.end ? 'trie-node--end' : '', isPath ? 'trie-node--path' : ''].join(' ')
  return (
    <li className="trie-item">
      <span className={cls}>{label}{node.end ? ' ■' : ''}</span>
      {node.children.length > 0 && (
        <ul className="trie-children">
          {node.children.map(([d, child]) => <TrieBranch key={path.concat(d).join('')} node={child} label={d} depth={depth + 1} path={path.concat(d)} focus={focus} />)}
        </ul>
      )}
    </li>
  )
}

export default function PrefixTrieView({ run, step }) {
  if (!run || !step) return <section className="trie-view"><p className="trie-empty">Press Play to insert the numbers one by one.</p></section>
  const { numbers } = run.input
  const { current, consumed, result, trie } = step
  const focusNumber = current >= 0 ? numbers[current] : ''
  const focus = focusNumber ? { prefix: focusNumber.slice(0, consumed).split(''), consumed } : null
  return (
    <section className="trie-view" aria-label="Digit trie of phone numbers">
      <div className="trie-numbers" aria-label="Numbers">
        {numbers.map((s, i) => (
          <span key={i} className={`trie-number${i === current ? ' trie-number--current' : ''}${i < current ? ' trie-number--done' : ''}`}>{s}</span>
        ))}
      </div>
      <div className="trie-root-wrap">
        <ul className="trie-children trie-children--root">
          {trie.children.length === 0 && <li className="trie-empty-root">empty trie</li>}
          {trie.children.map(([d, child]) => (
            <TrieBranch key={d} node={child} label={d} depth={1} path={[d]} focus={focus} />
          ))}
        </ul>
      </div>
      <p className="trie-status" data-result={result === null ? 'pending' : String(result)}>
        {result === null ? `Inserting ${focusNumber || '-'}; digits consumed ${consumed}.` : result ? 'Prefix-free: no number is a prefix of another.' : 'Conflict: not prefix-free.'}
      </p>
      <p className="trie-legend">■ marks the end of a number. Highlighted nodes lie on the path of the number being inserted.</p>
    </section>
  )
}
