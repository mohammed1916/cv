// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Short roots beat overlapping longer roots",
    "input": "{\"dictionary\":[\"for\",\"forest\",\"gro\",\"grove\",\"riv\",\"river\",\"sun\"],\"sentence\":\"foresters gathered riverside sunshine beside groves and mountains\"}"
  },
  {
    "label": "One-letter root wins",
    "input": "{\"dictionary\":[\"a\",\"ac\",\"ace\"],\"sentence\":\"acers across amber\"}"
  },
  {
    "label": "No root matches",
    "input": "{\"dictionary\":[\"oak\",\"elm\"],\"sentence\":\"pine cedar birch\"}"
  },
  {
    "label": "Exact roots remain unchanged",
    "input": "{\"dictionary\":[\"fern\",\"moss\"],\"sentence\":\"fern moss mossy ferns\"}"
  }
];
