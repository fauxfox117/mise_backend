# Mise Backend

## What This Backend Powers

This backend supports a restaurant operations prototype that:

- pulls floor plan and table data from Toast APIs
- updates table status in real time when events are fired
- broadcasts updates through websockets to connected clients
- keeps manual override controls available in the app

Primary product goal:

reduce manual status updates for servers while improving host visibility of true table state during service.

## Stack

- Express
- MongoDB and Mongoose
- JWT authentication
- Socket.IO for realtime events
- Celebrate and Joi for validation
- Winston request and error logging

## Scripts

- npm run dev
- npm run start
- npm run lint

## Setup

1. Install dependencies: npm install
2. Copy env file: cp .env.example .env
3. Start MongoDB locally
4. Run backend: npm run dev

## Demo Auth Mode

For instructor demos and prototype testing, use demo auth in .env:

- DEMO_AUTH=true
- DEMO_USER_ID=demo-user

Demo sign in payload:

- email: demo@mise.local
- password: password123

In demo mode:

- signin returns a valid token without requiring a real user record
- protected routes allow the hardcoded demo user
- websocket auth is also bypassed for easy testing

## Environment Variables

- PORT
- MONGODB_URI
- JWT_SECRET
- CORS_ORIGIN
- TOAST_WEBHOOK_SECRET
- TOAST_CREDENTIALS_PATH
- DEMO_AUTH
- DEMO_USER_ID

## API Endpoints

Public:

- POST /signup
- POST /signin
- POST /toast/events

Protected:

- GET /users/me
- GET /tables/statuses
- GET /tables/floorplan
- PATCH /tables/:tableId/status
- POST /toast/sync

## Toast Integration

Toast credentials are loaded from config/toast-credentials.json.

Setup:

1. Copy config/toast-credentials.example.json to config/toast-credentials.json
2. Fill in clientId, clientSecret, restaurantGuid, and tablesUrl
3. Keep TOAST_CREDENTIALS_PATH pointed to that file

This file is gitignored so local API secrets stay out of source control.

## Realtime Flow

- webhook events and sync responses are normalized to internal table statuses
- updates are emitted over websocket as:
  - table:status:updated
  - table:statuses:snapshot
- frontend dashboard subscribes to these events for live updates

## Current Limitations

- table statuses are currently stored in-memory (not persisted)
- Toast floor plan fidelity depends on available fields in returned API payloads
- production multi-tenant and one-profile-per-restaurant onboarding are future phases
