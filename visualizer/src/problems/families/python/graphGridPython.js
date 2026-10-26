export const graphGridPython={
1901:`def solve(mat):
    low, high = 0, len(mat[0]) - 1
    while low <= high:
        column = (low + high) // 2
        row = max(range(len(mat)), key=lambda row: mat[row][column])
        value = mat[row][column]
        left = mat[row][column - 1] if column else -1
        right = mat[row][column + 1] if column + 1 < len(mat[0]) else -1
        if value > left and value > right:  # step: compare
            return [row, column]  # step: return
        if left > value:
            high = column - 1
        else:
            low = column + 1`,
1914:`def solve(grid, k):
    result = [row[:] for row in grid]
    rows, columns = len(grid), len(grid[0])
    for layer in range(min(rows, columns) // 2):
        top = left = layer
        bottom, right = rows - 1 - layer, columns - 1 - layer
        path = [(row, left) for row in range(top, bottom)]
        path += [(bottom, column) for column in range(left, right)]
        path += [(row, right) for row in range(bottom, top, -1)]
        path += [(top, column) for column in range(right, left, -1)]
        shift = k % len(path)
        for index, (row, column) in enumerate(path):
            new_row, new_column = path[(index + shift) % len(path)]
            result[new_row][new_column] = grid[row][column]  # step: move
    return result  # step: return`,
1916:`def solve(prevRoom):
    modulo = 1_000_000_007
    n = len(prevRoom)
    children = [[] for _ in range(n)]
    for room in range(1, n):
        children[prevRoom[room]].append(room)
    factorial = [1] * (n + 1)
    for value in range(1, n + 1):
        factorial[value] = factorial[value - 1] * value % modulo
    order = [0]
    for room in order:
        order.extend(children[room])
    size = [1] * n
    ways = [1] * n
    for room in reversed(order):
        descendants = 0
        denominator = child_ways = 1
        for child in children[room]:
            descendants += size[child]
            denominator = denominator * factorial[size[child]] % modulo
            child_ways = child_ways * ways[child] % modulo
        size[room] = descendants + 1
        ways[room] = factorial[descendants] * pow(denominator, modulo - 2, modulo) * child_ways % modulo  # step: update
    return ways[0]  # step: return`,
1926:`def solve(maze, entrance):
    from collections import deque

    rows, columns = len(maze), len(maze[0])
    queue = deque([(entrance[0], entrance[1], 0)])
    seen = {tuple(entrance)}
    while queue:
        row, column, distance = queue.popleft()
        exit_cell = distance > 0 and (row in (0, rows - 1) or column in (0, columns - 1))  # step: visit
        if exit_cell:
            return distance  # step: return
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = row + dr, column + dc
            if 0 <= nr < rows and 0 <= nc < columns and maze[nr][nc] == '.' and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append((nr, nc, distance + 1))
    return -1  # step: failed`,
1971:`def solve(n, edges, source, destination):
    from collections import deque

    graph = [[] for _ in range(n)]
    for first, second in edges:
        graph[first].append(second)
        graph[second].append(first)
    queue = deque([source])
    seen = {source}
    while queue:
        node = queue.popleft()  # step: visit
        if node == destination:
            break
        for neighbor in graph[node]:
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)
    return destination in seen  # step: return`,
1976:`def solve(n, roads):
    graph = [[] for _ in range(n)]
    for first, second, weight in roads:
        graph[first].append((second, weight))
        graph[second].append((first, weight))
    distance = [float('inf')] * n
    ways = [0] * n
    settled = [False] * n
    distance[0], ways[0] = 0, 1
    for _ in range(n):
        candidates = [node for node in range(n) if not settled[node]]
        if not candidates:
            break
        source = min(candidates, key=lambda node: distance[node])
        if distance[source] == float('inf'):
            break
        settled[source] = True
        for target, weight in graph[source]:
            candidate = distance[source] + weight
            if candidate < distance[target]:
                distance[target], ways[target] = candidate, ways[source]
            elif candidate == distance[target]:
                ways[target] = (ways[target] + ways[source]) % 1_000_000_007
            # step: relax
    return ways[n - 1]  # step: return`,
};
export const graphGridPythonStages=Object.fromEntries(Object.entries(graphGridPython).map(([id,source])=>[id,
 Object.fromEntries(source.split('\n').flatMap((line,index)=>{const match=line.match(/# step: (\w+)/);return match?[[match[1],index+1]]:[];})),
]));
