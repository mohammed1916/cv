import { useId } from 'react';
import './LinkedListGraph.css';

/** Nodes have stable {id, val}; ordering defines next unless nextId is supplied.
 * cycleStart is a node index. Pointers and highlights always use node IDs.
 */
export default function LinkedListGraph({
  nodes = [],
  pointers = [],
  highlightedIds = [],
  cycleStart = -1,
  label = 'Linked list',
  tone = 'main',
  emptyText = 'head → null',
  className = '',
  onSwap,
  onHighlight,
}) {
  const marker = `list-arrow-${useId().replace(/:/g, '')}`;
  const positions = new Map(nodes.map((node, index) => [node.id, 30 + index * 112]));
  const nullX = 30 + nodes.length * 112;
  const stacks = nodes.map((node) => pointers.filter((pointer) => String(pointer.nodeId) === String(node.id)));
  const height = 170 + Math.max(0, ...stacks.map((stack) => stack.length - 1)) * 22;

  return (
    <div
      className={`linked-list-graph linked-list-graph--${tone} ${className}`.trim()}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {!nodes.length ? (
        <p className="linked-list-graph__empty">{emptyText}</p>
      ) : (
        <svg width={nullX + 90} height={height} role="img" aria-label={label}>
          <defs>
            <marker id={marker} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0 0 L8 4 L0 8z" fill="currentColor" />
            </marker>
          </defs>
          {nodes.map((node, index) => {
            const x = positions.get(node.id);
            const next =
              node.nextId !== undefined
                ? node.nextId
                : nodes[index + 1]?.id ?? nodes[cycleStart]?.id ?? null;
            const target = positions.get(next);
            const end = target ?? nullX;
            const returning = target !== undefined && target <= x;
            const path = returning
              ? `M${x + 54} 64 C${x + 112} 8 ${end + 32} 8 ${end + 32} 60`
              : `M${x + 64} 82 H${end - 7}`;
            return (
              <path
                key={`edge-${node.id}`}
                d={path}
                className="linked-list-graph__edge"
                markerEnd={`url(#${marker})`}
              />
            );
          })}
          {nodes.map((node, index) => {
            const x = positions.get(node.id);
            const isHighlighted = highlightedIds.some((h) => String(h) === String(node.id));
            return (
              <g
                key={`node-${node.id}`}
                className={`linked-list-graph__node ${isHighlighted ? 'is-highlighted' : ''} ${node.className || ''}`.trim()}
              >
                <title>{`Node ${node.id}: ${node.val}`}</title>
                <rect x={x} y="60" width="64" height="44" rx="8" />
                <path d={`M${x + 42} 60v44`} />
                <text x={x + 21} y="87" textAnchor="middle">
                  {node.val}
                </text>
                <text x={x + 53} y="86" textAnchor="middle" className="linked-list-graph__next">
                  •
                </text>
                <text x={x + 32} y="122" textAnchor="middle" className="linked-list-graph__id">
                  {node.label || node.id}
                </text>
                {stacks[index].map((pointer, i) => (
                  <text
                    key={`${pointer.label}-${i}`}
                    x={x + 32}
                    y={145 + i * 22}
                    textAnchor="middle"
                    className={`linked-list-graph__pointer ${pointer.className || ''}`.trim()}
                  >
                    ↑ {pointer.label}
                  </text>
                ))}
              </g>
            );
          })}
          {nodes.some(
            (node, index) =>
              node.nextId === null ||
              (node.nextId === undefined && index === nodes.length - 1 && !nodes[cycleStart])
          ) && (
            <text x={nullX} y="87" className="linked-list-graph__null">
              null
            </text>
          )}
        </svg>
      )}
      {pointers.filter((pointer) => pointer.nodeId === null).length > 0 && (
        <div className="linked-list-graph__null-pointers">
          {pointers
            .filter((pointer) => pointer.nodeId === null)
            .map((pointer) => `${pointer.label} → null`)
            .join(' · ')}
        </div>
      )}
    </div>
  );
}
