// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several parent and current segments",
    "path": "/archive//photos/../drafts/./2026/../../notes/"
  },
  {
    "label": "Cannot go above root",
    "path": "/../../.."
  },
  {
    "label": "Dots inside names",
    "path": "/a/.../b/.hidden/../c"
  },
  {
    "label": "Already canonical",
    "path": "/forest/river"
  },
  {
    "label": "Root",
    "path": "/"
  }
];
