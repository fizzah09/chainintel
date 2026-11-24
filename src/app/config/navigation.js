// Sidebar menu per role. Items point at screen keys; URLs come from app/config/paths.js.
export const NAV = {
  "inv": {
    "name": "Investigator",
    "person": "Sara Ali",
    "initials": "SA",
    "ws": "My organisation",
    "plat": false,
    "groups": [
      {
        "heading": "",
        "items": [
          {
            "label": "Investigator Dashboard",
            "key": "INV_Dashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/></svg>"
          },
          {
            "label": "Wallet Monitoring",
            "key": "WalletMonitoring",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><path d=\"M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z\"/><circle cx=\"16\" cy=\"13.5\" r=\"1.2\"/></svg>"
          },
          {
            "label": "Transaction Tracing",
            "key": "TransactionTracing",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M7 7h12l-3-3M17 17H5l3 3\"/></svg>"
          },
          {
            "label": "Investigation Graph",
            "key": "CaseRelGraph",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"5.5\" cy=\"12\" r=\"2.5\"/><circle cx=\"18\" cy=\"5.5\" r=\"2.5\"/><circle cx=\"18\" cy=\"18.5\" r=\"2.5\"/><path d=\"M8 11l7.6-4M8 13l7.6 4\"/></svg>"
          }
        ]
      },
      {
        "heading": "Work",
        "items": [
          {
            "label": "My Cases",
            "key": "INV_MyCases",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18\"/></svg>"
          },
          {
            "label": "My Tasks",
            "key": "INV_MyTasks",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M8 6h12M8 12h12M8 18h12M4 6h.1M4 12h.1M4 18h.1\"/></svg>"
          },
          {
            "label": "My Watchlists",
            "key": "WatchlistList",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>"
          },
          {
            "label": "Alerts",
            "key": "AlertsDashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M12 3.5l9.5 16.5h-19z\"/><path d=\"M12 10v4.5M12 17.2v.1\"/></svg>"
          },
          {
            "label": "Reports",
            "key": "INV_Reports",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          },
          {
            "label": "Generate report",
            "key": "ReportBuilder",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          }
        ]
      }
    ],
    "foot": [
      {
        "label": "Notifications",
        "key": "NotificationCenter",
        "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
      }
    ]
  },
  "rev": {
    "name": "Reviewer",
    "person": "Nadia Hussain",
    "initials": "NH",
    "ws": "My organisation",
    "plat": false,
    "groups": [
      {
        "heading": "",
        "items": [
          {
            "label": "Review Dashboard",
            "key": "REV_Dashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/></svg>"
          },
          {
            "label": "Wallet Monitoring",
            "key": "WalletMonitoring",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><path d=\"M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z\"/><circle cx=\"16\" cy=\"13.5\" r=\"1.2\"/></svg>"
          },
          {
            "label": "Transaction Tracing",
            "key": "TransactionTracing",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M7 7h12l-3-3M17 17H5l3 3\"/></svg>"
          },
          {
            "label": "Generate report",
            "key": "ReportBuilder",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          }
        ]
      },
      {
        "heading": "Review",
        "items": [
          {
            "label": "Review Queue",
            "key": "REV_Queue",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5\"/></svg>"
          },
          {
            "label": "Case Review",
            "key": "CaseReview",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M12 4v16M6 20h12M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0zM19 7l-3 7a3.5 3.5 0 0 0 6 0z\"/></svg>"
          }
        ]
      }
    ],
    "foot": [
      {
        "label": "Notifications",
        "key": "NotificationCenter",
        "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
      }
    ]
  },
  "cm": {
    "name": "Compliance Manager",
    "person": "Ahmed Khan",
    "initials": "AK",
    "ws": "My organisation",
    "plat": false,
    "groups": [
      {
        "heading": "",
        "items": [
          {
            "label": "Compliance Dashboard",
            "key": "CM_Dashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/></svg>"
          },
          {
            "label": "Wallet Monitoring",
            "key": "WalletMonitoring",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><path d=\"M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z\"/><circle cx=\"16\" cy=\"13.5\" r=\"1.2\"/></svg>"
          },
          {
            "label": "Transaction Tracing",
            "key": "TransactionTracing",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M7 7h12l-3-3M17 17H5l3 3\"/></svg>"
          }
        ]
      },
      {
        "heading": "Oversight",
        "items": [
          {
            "label": "Cases",
            "key": "CaseList",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18\"/></svg>"
          },
          {
            "label": "Case Assignment",
            "key": "CM_Assignment",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6\"/><path d=\"M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7\"/></svg>"
          },
          {
            "label": "Watchlists",
            "key": "WatchlistList",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M3 12V4h8l10 10-8 8z\"/><circle cx=\"7.5\" cy=\"8.5\" r=\"1.3\"/></svg>"
          },
          {
            "label": "Alerts",
            "key": "AlertsDashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M12 3.5l9.5 16.5h-19z\"/><path d=\"M12 10v4.5M12 17.2v.1\"/></svg>"
          },
          {
            "label": "Reports",
            "key": "ReportLibrary",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          },
          {
            "label": "Generate report",
            "key": "ReportBuilder",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          }
        ]
      },
      {
        "heading": "Manage",
        "items": []
      }
    ],
    "foot": [
      {
        "label": "Notifications",
        "key": "NotificationCenter",
        "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
      }
    ]
  },
  "ba": {
    "name": "Bank Admin",
    "person": "Bilal Qureshi",
    "initials": "BQ",
    "ws": "My organisation",
    "plat": false,
    "groups": [
      {
        "heading": "",
        "items": [
          {
            "label": "Bank Dashboard",
            "key": "BA_Dashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/></svg>"
          },
          {
            "label": "Wallet Monitoring",
            "key": "WalletMonitoring",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><path d=\"M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z\"/><circle cx=\"16\" cy=\"13.5\" r=\"1.2\"/></svg>"
          },
          {
            "label": "Transaction Tracing",
            "key": "TransactionTracing",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M7 7h12l-3-3M17 17H5l3 3\"/></svg>"
          }
        ]
      },
      {
        "heading": "Operations",
        "items": [
          {
            "label": "Cases",
            "key": "CaseList",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18\"/></svg>"
          },
          {
            "label": "Watchlists",
            "key": "WatchlistList",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M3 12V4h8l10 10-8 8z\"/><circle cx=\"7.5\" cy=\"8.5\" r=\"1.3\"/></svg>"
          },
          {
            "label": "Alerts",
            "key": "AlertsDashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M12 3.5l9.5 16.5h-19z\"/><path d=\"M12 10v4.5M12 17.2v.1\"/></svg>"
          },
          {
            "label": "Reports",
            "key": "ReportLibrary",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          },
          {
            "label": "Generate report",
            "key": "ReportBuilder",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          }
        ]
      },
      {
        "heading": "Administration",
        "items": [
          {
            "label": "Users & Roles",
            "key": "BA_Users",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6\"/><path d=\"M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7\"/></svg>"
          },
          {
            "label": "Audit Logs",
            "key": "BA_Audit",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z\"/><path d=\"M8.5 12l2.5 2.5 4.5-5\"/></svg>"
          },
          {
            "label": "Raise a complaint",
            "key": "RaiseComplaint",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
          }
        ]
      }
    ],
    "foot": [
      {
        "label": "Notifications",
        "key": "NotificationCenter",
        "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
      }
    ]
  },
  "aud": {
    "name": "Auditor",
    "person": "Imran Sheikh",
    "initials": "IS",
    "ws": "My organisation",
    "plat": false,
    "groups": [
      {
        "heading": "",
        "items": [
          {
            "label": "Audit Dashboard",
            "key": "AUD_Dashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/></svg>"
          },
          {
            "label": "Wallet Monitoring",
            "key": "WalletMonitoring",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><path d=\"M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z\"/><circle cx=\"16\" cy=\"13.5\" r=\"1.2\"/></svg>"
          },
          {
            "label": "Transaction Tracing",
            "key": "TransactionTracing",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M7 7h12l-3-3M17 17H5l3 3\"/></svg>"
          }
        ]
      },
      {
        "heading": "Records",
        "items": [
          {
            "label": "Case Records",
            "key": "AUD_Cases",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M3 13h18\"/></svg>"
          },
          {
            "label": "Evidence Records",
            "key": "AUD_Evidence",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M3 6.5A1.5 1.5 0 0 1 4.5 5H10l2 2.5h7.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z\"/></svg>"
          },
          {
            "label": "Reports",
            "key": "ReportLibrary",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          },
          {
            "label": "Audit Logs",
            "key": "CaseAuditTrail",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z\"/><path d=\"M8.5 12l2.5 2.5 4.5-5\"/></svg>"
          },
          {
            "label": "Review History",
            "key": "AUD_Review",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/></svg>"
          },
          {
            "label": "Generate report",
            "key": "ReportBuilder",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          }
        ]
      }
    ],
    "foot": [
      {
        "label": "Notifications",
        "key": "NotificationCenter",
        "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
      }
    ]
  },
  "ex": {
    "name": "Academic Examiner",
    "person": "Dr. Ayesha Malik",
    "initials": "AM",
    "ws": "Research sandbox",
    "plat": false,
    "groups": [
      {
        "heading": "",
        "items": [
          {
            "label": "Wallet Monitoring",
            "key": "WalletMonitoring",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><path d=\"M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z\"/><circle cx=\"16\" cy=\"13.5\" r=\"1.2\"/></svg>"
          },
          {
            "label": "Transaction Tracing",
            "key": "TransactionTracing",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M7 7h12l-3-3M17 17H5l3 3\"/></svg>"
          },
          {
            "label": "Generate report",
            "key": "ReportBuilder",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          }
        ]
      }
    ],
    "foot": []
  },
  "pa": {
    "name": "Platform Admin",
    "person": "Hina Raza",
    "initials": "HR",
    "ws": "Chain Intel Platform",
    "plat": true,
    "groups": [
      {
        "heading": "",
        "items": [
          {
            "label": "Operations Dashboard",
            "key": "PA_Dashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/></svg>"
          },
          {
            "label": "Wallet Monitoring",
            "key": "WalletMonitoring",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><path d=\"M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z\"/><circle cx=\"16\" cy=\"13.5\" r=\"1.2\"/></svg>"
          },
          {
            "label": "Transaction Tracing",
            "key": "TransactionTracing",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M7 7h12l-3-3M17 17H5l3 3\"/></svg>"
          },
          {
            "label": "Generate report",
            "key": "ReportBuilder",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          }
        ]
      },
      {
        "heading": "Operations",
        "items": [
          {
            "label": "Tenants",
            "key": "PA_Tenants",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"1.5\"/><path d=\"M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10 21v-4h4v4\"/></svg>"
          },
          {
            "label": "Platform Users",
            "key": "SA_Users",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6\"/><path d=\"M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7\"/></svg>",
            "to": "/ops/users"
          },
          {
            "label": "Network Monitoring",
            "key": "PA_Network",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18\"/></svg>"
          },
          {
            "label": "Provider Monitoring",
            "key": "PA_Provider",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><ellipse cx=\"12\" cy=\"6\" rx=\"8\" ry=\"3\"/><path d=\"M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3\"/></svg>"
          },
          {
            "label": "Complaints",
            "key": "Complaints",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
          },
          {
            "label": "Raise a complaint",
            "key": "RaiseComplaint",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
          }
        ]
      }
    ],
    "foot": []
  },
  "sa": {
    "name": "Platform Super Admin",
    "person": "Omar Farooq",
    "initials": "OF",
    "ws": "Chain Intel Platform",
    "plat": true,
    "groups": [
      {
        "heading": "",
        "items": [
          {
            "label": "Platform Overview",
            "key": "SA_Dashboard",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/></svg>"
          },
          {
            "label": "Wallet Monitoring",
            "key": "WalletMonitoring",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3\"/><path d=\"M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z\"/><circle cx=\"16\" cy=\"13.5\" r=\"1.2\"/></svg>"
          },
          {
            "label": "Transaction Tracing",
            "key": "TransactionTracing",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M7 7h12l-3-3M17 17H5l3 3\"/></svg>"
          },
          {
            "label": "Generate report",
            "key": "ReportBuilder",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 3h8l5 5v13H6z\"/><path d=\"M14 3v5h5M9 13h7M9 17h7\"/></svg>"
          }
        ]
      },
      {
        "heading": "Platform",
        "items": [
          {
            "label": "Tenant Management",
            "key": "SA_Tenants",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"1.5\"/><path d=\"M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10 21v-4h4v4\"/></svg>"
          },
          {
            "label": "Platform Users",
            "key": "SA_Users",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6\"/><path d=\"M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7\"/></svg>"
          },
          {
            "label": "Blockchain Networks",
            "key": "SA_Networks",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18\"/></svg>"
          },
          {
            "label": "Data Providers",
            "key": "SA_Providers",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><ellipse cx=\"12\" cy=\"6\" rx=\"8\" ry=\"3\"/><path d=\"M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3\"/></svg>"
          },
          {
            "label": "Risk Engine",
            "key": "SA_Risk",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\"/><path d=\"M9.5 9.5h5v5h-5zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3\"/></svg>"
          },
          {
            "label": "Platform Watchlists",
            "key": "WatchlistList",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M3 12V4h8l10 10-8 8z\"/><circle cx=\"7.5\" cy=\"8.5\" r=\"1.3\"/></svg>"
          }
        ]
      },
      {
        "heading": "System",
        "items": [
          {
            "label": "Audit Logs",
            "key": "SA_Audit",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z\"/><path d=\"M8.5 12l2.5 2.5 4.5-5\"/></svg>"
          },
          {
            "label": "Platform Settings",
            "key": "SA_Settings",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1\"/></svg>"
          },
          {
            "label": "Raise a complaint",
            "key": "RaiseComplaint",
            "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
          }
        ]
      }
    ],
    "foot": [
      {
        "label": "Complaints",
        "key": "Complaints",
        "icon": "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" ><path d=\"M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15z\"/><path d=\"M10 21h4\"/></svg>"
      }
    ]
  }
};
