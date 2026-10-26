// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Smallest letters occur with different multiplicities",
    "input": "{\"queries\":[\"cedar\",\"aaabz\",\"mmmn\",\"xyxx\"],\"words\":[\"bbbb\",\"aac\",\"zzzzzz\",\"aabb\",\"dddddd\",\"mn\"]}"
  },
  {
    "label": "Equal frequencies do not count",
    "input": "{\"queries\":[\"aa\"],\"words\":[\"bb\",\"cc\",\"dd\"]}"
  },
  {
    "label": "One query has the largest frequency",
    "input": "{\"queries\":[\"aaaaa\"],\"words\":[\"bb\",\"ccc\"]}"
  },
  {
    "label": "Every word exceeds the query",
    "input": "{\"queries\":[\"z\"],\"words\":[\"aa\",\"bbb\",\"cccc\"]}"
  }
];
