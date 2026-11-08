// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several competing source regions",
    "input": "{\"n\":5,\"m\":6,\"sources\":[[0,0,2],[4,5,7],[1,4,4],[3,1,9]]}"
  },
  {
    "label": "One source",
    "input": "{\"n\":3,\"m\":5,\"sources\":[[1,2,6]]}"
  },
  {
    "label": "Equal-distance tie",
    "input": "{\"n\":1,\"m\":5,\"sources\":[[0,0,3],[0,4,8]]}"
  },
  {
    "label": "Single cell",
    "input": "{\"n\":1,\"m\":1,\"sources\":[[0,0,5]]}"
  },
  {
    "label": "Four sources in a row",
    "input": "{\"n\":1,\"m\":4,\"sources\":[[0,0,1],[0,1,2],[0,2,3],[0,3,4]]}"
  },
  {
    "label": "Equal colors at two corners",
    "input": "{\"n\":3,\"m\":3,\"sources\":[[0,0,5],[2,2,5]]}"
  },
  {
    "label": "Largest color value",
    "input": "{\"n\":2,\"m\":2,\"sources\":[[0,0,1000000],[1,1,1]]}"
  },
  {
    "label": "Long run: 50 by 50 grid",
    "input": "{\"n\":50,\"m\":50,\"sources\":[[5,16,426675],[28,42,43336],[35,37,806534],[14,2,928700],[4,28,32049],[39,14,66976],[20,47,332141],[14,36,643533]]}"
  }
];
