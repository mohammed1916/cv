// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several cycle repetitions",
    "s1": "abac",
    "n1": 8,
    "s2": "aac",
    "n2": 2
  },
  {
    "label": "Missing required letter",
    "s1": "pine",
    "n1": 5,
    "s2": "oak",
    "n2": 1
  },
  {
    "label": "Exact repeated blocks",
    "s1": "moss",
    "n1": 6,
    "s2": "moss",
    "n2": 2
  },
  {
    "label": "Too few complete blocks",
    "s1": "ab",
    "n1": 2,
    "s2": "aabb",
    "n2": 2
  }
];
