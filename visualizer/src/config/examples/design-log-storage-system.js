// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several timestamps and granularities",
    "operations": [
      "LogSystem",
      "put",
      "put",
      "put",
      "put",
      "retrieve",
      "retrieve"
    ],
    "values": [
      [],
      [
        11,
        "2025:03:14:09:20:31"
      ],
      [
        12,
        "2025:03:14:18:47:02"
      ],
      [
        13,
        "2025:03:15:00:00:00"
      ],
      [
        14,
        "2025:04:01:08:13:19"
      ],
      [
        "2025:03:14:12:00:00",
        "2025:03:15:12:00:00",
        "Day"
      ],
      [
        "2025:03:14:10:00:00",
        "2025:03:14:19:00:00",
        "Hour"
      ]
    ]
  },
  {
    "label": "Empty retrieval",
    "operations": [
      "LogSystem",
      "retrieve"
    ],
    "values": [
      [],
      [
        "2025:01:01:00:00:00",
        "2025:12:31:23:59:59",
        "Year"
      ]
    ]
  },
  {
    "label": "Exact second",
    "operations": [
      "LogSystem",
      "put",
      "retrieve"
    ],
    "values": [
      [],
      [
        21,
        "2025:06:12:13:14:15"
      ],
      [
        "2025:06:12:13:14:15",
        "2025:06:12:13:14:15",
        "Second"
      ]
    ]
  }
];
