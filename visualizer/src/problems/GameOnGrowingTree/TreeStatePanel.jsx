import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PartialAnswersPanel from "../../components/PartialAnswersPanel";
import { TreeHighlightOverlay } from "./TreeDPLinking";
import { TreeTraversalHighlight } from "./TraversalTrail";
import { PruningLegend, PruningStats } from "./EnhancedTreeVisualization";
import { usePruningAnalysis, getNodeOpacity, getEdgeOpacity, getPrunedEdgeStrokeDasharray } from "./usePruningAnalysis";
import "./EnhancedTreeVisualization.css";

const TREE_VIEWBOX_WIDTH = 1000;
const TREE_VIEWBOX_HEIGHT = 300;
const TREE_MIN_ZOOM = 0.75;
const TREE_MAX_ZOOM = 2.4;

export default function TreeStatePanel({
    currentTree,
    treeFocus,
    stepKey,
    dpSnapshot,
    maxTreeNodesToRender,
    step,
    parentZeroBased,
    showTraversalTrail,
    selectedNode,
    onNodeSelect,
}) {
    const [treeViewport, setTreeViewport] = useState({ x: 0, y: 0, scale: 1 });
    const [isDraggingTree, setIsDraggingTree] = useState(false);
    const [gameHierarchyLevel, setGameHierarchyLevel] = useState("overview");
    const treeDragRef = useRef(null);
    const prevDpSnapshotRef = useRef(null);

    // Analyze pruning for visual indication
    const pruningAnalysis = usePruningAnalysis(step, undefined, 0);

    useEffect(() => {
        prevDpSnapshotRef.current = dpSnapshot;
    }, [dpSnapshot]);

    const resetTreeViewport = useCallback(() => {
        setTreeViewport({ x: 0, y: 0, scale: 1 });
        setIsDraggingTree(false);
        treeDragRef.current = null;
    }, []);

    const handleTreePointerDown = useCallback(
        (event) => {
            if (!currentTree) return;

            event.preventDefault();
            treeDragRef.current = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                originX: treeViewport.x,
                originY: treeViewport.y,
            };
            setIsDraggingTree(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [currentTree, treeViewport.x, treeViewport.y],
    );

    const handleTreePointerMove = useCallback((event) => {
        const drag = treeDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        const deltaX = (dx * TREE_VIEWBOX_WIDTH) / rect.width;
        const deltaY = (dy * TREE_VIEWBOX_HEIGHT) / rect.height;

        setTreeViewport((prev) => ({
            ...prev,
            x: drag.originX + deltaX,
            y: drag.originY + deltaY,
        }));
    }, []);

    const handleTreePointerEnd = useCallback((event) => {
        const drag = treeDragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        treeDragRef.current = null;
        setIsDraggingTree(false);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }, []);

    const handleTreeWheel = useCallback((event) => {
        event.preventDefault();

        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const viewX = ((event.clientX - rect.left) * TREE_VIEWBOX_WIDTH) / rect.width;
        const viewY = ((event.clientY - rect.top) * TREE_VIEWBOX_HEIGHT) / rect.height;

        setTreeViewport((prev) => {
            const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
            const nextScale = Math.min(
                TREE_MAX_ZOOM,
                Math.max(TREE_MIN_ZOOM, prev.scale * zoomFactor),
            );

            if (nextScale === prev.scale) return prev;

            const ratio = nextScale / prev.scale;
            return {
                x: viewX - (viewX - prev.x) * ratio,
                y: viewY - (viewY - prev.y) * ratio,
                scale: nextScale,
            };
        });
    }, []);

    return (
        <section className="gogt-panel gogt-tree-panel">
            <header className="gogt-panel-head">
                <span>Tree State Preview</span>
                <span className="gogt-chip">
                    {currentTree?.size ? `prefix size=${currentTree.size}` : "waiting"}
                </span>
            </header>

            <div className="gogt-panel-body">
                <div className="gogt-tree-note">
                    Red: Alice path, Blue: Bob blocks, Gray edge: blocked move from
                    current chip. Each node shows its id and depth. Drag to pan,
                    use the mouse wheel to zoom.
                </div>

                {currentTree ? (
                    <div className="gogt-tree-toolbar">
                        <button
                            type="button"
                            className="gogt-example-btn"
                            onClick={resetTreeViewport}
                        >
                            Reset view
                        </button>
                        <span className="gogt-tree-zoom-chip">
                            zoom {treeViewport.scale.toFixed(2)}x
                        </span>
                    </div>
                ) : null}

                <div className="gogt-tree-canvas">
                    {currentTree ? (
                        <>
                        <motion.svg
                            key={`${currentTree.size}-${stepKey}`}
                            viewBox={`0 0 ${TREE_VIEWBOX_WIDTH} ${TREE_VIEWBOX_HEIGHT}`}
                            className={`gogt-svg ${isDraggingTree ? "dragging" : ""}`}
                            role="img"
                            aria-label="Game tree preview"
                            initial={{ opacity: 0, scale: 0.985 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            onPointerDown={handleTreePointerDown}
                            onPointerMove={handleTreePointerMove}
                            onPointerUp={handleTreePointerEnd}
                            onPointerCancel={handleTreePointerEnd}
                            onPointerLeave={handleTreePointerEnd}
                            onWheel={handleTreeWheel}
                        >
                            <g transform={`translate(${treeViewport.x} ${treeViewport.y})`}>
                                <g transform={`scale(${treeViewport.scale})`}>
                                    <AnimatePresence>
                                        {treeFocus ? (
                                            <motion.line
                                                key={`${treeFocus.sourceNode}-${treeFocus.targetNode}-${treeFocus.phase}`}
                                                x1={treeFocus.sourcePosition.x}
                                                y1={treeFocus.sourcePosition.y}
                                                x2={treeFocus.targetPosition.x}
                                                y2={treeFocus.targetPosition.y}
                                                className={`gogt-transfer-line ${treeFocus.direction}`}
                                                initial={{ opacity: 0, pathLength: 0 }}
                                                animate={{ opacity: 1, pathLength: 1 }}
                                                exit={{ opacity: 0, pathLength: 0 }}
                                                transition={{ duration: 0.42, ease: "easeOut" }}
                                            />
                                        ) : null}
                                    </AnimatePresence>

                                    {currentTree.edges.map((edge) => {
                                        const from = currentTree.positions.get(edge.from);
                                        const to = currentTree.positions.get(edge.to);
                                        if (!from || !to) return null;

                                        const edgeKey = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
                                        const isBlocked = currentTree.blockedEdges.has(edgeKey);
                                        const inPath = currentTree.chipPath.some((node, idx) => {
                                            if (idx === 0) return false;
                                            const a = currentTree.chipPath[idx - 1];
                                            const b = node;
                                            return (
                                                Math.min(a, b) === Math.min(edge.from, edge.to) &&
                                                Math.max(a, b) === Math.max(edge.from, edge.to)
                                            );
                                        });
                                        const isActiveEdge = parentZeroBased !== null && edge.from === parentZeroBased;

                                        return (
                                            <motion.line
                                                key={`${edge.from}-${edge.to}`}
                                                x1={from.x}
                                                y1={from.y}
                                                x2={to.x}
                                                y2={to.y}
                                                className={`gogt-edge ${isBlocked ? "blocked" : inPath ? "path" : ""} ${isActiveEdge ? "active" : ""} ${pruningAnalysis.prunedEdges.has(`${edge.from}-${edge.to}`) ? "pruned" : ""}`}
                                                strokeDasharray={
                                                    isActiveEdge
                                                        ? "8 8"
                                                        : getPrunedEdgeStrokeDasharray(
                                                            edge.from,
                                                            edge.to,
                                                            pruningAnalysis.prunedEdges,
                                                          )
                                                }
                                                initial={false}
                                                animate={{
                                                    opacity: isBlocked || inPath || isActiveEdge
                                                        ? 1
                                                        : getEdgeOpacity(
                                                            edge.from,
                                                            edge.to,
                                                            pruningAnalysis.prunedEdges,
                                                            new Set(pruningAnalysis.activePath),
                                                          ),
                                                    strokeWidth: isBlocked || inPath ? 3 : isActiveEdge ? 2.5 : pruningAnalysis.prunedEdges.has(`${edge.from}-${edge.to}`) ? 1.5 : 2,
                                                    strokeDashoffset: isActiveEdge ? [16, 0] : 0,
                                                }}
                                                transition={{
                                                    opacity: { duration: 0.2, ease: "easeOut" },
                                                    strokeWidth: { duration: 0.2, ease: "easeOut" },
                                                    strokeDashoffset: { duration: 1.2, repeat: Infinity, ease: "linear" },
                                                }}
                                            />
                                        );
                                    })}

                                    {Array.from(
                                        { length: currentTree.renderCount },
                                        (_, node) => {
                                            const pos = currentTree.positions.get(node);
                                            if (!pos) return null;

                                            const state = currentTree.states[node];
                                            const isChip = currentTree.chip === node;
                                            const nodeDepth = currentTree.depth[node];
                                            const isFocusSource = treeFocus?.sourceNode === node;
                                            const isFocusTarget = treeFocus?.targetNode === node;

                                            const nodeScale = isChip
                                                ? 1.14
                                                : isFocusSource || isFocusTarget
                                                    ? 1.06
                                                    : 1;

                                            const parentId = currentTree.edges.find(e => e.to === node)?.from;
                                            const degree = currentTree.edges.filter(e => e.from === node).length;
                                            const tooltipText = `Node ${node + 1}${parentId !== undefined ? ` | Parent: ${parentId + 1}` : ' (root)'} | Degree: ${degree}`;

                                            return (
                                                <g
                                                    key={node}
                                                    transform={`translate(${pos.x}, ${pos.y})`}
                                                    className={`tree-node-group ${selectedNode === node ? 'selected' : ''}`}
                                                    onClick={() => onNodeSelect?.(node)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <title>{tooltipText}</title>
                                                    <motion.g
                                                        initial={false}
                                                        animate={{ scale: nodeScale }}
                                                        style={{
                                                            transformBox: "fill-box",
                                                            transformOrigin: "center",
                                                        }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 320,
                                                            damping: 24,
                                                        }}
                                                    >
                                                        {isFocusSource || isFocusTarget ? (
                                                            <rect
                                                                x="-21"
                                                                y="-21"
                                                                width="42"
                                                                height="42"
                                                                rx="12"
                                                                className={`gogt-focus-box ${isFocusSource ? "source" : ""} ${isFocusTarget ? "target" : ""}`}
                                                            />
                                                        ) : null}
                                                        <motion.circle
                                                            className={`gogt-node ${state} ${isChip ? "chip" : ""}`}
                                                            r="16"
                                                            initial={false}
                                                            animate={{
                                                                opacity: getNodeOpacity(
                                                                    node,
                                                                    pruningAnalysis.prunedNodeIds,
                                                                    new Set(pruningAnalysis.activePath),
                                                                ),
                                                                r: isChip
                                                                    ? 17.2
                                                                    : isFocusSource || isFocusTarget
                                                                        ? 16.8
                                                                        : 16,
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 360,
                                                                damping: 24,
                                                            }}
                                                        />
                                                        <text
                                                            className="gogt-node-label"
                                                            textAnchor="middle"
                                                            dy="-1"
                                                        >
                                                            {node + 1}
                                                        </text>
                                                        <text
                                                            className="gogt-node-depth"
                                                            textAnchor="middle"
                                                            dy="12"
                                                        >
                                                            d{nodeDepth}
                                                        </text>

                                                        {/* Top-3 depth badges for pruning visualization */}
                                                        {dpSnapshot && (
                                                            <>
                                                                {/* 1st rank badge - top */}
                                                                {dpSnapshot.first?.[node] > 0 && (
                                                                    <g className="tree-depth-badge rank-1">
                                                                        <circle
                                                                            cx="0"
                                                                            cy="-28"
                                                                            r="6"
                                                                            className="badge-circle rank-1"
                                                                        />
                                                                        <text
                                                                            x="0"
                                                                            y="-24"
                                                                            textAnchor="middle"
                                                                            fontSize="7"
                                                                            fontWeight="bold"
                                                                            className="badge-text"
                                                                        >
                                                                            {dpSnapshot.first[node]}
                                                                        </text>
                                                                    </g>
                                                                )}

                                                                {/* 2nd rank badge - left */}
                                                                {dpSnapshot.second?.[node] > 0 && (
                                                                    <g className="tree-depth-badge rank-2">
                                                                        <circle
                                                                            cx="-24"
                                                                            cy="0"
                                                                            r="5"
                                                                            className="badge-circle rank-2"
                                                                        />
                                                                        <text
                                                                            x="-24"
                                                                            y="2"
                                                                            textAnchor="middle"
                                                                            fontSize="6"
                                                                            fontWeight="bold"
                                                                            className="badge-text"
                                                                        >
                                                                            {dpSnapshot.second[node]}
                                                                        </text>
                                                                    </g>
                                                                )}

                                                                {/* 3rd rank badge - right */}
                                                                {dpSnapshot.third?.[node] > 0 && (
                                                                    <g className="tree-depth-badge rank-3">
                                                                        <circle
                                                                            cx="24"
                                                                            cy="0"
                                                                            r="4"
                                                                            className="badge-circle rank-3"
                                                                        />
                                                                        <text
                                                                            x="24"
                                                                            y="2"
                                                                            textAnchor="middle"
                                                                            fontSize="5"
                                                                            fontWeight="bold"
                                                                            className="badge-text"
                                                                        >
                                                                            {dpSnapshot.third[node]}
                                                                        </text>
                                                                    </g>
                                                                )}
                                                            </>
                                                        )}
                                                    </motion.g>
                                                </g>
                                            );
                                        },
                                    )}
                                </g>
                            </g>
                            {step && <TreeHighlightOverlay step={step} treeNodePositions={currentTree?.positions} dpSnapshot={dpSnapshot} />}
                            {showTraversalTrail && step && <TreeTraversalHighlight currentTree={currentTree} parentZeroBased={parentZeroBased} isBottomUp={step.activeLine >= 9 && step.activeLine <= 14} />}
                        </motion.svg>

                        {/* Pruning Legend and Statistics */}
                        {dpSnapshot && currentTree && (
                            <>
                                <PruningLegend />
                                <PruningStats dpSnapshot={dpSnapshot} totalNodes={currentTree.size || 0} />
                            </>
                        )}
                        </>
                    ) : (
                        <div className="gogt-tree-empty">
                            Press Play or Next to render the tree for current midpoint.
                        </div>
                    )}
                </div>

                {dpSnapshot ? (
                    <div className="gogt-dp-state">
                        <div className="gogt-dp-state-head">DP state for rendered prefix</div>
                        <div className="gogt-dp-grid">
                            <div className="gogt-dp-panel">
                                <PartialAnswersPanel
                                    label="first"
                                    answers={dpSnapshot.first}
                                    prevAnswers={prevDpSnapshotRef.current?.first}
                                    labelPrefix="f"
                                    selectedNode={selectedNode}
                                    onNodeSelect={onNodeSelect}
                                    cellSources={dpSnapshot.firstSources}
                                />
                            </div>
                            <div className="gogt-dp-panel">
                                <PartialAnswersPanel
                                    label="second"
                                    answers={dpSnapshot.second}
                                    prevAnswers={prevDpSnapshotRef.current?.second}
                                    labelPrefix="s"
                                    selectedNode={selectedNode}
                                    onNodeSelect={onNodeSelect}
                                    cellSources={dpSnapshot.secondSources}
                                />
                            </div>
                            <div className="gogt-dp-panel">
                                <PartialAnswersPanel
                                    label="third"
                                    answers={dpSnapshot.third}
                                    prevAnswers={prevDpSnapshotRef.current?.third}
                                    labelPrefix="t"
                                    selectedNode={selectedNode}
                                    onNodeSelect={onNodeSelect}
                                    cellSources={dpSnapshot.thirdSources}
                                />
                            </div>
                        </div>
                    </div>
                ) : null}

                {currentTree?.truncated ? (
                    <div className="gogt-tree-truncated">
                        Rendering first {maxTreeNodesToRender} nodes only for clarity.
                    </div>
                ) : null}

                {currentTree?.stateHierarchy ? (
                    <div className="gogt-state-hierarchy">
                        <div className="gogt-hierarchy-controls">
                            <button
                                type="button"
                                className={`gogt-level-btn ${gameHierarchyLevel === "overview" ? "active" : ""}`}
                                onClick={() => setGameHierarchyLevel("overview")}
                            >
                                🔭 Bird's Eye
                            </button>
                            <button
                                type="button"
                                className={`gogt-level-btn ${gameHierarchyLevel === "intermediate" ? "active" : ""}`}
                                onClick={() => setGameHierarchyLevel("intermediate")}
                            >
                                🔍 Rounds
                            </button>
                            <button
                                type="button"
                                className={`gogt-level-btn ${gameHierarchyLevel === "detailed" ? "active" : ""}`}
                                onClick={() => setGameHierarchyLevel("detailed")}
                            >
                                🔎 Moves
                            </button>
                        </div>

                        {gameHierarchyLevel === "overview" && (
                            <div className="gogt-hierarchy-content">
                                <div className="gogt-overview-state">
                                    <div className="gogt-overview-label">Algorithm Phase</div>
                                    <div className="gogt-overview-value">{currentTree.stateHierarchy.overallPhase}</div>
                                    <div className="gogt-overview-message">{currentTree.stateHierarchy.overallMessage}</div>
                                    <div className="gogt-overview-stats">
                                        <div className="stat">
                                            <span>Rounds</span>
                                            <strong>{currentTree.stateHierarchy.substates.filter(s => s.level === "round-bob").length}</strong>
                                        </div>
                                        <div className="stat">
                                            <span>Final Path</span>
                                            <strong>{currentTree.chipPath.length} nodes</strong>
                                        </div>
                                        <div className="stat">
                                            <span>Moves Total</span>
                                            <strong>{currentTree.moves.length}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {gameHierarchyLevel === "intermediate" && (
                            <div className="gogt-hierarchy-content">
                                <div className="gogt-substates-list">
                                    {currentTree.stateHierarchy.substates.map((state, idx) => (
                                        <div key={idx} className={`gogt-substate gogt-substate-${state.level}`}>
                                            <div className="gogt-substate-label">
                                                {state.level === "initialization" && "🎮"}
                                                {state.level === "round-bob" && "🔵"}
                                                {state.level === "round-alice" && "🔴"}
                                                {state.level === "game-end" && "🏁"}
                                            </div>
                                            <div className="gogt-substate-message">{state.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {gameHierarchyLevel === "detailed" && (
                            <div className="gogt-hierarchy-content">
                                <div className="gogt-game-moves-list">
                                    {currentTree.moves.map((move, idx) => (
                                        <div
                                            key={idx}
                                            className={`gogt-game-move gogt-game-move-${move.type}`}
                                        >
                                            <div className="gogt-game-move-label">
                                                {move.type === "game-start" && "🎮 Start"}
                                                {move.type === "alice-move" && "🔴 Alice"}
                                                {move.type === "bob-block" && "🔵 Bob"}
                                                {move.type === "game-end" && "🏁 End"}
                                            </div>
                                            <div className="gogt-game-move-message">{move.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
