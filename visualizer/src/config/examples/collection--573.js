// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Many nuts compete for the one special starting trip",
    "input": "{\"height\":14,\"width\":17,\"tree\":[6,8],\"squirrel\":[1,2],\"nuts\":[[2,3],[11,15],[5,1],[9,7],[0,14],[12,4],[3,10]]}"
  },
  {
    "label": "Every first choice costs more than starting from the tree",
    "input": "{\"height\":12,\"width\":12,\"tree\":[1,1],\"squirrel\":[11,11],\"nuts\":[[1,2],[2,1],[2,2]]}"
  },
  {
    "label": "One nut still includes its final trip to the tree",
    "input": "{\"height\":9,\"width\":10,\"tree\":[7,8],\"squirrel\":[1,1],\"nuts\":[[4,6]]}"
  },
  {
    "label": "Equal savings permit either optimal first nut",
    "input": "{\"height\":8,\"width\":8,\"tree\":[4,4],\"squirrel\":[1,1],\"nuts\":[[1,3],[3,1],[6,6]]}"
  }
];
