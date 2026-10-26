// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Busy ID runs are interrupted by low attendance and missing IDs",
    "input": "{\"stadium\":[{\"id\":11,\"people\":140,\"visit_date\":\"2025-07-01\"},{\"id\":12,\"people\":100,\"visit_date\":\"2025-07-03\"},{\"id\":13,\"people\":210,\"visit_date\":\"2025-07-05\"},{\"id\":14,\"people\":60,\"visit_date\":\"2025-07-07\"},{\"id\":15,\"people\":190,\"visit_date\":\"2025-07-09\"},{\"id\":16,\"people\":180,\"visit_date\":\"2025-07-11\"},{\"id\":18,\"people\":170,\"visit_date\":\"2025-07-13\"},{\"id\":19,\"people\":250,\"visit_date\":\"2025-07-15\"},{\"id\":20,\"people\":130,\"visit_date\":\"2025-07-17\"},{\"id\":21,\"people\":400,\"visit_date\":\"2025-07-19\"}]}"
  },
  {
    "label": "Two busy records are not a qualifying run",
    "input": "{\"stadium\":[{\"id\":31,\"people\":100,\"visit_date\":\"2025-07-01\"},{\"id\":32,\"people\":101,\"visit_date\":\"2025-07-03\"}]}"
  },
  {
    "label": "Calendar gaps do not break consecutive visit IDs",
    "input": "{\"stadium\":[{\"id\":41,\"people\":150,\"visit_date\":\"2025-07-01\"},{\"id\":42,\"people\":160,\"visit_date\":\"2025-07-03\"},{\"id\":43,\"people\":170,\"visit_date\":\"2025-07-05\"}]}"
  },
  {
    "label": "An empty stadium has no qualifying visits",
    "input": "{\"stadium\":[]}"
  }
];
