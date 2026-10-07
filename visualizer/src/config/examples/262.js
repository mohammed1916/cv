// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Banned users and cancellation categories",
    "input": [
      [
        {
          "id": 11,
          "client_id": 1,
          "driver_id": 4,
          "status": "completed",
          "request_at": "2013-10-01"
        },
        {
          "id": 12,
          "client_id": 2,
          "driver_id": 4,
          "status": "cancelled_by_client",
          "request_at": "2013-10-01"
        },
        {
          "id": 13,
          "client_id": 3,
          "driver_id": 5,
          "status": "cancelled_by_driver",
          "request_at": "2013-10-02"
        },
        {
          "id": 14,
          "client_id": 1,
          "driver_id": 5,
          "status": "completed",
          "request_at": "2013-10-02"
        }
      ],
      [
        {
          "users_id": 1,
          "banned": "No"
        },
        {
          "users_id": 2,
          "banned": "Yes"
        },
        {
          "users_id": 3,
          "banned": "No"
        },
        {
          "users_id": 4,
          "banned": "No"
        },
        {
          "users_id": 5,
          "banned": "No"
        }
      ]
    ]
  },
  {
    "label": "No trips",
    "input": [
      [],
      [
        {
          "users_id": 7,
          "banned": "No"
        }
      ]
    ]
  },
  {
    "label": "All users banned",
    "input": [
      [
        {
          "id": 21,
          "client_id": 1,
          "driver_id": 2,
          "status": "completed",
          "request_at": "2013-10-03"
        }
      ],
      [
        {
          "users_id": 1,
          "banned": "Yes"
        },
        {
          "users_id": 2,
          "banned": "Yes"
        }
      ]
    ]
  }
];
