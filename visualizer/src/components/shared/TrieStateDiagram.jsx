import './TrieStateDiagram.css'

export default function TrieStateDiagram({ nodes, activeNode }) {
  const children = new Map(nodes.map(node => [node.id, []]))
  for (const node of nodes) if (node.parent !== null) children.get(node.parent)?.push(node.id)
  const positions = new Map()
  let leaves = 0
  let maxDepth = 0
  function place(id, depth) {
    maxDepth = Math.max(maxDepth, depth)
    const descendants = children.get(id)
    const xs = descendants.map(child => place(child, depth + 1))
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : 65 + leaves++ * 125
    positions.set(id, { x, y: 40 + depth * 100 })
    return x
  }
  if (!nodes.length) return null
  place(nodes[0].id, 0)
  return <figure className="trie-state">
    <figcaption>Trie state · highlighted node is the current lookup or update</figcaption>
    <div className="trie-state__viewport" tabIndex={0} aria-label="Scrollable trie diagram">
      <svg width={Math.max(260, leaves * 125)} height={100 + maxDepth * 100} role="img" aria-label="Prefix tree with character edges and stored node values">
        {nodes.filter(node => node.parent !== null).map(node => {
          const from = positions.get(node.parent), to = positions.get(node.id)
          return <line key={`edge-${node.id}`} x1={from.x} y1={from.y + 22} x2={to.x} y2={to.y - 22} />
        })}
        {nodes.map(node => {
          const { x, y } = positions.get(node.id)
          const details = [node.terminal ? `end ${node.terminal}` : '', node.pass !== undefined ? `pass ${node.pass}` : '', node.total !== undefined ? `sum ${node.total}` : ''].filter(Boolean).join(' · ')
          return <g key={node.id} transform={`translate(${x},${y})`} data-active={node.id === activeNode}>
            <title>{node.prefix || 'root'}{details ? `: ${details}` : ''}</title>
            <rect x={-49} y={-23} width={98} height={46} rx={8} />
            <text textAnchor="middle" y={4}>{node.parent === null ? 'root' : node.char}</text>
            <text className="trie-state__details" textAnchor="middle" y={39}>{details}</text>
          </g>
        })}
      </svg>
    </div>
  </figure>
}
