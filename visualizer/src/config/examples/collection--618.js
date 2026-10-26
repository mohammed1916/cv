// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Uneven continent lists align sorted names and null padding",
    "input": "{\"student\":[{\"name\":\"Zora\",\"continent\":\"America\"},{\"name\":\"Kai\",\"continent\":\"Asia\"},{\"name\":\"Mira\",\"continent\":\"Europe\"},{\"name\":\"Ari\",\"continent\":\"America\"},{\"name\":\"Bela\",\"continent\":\"Europe\"},{\"name\":\"Tao\",\"continent\":\"Asia\"},{\"name\":\"Noel\",\"continent\":\"America\"},{\"name\":\"Eden\",\"continent\":\"America\"}]}"
  },
  {
    "label": "Only the America column is populated",
    "input": "{\"student\":[{\"name\":\"Ria\",\"continent\":\"America\"},{\"name\":\"Amir\",\"continent\":\"America\"}]}"
  },
  {
    "label": "Equal list sizes need no padding",
    "input": "{\"student\":[{\"name\":\"Ava\",\"continent\":\"America\"},{\"name\":\"Bo\",\"continent\":\"Asia\"},{\"name\":\"Cleo\",\"continent\":\"Europe\"}]}"
  },
  {
    "label": "No students produce no report rows",
    "input": "{\"student\":[]}"
  }
];
