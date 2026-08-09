Database Design (MongoDB/Mongoose)

We will use three primary collections to leverage MongoDB's document embedding capabilities.

1. User Collection

Handles authentication and basic profile information.

{
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  createdAt: { type: Date, default: Date.now }
}


2. Group Collection

Acts as a container for expenses and manages memberships.

{
  _id: ObjectId,
  name: { type: String, required: true },
  description: { type: String }, // Optional
  members: [{ type: ObjectId, ref: 'User' }], // Array of User IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}


3. Expense Collection

The core ledger. It tracks who paid and how the cost is split using an embedded array.

{
  _id: ObjectId,
  groupId: { type: ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true }, // e.g., "Dinner at Cyber Hub"
  totalAmount: { type: Number, required: true },
  payerId: { type: ObjectId, ref: 'User', required: true }, // Who fronted the cash
  
  // Embedded array defining how the totalAmount is divided
  splits: [
    {
      userId: { type: ObjectId, ref: 'User', required: true },
      amountOwed: { type: Number, required: true } 
    }
  ],
  
  date: { type: Date, default: Date.now }
}


Notes on Debt Simplification Algorithm

The algorithm will query the Expense collection by groupId. It will iterate through all documents and their splits arrays to calculate a single net balance hash map (e.g., { UserA: +50, UserB: -20, UserC: -30 }) before applying the greedy settlement logic.

## Groups API

### Create Group

POST `/api/groups`

Authentication required.

Request body:

```json
{
    "name": "Goa Trip",
    "description": "Trip with college friends"
}