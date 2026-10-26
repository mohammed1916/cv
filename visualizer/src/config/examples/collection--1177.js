// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Substring parity queries need different replacement budgets",
    "input": "{\"s\":\"cedarforestcedar\",\"queries\":[[0,4,2],[2,10,3],[0,14,4],[5,5,0],[6,12,0]]}"
  },
  {
    "label": "Single character is always palindromic",
    "input": "{\"s\":\"moss\",\"queries\":[[1,1,0]]}"
  },
  {
    "label": "All counts already even",
    "input": "{\"s\":\"aabbcc\",\"queries\":[[0,5,0]]}"
  },
  {
    "label": "Two odd counts need one replacement",
    "input": "{\"s\":\"ab\",\"queries\":[[0,1,0],[0,1,1]]}"
  }
];
