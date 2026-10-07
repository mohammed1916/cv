// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several branching words lead to a multi-step shortest ladder",
    "input": "{\"beginWord\":\"cold\",\"endWord\":\"warm\",\"wordList\":[\"cord\",\"card\",\"ward\",\"warm\",\"word\",\"worm\",\"wold\",\"bold\",\"bald\",\"bard\"]}"
  },
  {
    "label": "The destination is absent from the allowed dictionary",
    "input": "{\"beginWord\":\"map\",\"endWord\":\"sun\",\"wordList\":[\"cap\",\"cat\",\"sat\",\"sap\"]}"
  },
  {
    "label": "The destination exists but belongs to a disconnected group",
    "input": "{\"beginWord\":\"red\",\"endWord\":\"sky\",\"wordList\":[\"bed\",\"bad\",\"sad\",\"sky\",\"sly\"]}"
  },
  {
    "label": "A direct neighbor needs the two endpoint words",
    "input": "{\"beginWord\":\"pine\",\"endWord\":\"wine\",\"wordList\":[\"wine\",\"fine\",\"line\"]}"
  }
];
