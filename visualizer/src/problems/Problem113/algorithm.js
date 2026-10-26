import { parseLevelOrderTree } from '../../components/shared/levelOrderTree.js';
import { binaryTreeLayout } from '../../components/shared/binaryTreeLayout.js';
export function generateSteps(text, targetSum) {
    const root = parseLevelOrderTree(text)
    const { positions, edges, nodes: allNodes } = binaryTreeLayout(root)
    const steps = []

    if (!root) {
        return [{
            phase: 'done', activeLine: 13, activeId: -1, pathStack: [], completedPaths: [],
            onPathNode: new Set(), positions, edges, allNodes, currentSum: 0, targetSum,
            message: 'Empty tree → return []'
        }]
    }

    const completedPaths = []
    const onPathNode = new Set()

    steps.push({
        phase: 'init', activeLine: 2, activeId: -1, pathStack: [], completedPaths: [],
        onPathNode: new Set(), positions, edges, allNodes, currentSum: 0, targetSum,
        message: `Initialize result list. Target sum: ${targetSum}. Start DFS.`
    })

    function dfs(node, path, remainingSum) {
        if (!node) {
            steps.push({
                phase: 'null', activeLine: 4, activeId: -1,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum: targetSum - remainingSum, targetSum,
                message: 'Null node detected. Return from DFS.'
            })
            return
        }

        path.push(node.val)
        onPathNode.add(node.id)
        const currentSum = targetSum - remainingSum + node.val

        steps.push({
            phase: 'visit', activeLine: 5, activeId: node.id,
            pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
            positions, edges, allNodes, currentSum, targetSum,
            message: `Visit node ${node.val}. Current path: [${path.join(', ')}]. Sum so far: ${currentSum}`
        })

        const isLeaf = !node.left && !node.right
        if (isLeaf) {
            steps.push({
                phase: 'leaf', activeLine: 6, activeId: node.id,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum, targetSum,
                message: `Leaf node! Current path sum: ${currentSum}. Target: ${targetSum}`
            })

            if (currentSum === targetSum) {
                completedPaths.push([...path])
                steps.push({
                    phase: 'match', activeLine: 8, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `Sum matches! Save path: [${path.join(', ')}]. Total: ${completedPaths.length}`
                })
            } else {
                steps.push({
                    phase: 'no-match', activeLine: 7, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `Sum doesn't match. ${currentSum} != ${targetSum}`
                })
            }
        } else {
            steps.push({
                phase: 'branch', activeLine: 9, activeId: node.id,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum, targetSum,
                message: `Internal node. Continue DFS to children. Remaining: ${remainingSum - node.val}`
            })

            if (node.left) {
                dfs(node.left, path, remainingSum - node.val)
            } else {
                steps.push({
                    phase: 'no-left', activeLine: 10, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `No left child. Skip.`
                })
            }

            if (node.right) {
                dfs(node.right, path, remainingSum - node.val)
            } else {
                steps.push({
                    phase: 'no-right', activeLine: 11, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `No right child. Skip.`
                })
            }
        }

        onPathNode.delete(node.id)
        path.pop()

        steps.push({
            phase: 'backtrack', activeLine: 12, activeId: node.id,
            pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
            positions, edges, allNodes, currentSum: targetSum - remainingSum, targetSum,
            message: `Backtrack from node ${node.val}. Path: [${path.join(', ')}]`
        })
    }

    dfs(root, [], targetSum)

    steps.push({
        phase: 'done', activeLine: 13, activeId: -1,
        pathStack: [], completedPaths: [...completedPaths], onPathNode: new Set(),
        positions, edges, allNodes, currentSum: 0, targetSum,
        message: completedPaths.length > 0
            ? `Found ${completedPaths.length} path(s): ${JSON.stringify(completedPaths)}`
            : 'No paths found that sum to target.'
    })

    return steps
}

