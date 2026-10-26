// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Build nested folders append notes and compare file and directory listings",
    "input": "{\"operations\":[[\"ls\",\"/\"],[\"mkdir\",\"/studio/notes\"],[\"mkdir\",\"/studio/assets\"],[\"addContentToFile\",\"/studio/notes/session\",\"First sketch.\"],[\"addContentToFile\",\"/studio/notes/session\",\" Add shadows.\"],[\"addContentToFile\",\"/studio/notes/ideas\",\"Try warm colors.\"],[\"ls\",\"/studio\"],[\"ls\",\"/studio/notes\"],[\"ls\",\"/studio/notes/session\"],[\"readContentFromFile\",\"/studio/notes/session\"]]}"
  },
  {
    "label": "An empty root can be listed repeatedly",
    "input": "{\"operations\":[[\"ls\",\"/\"],[\"mkdir\",\"/\"],[\"ls\",\"/\"]]}"
  },
  {
    "label": "Repeated mkdir preserves files and append preserves earlier content",
    "input": "{\"operations\":[[\"mkdir\",\"/lab\"],[\"addContentToFile\",\"/lab/log\",\"A\"],[\"mkdir\",\"/lab\"],[\"addContentToFile\",\"/lab/log\",\"B\"],[\"readContentFromFile\",\"/lab/log\"]]}"
  },
  {
    "label": "Listing sorts immediate names without descending into folders",
    "input": "{\"operations\":[[\"mkdir\",\"/zebra/nested\"],[\"mkdir\",\"/amber\"],[\"addContentToFile\",\"/middle\",\"Root file\"],[\"ls\",\"/\"],[\"ls\",\"/zebra\"],[\"ls\",\"/middle\"]]}"
  }
];
