# Candidate Form Client

React + Vite frontend for the candidate document submission assignment.

## What It Does

- Collects candidate personal details
- Captures residential and permanent address
- Uploads at least 2 supporting documents
- Shows submitted records from the backend

## Run Locally

1. Start the backend on `http://localhost:5000`
2. Start the client:

```bash
npm install
npm run dev
```

## Notes

- API calls use the Vite proxy in local development
- Set `VITE_API_URL` if the frontend and backend run on different hosts
