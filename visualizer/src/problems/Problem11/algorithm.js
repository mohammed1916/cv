export function generateSteps(height) {
  const steps = [];
  let left = 0;
  let right = height.length - 1;
  let maxArea = 0;
  let bestPair = [0, height.length - 1];

  steps.push({
    phase: "init",
    left,
    right,
    maxArea,
    bestPair,
    currentArea: null,
    activeLine: 3,
    message: "Initialize left and right pointers at the ends of the array.",
  });

  while (left < right) {
    const w = right - left;
    const h = Math.min(height[left], height[right]);
    const area = w * h;

    steps.push({
      phase: "compute",
      left,
      right,
      maxArea,
    bestPair,
      currentArea: area,
      activeLine: 6,
      message: `Calculate area: width=${w}, height=min(${height[left]}, ${height[right]})=${h}. Area=${area}.`,
    });

    if (area > maxArea) {
      maxArea = area;
      bestPair = [left, right];
      steps.push({
        phase: "update",
        left,
        right,
        maxArea,
    bestPair,
        currentArea: area,
        activeLine: 7,
        message: `New max area found! Update max_area to ${maxArea}.`,
      });
    } else {
      steps.push({
        phase: "skip",
        left,
        right,
        maxArea,
    bestPair,
        currentArea: area,
        activeLine: 7,
        message: `Area ${area} is not greater than max_area ${maxArea}.`,
      });
    }

    if (height[left] < height[right]) {
      steps.push({
        phase: "move",
        left,
        right,
        maxArea,
    bestPair,
        currentArea: null,
        activeLine: 9,
        message: `height[left] < height[right] (${height[left]} < ${height[right]}). Move left pointer inwards to find a taller line.`,
      });
      left++;
    } else {
      steps.push({
        phase: "move",
        left,
        right,
        maxArea,
    bestPair,
        currentArea: null,
        activeLine: 11,
        message: `height[left] >= height[right] (${height[left]} >= ${height[right]}). Move right pointer inwards to find a taller line.`,
      });
      right--;
    }
  }

  steps.push({
    phase: "done",
    left,
    right,
    maxArea,
    bestPair,
    currentArea: null,
    activeLine: 12,
    message: `Pointers met. Maximum area is ${maxArea}.`,
  });

  return steps;
}

