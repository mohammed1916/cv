// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Two nested folder structures disappear while a third survives",
    "input": "{\"paths\":[[\"oak\"],[\"oak\",\"bud\"],[\"oak\",\"bud\",\"tip\"],[\"pine\"],[\"pine\",\"bud\"],[\"pine\",\"bud\",\"tip\"],[\"reed\"],[\"reed\",\"seed\"]]}"
  },
  {
    "label": "Empty leaves alone are not duplicate structures",
    "input": "{\"paths\":[[\"east\"],[\"west\"],[\"east\",\"leaf\"],[\"west\",\"stem\"]]}"
  },
  {
    "label": "Deletion-created duplicates must survive the single pass",
    "input": "{\"paths\":[[\"a\"],[\"a\",\"x\"],[\"a\",\"x\",\"z\"],[\"a\",\"u\"],[\"b\"],[\"b\",\"y\"],[\"b\",\"y\",\"z\"],[\"b\",\"u\"]]}"
  },
  {
    "label": "All top-level trees are duplicate",
    "input": "{\"paths\":[[\"north\"],[\"north\",\"twig\"],[\"south\"],[\"south\",\"twig\"]]}"
  }
];
