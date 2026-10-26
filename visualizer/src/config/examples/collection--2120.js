// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Every suffix restarts before a long winding route",
    "input": "{\"n\":5,\"startPos\":[2,1],\"s\":\"RRDDLUURRDDLLUU\"}"
  },
  {
    "label": "A one-cell grid rejects every first move",
    "input": "{\"n\":1,\"startPos\":[0,0],\"s\":\"RDLU\"}"
  },
  {
    "label": "Instructions immediately point outside the top boundary",
    "input": "{\"n\":4,\"startPos\":[0,2],\"s\":\"UUURD\"}"
  },
  {
    "label": "A short loop stays inside until its later boundary move",
    "input": "{\"n\":3,\"startPos\":[1,1],\"s\":\"RDLURR\"}"
  }
];
