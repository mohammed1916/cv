// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A longer string ends in one padded group",
    "input": "{\"s\":\"lanternsbesidetheriver\",\"k\":6,\"fill\":\"x\"}"
  },
  {
    "label": "Exact division adds no fill characters",
    "input": "{\"s\":\"harborview\",\"k\":5,\"fill\":\"z\"}"
  },
  {
    "label": "Group size one preserves every character",
    "input": "{\"s\":\"moss\",\"k\":1,\"fill\":\"q\"}"
  },
  {
    "label": "The group is wider than the whole input",
    "input": "{\"s\":\"bay\",\"k\":8,\"fill\":\"t\"}"
  }
];
