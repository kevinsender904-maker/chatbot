# Deployment Guide

This project is built using Vite and Express, bundled together into a standalone Node application using `esbuild`.

## Environment Variables

You must define the following variables in the deployment environment:

- `GEMINI_API_KEY`: Your Google Gemini API key required for inference.

## Build Commands

To build the project for production, run:

```bash
npm run build
```

This command executes two steps:
1. `vite build` -> Builds the React SPA into the `/dist` folder.
2. `esbuild server.ts ...` -> Bundles the backend server into `dist/server.cjs`.

## Production Deployment Steps

### Render / Railway / Heroku
1. Connect your GitHub repository to the platform.
2. Set the Build Command to: `npm run build`
3. Set the Start Command to: `npm start` (or `node dist/server.cjs`)
4. Add the `GEMINI_API_KEY` to the environment variables.
5. Deploy.

### Vercel
Vercel typically expects specific serverless function structures (`/api`). To deploy a custom Express server on Vercel:
1. Create a `vercel.json` file configuring rewrites to the `/api` endpoints.
2. Ensure you assign `node` compatible runtime configurations.
Alternatively, deploy only the frontend via Vite, and host the Express API elsewhere.

## Security Considerations

- **API Keys**: Ensure `GEMINI_API_KEY` is kept safe and NEVER exposed in client-side variables (e.g., do NOT prefix with `VITE_`).
- **Data Privacy**: The chatbot retains conversation state only in the front-end memory. No sensitive PII or PHI is stored in a database in this repository.
