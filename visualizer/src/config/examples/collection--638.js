// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Reusable bundles compete with individual units across three items",
    "input": "{\"price\":[3,6,4],\"special\":[[2,1,0,9],[0,1,2,10],[1,0,1,5],[3,2,1,25]],\"needs\":[4,3,3]}"
  },
  {
    "label": "An oversized discount cannot buy unwanted extras",
    "input": "{\"price\":[4,7],\"special\":[[3,1,5]],\"needs\":[2,1]}"
  },
  {
    "label": "No required items costs zero",
    "input": "{\"price\":[2,5],\"special\":[[1,1,4]],\"needs\":[0,0]}"
  },
  {
    "label": "Offers more expensive than unit purchases are irrelevant",
    "input": "{\"price\":[2,3],\"special\":[[1,1,8]],\"needs\":[3,2]}"
  }
];
