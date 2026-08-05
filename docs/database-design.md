# Database Design

## Overview

SplitSmart uses MongoDB with Mongoose. The application is designed around four main collections:

- User
- Group
- Expense
- Settlement

The design follows separation of concerns, where each collection has a single responsibility.

---

# 1. User Collection

Stores authentication and profile information.

### Fields

```js
{
    name,
    email,
    password,
    avatar,
    createdAt,
    updatedAt
}
```

### Purpose

- User registration
- Login using JWT
- Display profile information
- Join multiple groups
- Create expenses

---

# 2. Group Collection

Represents a shared expense group.

### Fields

```js
{
    name,
    description,
    createdBy,
    members,
    createdAt,
    updatedAt
}
```

### Purpose

- Store group information
- Maintain group members
- Manage permissions
- Associate expenses with a group

---

# 3. Expense Collection

Stores every expense added to a group.

### Fields

```js
{
    description,
    totalAmount,
    group,
    payer,
    splitType,
    splits:[
        {
            user,
            amountOwed
        }
    ],
    receiptUrl,
    date,
    createdAt,
    updatedAt
}
```

### Purpose

- Record expenses
- Store payment details
- Support Equal, Unequal and Percentage splits
- Provide data for debt optimization

---

# 4. Settlement Collection

Stores completed debt settlements.

### Fields

```js
{
    fromUser,
    toUser,
    group,
    amount,
    settledAt,
    createdAt
}
```

### Purpose

- Maintain settlement history
- Build activity feeds
- Support future payment verification
- Keep settlements separate from expenses

---

# Relationships

User
│
├── creates ─────► Group
│
├── belongs to ──► Group
│
├── pays ────────► Expense
│
└── settles ─────► Settlement

Group
│
└── contains ───► Expenses

Expense
│
└── belongs to ─► Group

Settlement
│
└── belongs to ─► Group

---

# Why This Design?

- Separation of Concerns
- Scalable MongoDB structure
- Easy querying
- Supports future features
- Suitable for debt optimization algorithm