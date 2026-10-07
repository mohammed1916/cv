// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Two swap components reorder independently",
    "input": "{\"s\":\"forestpath\",\"pairs\":[[0,3],[3,6],[1,4],[4,7],[7,9],[2,5]]}"
  },
  {
    "label": "No allowed swaps",
    "input": "{\"s\":\"cedar\",\"pairs\":[]}"
  },
  {
    "label": "Every position joins one component",
    "input": "{\"s\":\"moss\",\"pairs\":[[0,1],[1,2],[2,3]]}"
  },
  {
    "label": "Repeated pair changes no component",
    "input": "{\"s\":\"oak\",\"pairs\":[[0,2],[0,2]]}"
  }
];
