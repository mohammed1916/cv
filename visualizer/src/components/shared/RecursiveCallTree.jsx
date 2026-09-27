import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./RecursiveCallTree.css";

function displayWord(value) {
  return value === "" ? "ε" : value;
}

function formatSet(values = []) {
  if (!values.length) return "∅";
  return `{${values.map(displayWord).join(", ")}}`;
}

function TreeNode({
  node,
  nodesById,
  activeNodeId,
  getTitle,
  getSubtitle,
  getState,
  getReturnValue,
  level = 0,
}) {
  const children = (node.children ?? [])
    .map((id) => nodesById.get(id))
    .filter(Boolean);

  const active = node.id === activeNodeId;
  const returned = node.status === "returned";
  const waiting = node.status === "waiting";
  const states = getState?.(node) ?? [];
  const returnValue = getReturnValue?.(node) ?? node.returnValue ?? [];

  return (
    <div
      className="recursive-call-tree-branch"
      data-depth={node.depth ?? level}
    >
      <motion.div
        layout
        className={[
          "recursive-call-tree-node",
          active ? "is-active" : "",
          returned ? "is-returned" : "",
          waiting ? "is-waiting" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        initial={{ opacity: 0, scale: 0.96, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="recursive-call-tree-node-top">
          <div className="recursive-call-tree-node-heading">
            <strong className="recursive-call-tree-node-title">
              {getTitle?.(node) ?? `call ${node.id}`}
            </strong>

            <span className="recursive-call-tree-depth">
              depth {node.depth ?? level}
            </span>
          </div>

          {getSubtitle && (
            <div className="recursive-call-tree-subtitle">
              {getSubtitle(node)}
            </div>
          )}
        </div>

        {states.length > 0 && (
          <div className="recursive-call-tree-state">
            {states.map((state) => (
              <div key={state.label} className="recursive-call-tree-state-item">
                <span>{state.label}</span>
                <strong>{formatSet(state.values ?? [])}</strong>
              </div>
            ))}
          </div>
        )}

        {returned && (
          <motion.div
            className="recursive-call-tree-return"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>returns</span>
            <strong>{formatSet(returnValue)}</strong>
          </motion.div>
        )}

        {active && (
          <div className="recursive-call-tree-active-label">active call</div>
        )}

        {waiting && !active && (
          <div className="recursive-call-tree-waiting-label">
            waiting for child
          </div>
        )}
      </motion.div>

      {children.length > 0 && (
        <>
          <div className="recursive-call-tree-stem" />

          <div
            className={`recursive-call-tree-children ${
              children.length === 1 ? "single-child" : ""
            }`}
          >
            <AnimatePresence initial={false}>
              {children.map((child) => (
                <div className="recursive-call-tree-child" key={child.id}>
                  <div className="recursive-call-tree-child-line" />

                  {child.status === "returned" && (
                    <div className="recursive-call-tree-edge-return">
                      return{" "}
                      {formatSet(getReturnValue?.(child) ?? child.returnValue)}
                    </div>
                  )}

                  <TreeNode
                    node={child}
                    nodesById={nodesById}
                    activeNodeId={activeNodeId}
                    getTitle={getTitle}
                    getSubtitle={getSubtitle}
                    getState={getState}
                    getReturnValue={getReturnValue}
                    level={level + 1}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

export default function RecursiveCallTree({
  nodes = [],
  activeNodeId = null,
  getTitle,
  getSubtitle,
  getState,
  getReturnValue,
  emptyLabel = "No recursive calls yet.",
}) {
  const { roots, nodesById } = useMemo(() => {
    const map = new Map(nodes.map((node) => [node.id, node]));

    const rootNodes = nodes.filter(
      (node) => node.parentId == null || !map.has(node.parentId),
    );

    return {
      roots: rootNodes,
      nodesById: map,
    };
  }, [nodes]);

  if (!roots.length) {
    return <div className="recursive-call-tree-empty">{emptyLabel}</div>;
  }

  return (
    <div className="recursive-call-tree">
      <div className="recursive-call-tree-scroll">
        <div className="recursive-call-tree-canvas">
          {roots.map((root) => (
            <TreeNode
              key={root.id}
              node={root}
              nodesById={nodesById}
              activeNodeId={activeNodeId}
              getTitle={getTitle}
              getSubtitle={getSubtitle}
              getState={getState}
              getReturnValue={getReturnValue}
            />
          ))}
        </div>
      </div>

      <div className="recursive-call-tree-legend">
        <span>
          <i className="recursive-call-tree-dot active" />
          Active
        </span>

        <span>
          <i className="recursive-call-tree-dot waiting" />
          Waiting
        </span>

        <span>
          <i className="recursive-call-tree-dot returned" />
          Returned
        </span>
      </div>
    </div>
  );
}
