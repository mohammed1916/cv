import React, { useEffect, useState } from 'react';
import LinkedListGraph from './LinkedListGraph';

/**
 * LinkedList - a clean modular wrapper around LinkedListGraph that provides a
 * flexible API for linked list visualisers.
 */
export default function LinkedList({
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
  const [currentHighlighted, setCurrentHighlighted] = useState(highlightedIds);

  useEffect(() => {
    setCurrentHighlighted(highlightedIds);
    if (onHighlight) {
      onHighlight(highlightedIds);
    }
  }, [highlightedIds, onHighlight]);

  const handleSwap = (swapInfo) => {
    if (onSwap) {
      onSwap(swapInfo);
    }
  };

  return (
    <LinkedListGraph
      nodes={nodes}
      pointers={pointers}
      highlightedIds={currentHighlighted}
      cycleStart={cycleStart}
      label={label}
      tone={tone}
      emptyText={emptyText}
      className={className}
      onSwap={handleSwap}
    />
  );
}

export { LinkedListGraph };
