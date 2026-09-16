import { parseLevelOrderTree } from "../../components/shared/levelOrderTree.js";
import { binaryTreeLayout } from "../../components/shared/binaryTreeLayout.js";
export function generateSteps(pArr, qArr) {
  const pRoot = parseLevelOrderTree(JSON.stringify(pArr), "p");
  const qRoot = parseLevelOrderTree(JSON.stringify(qArr), "q");

  const pSnap = binaryTreeLayout(pRoot);
  const qSnap = binaryTreeLayout(qRoot);

  const steps = [];

  // Tracks node state: 'match' | 'mismatch' | 'null-match' | 'null-mismatch'
  const nodeStates = {}; // id -> 'match'|'mismatch'

  function push(activeLine, activePId, activeQId, message, finalResult = null) {
    steps.push({
      activeLine,
      activePId,
      activeQId,
      nodeStates: { ...nodeStates },
      pPositions: pSnap.positions,
      pEdges: pSnap.edges,
      pNodes: pSnap.nodes,
      qPositions: qSnap.positions,
      qEdges: qSnap.edges,
      qNodes: qSnap.nodes,
      message,
      finalResult,
    });
  }

  push(2, null, null, "Call isSameTree(p, q). Begin recursive DFS.");

  // Returns boolean
  function dfs(p, q) {
    const pId = p ? p.id : null;
    const qId = q ? q.id : null;

    // Both null
    push(
      3,
      pId,
      qId,
      `Check: p=${p ? p.val : "null"}, q=${q ? q.val : "null"} — both null?`,
    );
    if (!p && !q) {
      push(4, pId, qId, "Both nodes are null → return True (base case)");
      return true;
    }

    // One null
    push(5, pId, qId, `One of p/q is null — structural mismatch?`);
    if (!p || !q) {
      if (pId) nodeStates[pId] = "mismatch";
      if (qId) nodeStates[qId] = "mismatch";
      push(
        6,
        pId,
        qId,
        `One node is null, other is ${p ? p.val : q.val} → return False`,
      );
      return false;
    }

    // Value check
    push(7, pId, qId, `Compare values: p.val=${p.val} vs q.val=${q.val}`);
    if (p.val !== q.val) {
      nodeStates[pId] = "mismatch";
      nodeStates[qId] = "mismatch";
      push(8, pId, qId, `p.val (${p.val}) ≠ q.val (${q.val}) → return False`);
      return false;
    }

    // Values match — mark tentatively; will confirm after children
    nodeStates[pId] = "match";
    nodeStates[qId] = "match";
    push(
      9,
      pId,
      qId,
      `Values match (${p.val}=${q.val}) — recurse into left subtrees`,
    );

    const leftOk = dfs(p.left, q.left);

    push(
      10,
      pId,
      qId,
      `Left subtrees ${leftOk ? "match" : "differ"} — recurse into right subtrees`,
    );

    const rightOk = dfs(p.right, q.right);

    if (!leftOk || !rightOk) {
      nodeStates[pId] = "mismatch";
      nodeStates[qId] = "mismatch";
    }

    const result = leftOk && rightOk;
    push(11, pId, qId, `Return ${result} for node ${p.val}`);
    return result;
  }

  const result = dfs(pRoot, qRoot);

  push(
    11,
    null,
    null,
    result
      ? "Trees are identical! isSameTree returns True."
      : "Trees differ. isSameTree returns False.",
    result,
  );

  return steps;
}
