// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Mixed images combine reusable and recursively split regions",
    "input": "{\"grid1\":[[1,1,0,0],[1,1,1,0],[0,0,1,1],[0,1,1,1]],\"grid2\":[[0,0,1,0],[0,0,0,1],[1,0,0,0],[0,0,0,0]]}"
  },
  {
    "label": "Complementary quadrants collapse into one true leaf",
    "input": "{\"grid1\":[[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,0,1,1]],\"grid2\":[[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0]]}"
  },
  {
    "label": "An all-zero image reuses the other compressed image",
    "input": "{\"grid1\":[[0,0],[0,0]],\"grid2\":[[1,0],[0,1]]}"
  },
  {
    "label": "Two false single-cell leaves stay false",
    "input": "{\"grid1\":[[0]],\"grid2\":[[0]]}"
  }
];
