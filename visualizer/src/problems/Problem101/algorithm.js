import { parseLevelOrderTree } from "../../components/shared/levelOrderTree.js";
import { binaryTreeLayout } from "../../components/shared/binaryTreeLayout.js";
export function generateSteps(treeArr) {
  const root = parseLevelOrderTree(JSON.stringify(treeArr), "n");
  const snap = binaryTreeLayout(root);

  const steps = [];
  const nodeStates = {};

  function push(
    activeLine,
    activeLeftId,
    activeRightId,
    message,
    finalResult = null,
  ) {
    steps.push({
      activeLine,
      activeLeftId,
      activeRightId,
      nodeStates: { ...nodeStates },
      positions: snap.positions,
      edges: snap.edges,
      nodes: snap.nodes,
      message,
      finalResult,
    });
  }

  push(12, null, null, "Call isSymmetric(root). Begin mirror check.");

  function isMirror(left, right) {
    const leftId = left ? left.id : null;
    const rightId = right ? right.id : null;

    // Both null
    push(
      4,
      leftId,
      rightId,
      `Check: left=${left ? left.val : "null"}, right=${right ? right.val : "null"} — both null?`,
    );
    if (!left && !right) {
      push(5, leftId, rightId, "Both null → return True (base case)");
      return true;
    }

    // One null
    push(6, leftId, rightId, `One null, other not? Structural mismatch.`);
    if (!left || !right) {
      if (leftId) nodeStates[leftId] = "mirror-fail";
      if (rightId) nodeStates[rightId] = "mirror-fail";
      push(7, leftId, rightId, `One is null → return False`);
      return false;
    }

    // Value check
    push(8, leftId, rightId, `Values: left=${left.val} vs right=${right.val}`);
    if (left.val !== right.val) {
      nodeStates[leftId] = "mirror-fail";
      nodeStates[rightId] = "mirror-fail";
      push(9, leftId, rightId, `Values differ → return False`);
      return false;
    }

    // Values match
    nodeStates[leftId] = "mirror-ok";
    nodeStates[rightId] = "mirror-ok";
    push(
      10,
      leftId,
      rightId,
      `Values match (${left.val}) — recurse into (left.left, right.right)`,
    );

    const outerOk = isMirror(left.left, right.right);
    if (!outerOk) {
      nodeStates[leftId] = 'mirror-fail'; nodeStates[rightId] = 'mirror-fail';
      push(10, leftId, rightId, 'Outer pair failed. Short-circuit: the inner pair is not visited.');
      return false;
    }

    push(
      11,
      leftId,
      rightId,
      `Outer pair ${outerOk ? "ok" : "fail"} — recurse into (left.right, right.left)`,
    );

    const innerOk = isMirror(left.right, right.left);

    if (!outerOk || !innerOk) {
      nodeStates[leftId] = "mirror-fail";
      nodeStates[rightId] = "mirror-fail";
    }

    const result = outerOk && innerOk;
    push(
      11,
      leftId,
      rightId,
      `Return ${result} for pair at (${left.val}, ${right.val})`,
    );
    return result;
  }

  if (!root) {
    push(12, null, null, "Root is null → symmetric (empty tree)", true);
  } else {
    const result = isMirror(root.left, root.right);
    push(
      12,
      null,
      null,
      result
        ? "Tree is symmetric! isSymmetric returns True."
        : "Tree is not symmetric. isSymmetric returns False.",
      result,
    );
  }

  return steps;
}
