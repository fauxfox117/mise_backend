# Mise Backend

Express backend scaffolded in the same style as se_project_express.

## Scripts

- `npm run dev` - start with nodemon
- `npm run start` - start with node
- `npm run lint` - run eslint

## Setup

1. Install deps: `npm install`
2. Copy env file: `cp .env.example .env`
3. Start MongoDB locally
4. Run backend: `npm run dev`

## Auth Endpoints

- `POST /signup`
  - body: `{ "name": "...", "email": "...", "password": "...", "avatar": "https://..." }`
- `POST /signin`
  - body: `{ "email": "...", "password": "..." }`
  - returns: `{ "token": "..." }`
- `GET /users/me`
  - header: `Authorization: Bearer <token>`

## Notes

- Default `CORS_ORIGIN` is `http://localhost:3000`.
- You can still set multiple origins by separating them with commas if needed later.
- Use a strong `JWT_SECRET` in production.
