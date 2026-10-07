// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Updates change multiple complement query results",
    "input": "{\"nums1\":[2,4,2,7,9],\"nums2\":[3,5,3,8,1,6],\"operations\":[[\"count\",7],[\"add\",0,4],[\"count\",9],[\"add\",2,2],[\"count\",7],[\"count\",12],[\"add\",4,6],[\"count\",9]]}"
  },
  {
    "label": "Repeated values multiply pair counts",
    "input": "{\"nums1\":[3,3,3],\"nums2\":[4,4],\"operations\":[[\"count\",7]]}"
  },
  {
    "label": "No complementary pair",
    "input": "{\"nums1\":[2,5],\"nums2\":[8,11],\"operations\":[[\"count\",4]]}"
  },
  {
    "label": "One index changes repeatedly",
    "input": "{\"nums1\":[1],\"nums2\":[2],\"operations\":[[\"add\",0,3],[\"count\",6],[\"add\",0,2],[\"count\",8]]}"
  }
];
