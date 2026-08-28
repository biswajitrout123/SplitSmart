export const swaggerDocument = {
  "openapi": "3.0.0",
  "info": {
    "title": "SplitSmart API Documentation",
    "version": "1.0.0",
    "description": "API documentation for the SplitSmart backend services. Authentication is handled via JWT stored in HTTP-only cookies."
  },
  "servers": [
    {
      "url": "/api",
      "description": "Base API"
    }
  ],
  "components": {
    "securitySchemes": {
      "cookieAuth": {
        "type": "apiKey",
        "in": "cookie",
        "name": "token"
      }
    },
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "_id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "avatar": {
            "type": "string"
          }
        }
      },
      "Group": {
        "type": "object",
        "properties": {
          "_id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "members": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/User"
            }
          },
          "createdBy": {
            "type": "string"
          }
        }
      },
      "Expense": {
        "type": "object",
        "properties": {
          "_id": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "amount": {
            "type": "number"
          },
          "category": {
            "type": "string"
          },
          "splitType": {
            "type": "string",
            "enum": [
              "equal",
              "exact",
              "percentage"
            ]
          },
          "group": {
            "type": "string"
          },
          "paidBy": {
            "type": "string"
          }
        }
      },
      "Settlement": {
        "type": "object",
        "properties": {
          "_id": {
            "type": "string"
          },
          "from": {
            "$ref": "#/components/schemas/User"
          },
          "to": {
            "$ref": "#/components/schemas/User"
          },
          "amount": {
            "type": "number"
          },
          "group": {
            "type": "string"
          },
          "date": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    }
  },
  "security": [
    {
      "cookieAuth": []
    }
  ],
  "paths": {
    "/auth/register": {
      "post": {
        "summary": "Register a new user",
        "tags": [
          "Authentication"
        ],
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "name",
                  "email",
                  "password"
                ],
                "properties": {
                  "name": {
                    "type": "string",
                    "example": "John Doe"
                  },
                  "email": {
                    "type": "string",
                    "example": "john@example.com"
                  },
                  "password": {
                    "type": "string",
                    "example": "password123",
                    "minLength": 6
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User registered successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "User registered successfully"
                    },
                    "user": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid input or email already registered"
          }
        }
      }
    },
    "/auth/login": {
      "post": {
        "summary": "Login user",
        "tags": [
          "Authentication"
        ],
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "email",
                  "password"
                ],
                "properties": {
                  "email": {
                    "type": "string",
                    "example": "john@example.com"
                  },
                  "password": {
                    "type": "string",
                    "example": "password123"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Logged in successfully (Sets JWT cookie)",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Logged in successfully"
                    },
                    "user": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Invalid credentials"
          }
        }
      }
    },
    "/auth/me": {
      "get": {
        "summary": "Get current logged-in user profile",
        "tags": [
          "Authentication"
        ],
        "responses": {
          "200": {
            "description": "Current user data",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "user": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized - Invalid or missing token"
          }
        }
      }
    },
    "/auth/logout": {
      "post": {
        "summary": "Logout user",
        "tags": [
          "Authentication"
        ],
        "responses": {
          "200": {
            "description": "Logged out successfully (Clears cookie)"
          }
        }
      }
    },
    "/groups": {
      "post": {
        "summary": "Create a new group",
        "tags": [
          "Groups"
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "name"
                ],
                "properties": {
                  "name": {
                    "type": "string",
                    "example": "Goa Trip"
                  },
                  "description": {
                    "type": "string",
                    "example": "Expenses for the trip"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Group created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "group": {
                      "$ref": "#/components/schemas/Group"
                    }
                  }
                }
              }
            }
          }
        }
      },
      "get": {
        "summary": "Get all groups for current user",
        "tags": [
          "Groups"
        ],
        "responses": {
          "200": {
            "description": "List of user's groups",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "count": {
                      "type": "integer"
                    },
                    "groups": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Group"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/groups/{groupId}": {
      "get": {
        "summary": "Get group details",
        "tags": [
          "Groups"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Group details",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "group": {
                      "$ref": "#/components/schemas/Group"
                    }
                  }
                }
              }
            }
          },
          "403": {
            "description": "Not a member of the group"
          },
          "404": {
            "description": "Group not found"
          }
        }
      }
    },
    "/groups/{groupId}/members": {
      "post": {
        "summary": "Add a member to the group",
        "tags": [
          "Groups"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": {
                    "type": "string",
                    "example": "friend@example.com"
                  },
                  "userId": {
                    "type": "string",
                    "example": "60d0fe4f5311236168a109ca"
                  }
                },
                "description": "Must provide either email or userId"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Member added successfully"
          },
          "400": {
            "description": "Invalid input or user already in group"
          },
          "404": {
            "description": "User or group not found"
          }
        }
      }
    },
    "/groups/{groupId}/expenses": {
      "post": {
        "summary": "Create an expense",
        "tags": [
          "Expenses"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "description",
                  "amount",
                  "splitType",
                  "splits"
                ],
                "properties": {
                  "description": {
                    "type": "string",
                    "example": "Dinner"
                  },
                  "amount": {
                    "type": "number",
                    "example": 1500
                  },
                  "category": {
                    "type": "string",
                    "example": "Food"
                  },
                  "splitType": {
                    "type": "string",
                    "enum": [
                      "equal",
                      "exact",
                      "percentage"
                    ],
                    "example": "equal"
                  },
                  "splits": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "user": {
                          "type": "string"
                        },
                        "amount": {
                          "type": "number"
                        },
                        "percentage": {
                          "type": "number"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Expense created successfully"
          },
          "400": {
            "description": "Invalid input or validation failed"
          }
        }
      },
      "get": {
        "summary": "Get all expenses in a group",
        "tags": [
          "Expenses"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of expenses",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "expenses": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Expense"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/groups/{groupId}/expenses/{expenseId}": {
      "patch": {
        "summary": "Update an expense",
        "tags": [
          "Expenses"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "expenseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "amount": {
                    "type": "number",
                    "example": 2000
                  },
                  "splitType": {
                    "type": "string",
                    "enum": [
                      "equal",
                      "exact",
                      "percentage"
                    ]
                  },
                  "splits": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "user": {
                          "type": "string"
                        },
                        "amount": {
                          "type": "number"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Expense updated successfully"
          }
        }
      },
      "delete": {
        "summary": "Delete an expense",
        "tags": [
          "Expenses"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "expenseId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Expense deleted successfully"
          }
        }
      }
    },
    "/groups/{groupId}/balances": {
      "get": {
        "summary": "Get member balances for a group",
        "tags": [
          "Expenses"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Group balances",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "balances": {
                      "type": "array",
                      "items": {
                        "type": "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/groups/{groupId}/settlements": {
      "post": {
        "summary": "Create a settlement",
        "tags": [
          "Settlements"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "to",
                  "amount"
                ],
                "properties": {
                  "to": {
                    "type": "string",
                    "example": "60d0fe4f5311236168a109ca",
                    "description": "User ID receiving the settlement"
                  },
                  "amount": {
                    "type": "number",
                    "example": 500
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Settlement recorded successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "settlement": {
                      "$ref": "#/components/schemas/Settlement"
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Validation error"
          }
        }
      },
      "get": {
        "summary": "Get all settlements in a group",
        "tags": [
          "Settlements"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of settlements",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "settlements": {
                      "type": "array",
                      "items": {
                        "$ref": "#/components/schemas/Settlement"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/groups/{groupId}/remind": {
      "post": {
        "summary": "Send a debt reminder to a member",
        "tags": [
          "Notifications"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "debtorId"
                ],
                "properties": {
                  "debtorId": {
                    "type": "string",
                    "example": "60d0fe4f5311236168a109ca"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Reminder sent successfully"
          }
        }
      }
    },
    "/notifications": {
      "get": {
        "summary": "Get all notifications for the user",
        "tags": [
          "Notifications"
        ],
        "responses": {
          "200": {
            "description": "User's notifications",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {
                      "type": "boolean",
                      "example": true
                    },
                    "notifications": {
                      "type": "array",
                      "items": {
                        "type": "object"
                      }
                    },
                    "unreadCount": {
                      "type": "integer"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/notifications/read-all": {
      "patch": {
        "summary": "Mark all notifications as read",
        "tags": [
          "Notifications"
        ],
        "responses": {
          "200": {
            "description": "All notifications marked as read"
          }
        }
      }
    },
    "/notifications/{id}/read": {
      "patch": {
        "summary": "Mark a specific notification as read",
        "tags": [
          "Notifications"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Notification marked as read"
          }
        }
      }
    },
    "/groups/{groupId}/dashboard": {
      "get": {
        "summary": "Get group dashboard data",
        "tags": [
          "Groups"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Dashboard data retrieved successfully"
          }
        }
      }
    },
    "/groups/{groupId}/expenses/analytics": {
      "get": {
        "summary": "Get expense analytics for a group",
        "tags": [
          "Expenses"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Analytics data retrieved successfully"
          }
        }
      }
    },
    "/groups/{groupId}/expenses/monthly-trends": {
      "get": {
        "summary": "Get monthly expense trends for a group",
        "tags": [
          "Expenses"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Monthly trends data retrieved successfully"
          }
        }
      }
    },
    "/groups/{groupId}/simplified-settlements": {
      "get": {
        "summary": "Get simplified settlements (debt optimization)",
        "tags": [
          "Expenses"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Simplified settlements retrieved successfully"
          }
        }
      }
    },
    "/groups/{groupId}/settlements/summary": {
      "get": {
        "summary": "Get settlement summary for a group",
        "tags": [
          "Settlements"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Settlement summary retrieved successfully"
          }
        }
      }
    },
    "/groups/{groupId}/settlements/{settlementId}": {
      "delete": {
        "summary": "Delete a settlement",
        "tags": [
          "Settlements"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "settlementId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Settlement deleted successfully"
          }
        }
      }
    },
    "/groups/{groupId}/activities": {
      "get": {
        "summary": "Get group activities/history",
        "tags": [
          "Groups"
        ],
        "parameters": [
          {
            "name": "groupId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Group activities retrieved successfully"
          }
        }
      }
    }
  }
};
