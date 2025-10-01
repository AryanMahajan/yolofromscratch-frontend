# Frontend Deployment: Vercel

This document outlines the deployment strategy for the React frontend using Vercel.

## 1. High-Level Architecture

-   **Frontend (React):** Deployed to **Vercel** for a seamless, Git-integrated workflow and world-class performance.
-   **CI/CD (Frontend):** Handled automatically by **Vercel**, deploying on every push to the `main` branch.

---

## 2. Frontend Deployment: Vercel

Deploying the frontend to Vercel is the recommended approach:

1.  **Sign up for Vercel:** Use your GitHub account.
2.  **Create a New Project:** Import the Git repository for your `frontend` application.
3.  **Configure Project:**
    -   Vercel automatically detects the framework (Vite/React) and sets the correct build command (`npm run build`) and output directory (`dist`).
    -   **Add Environment Variables:** In the Vercel project settings, add the backend API URL. Your React code will use this to make API calls. Example: `VITE_API_BASE_URL=https://yolo-backend-service-xyz-uc.a.run.app` (the URL you get after deploying the backend).
4.  **Deploy:** Vercel triggers the first deployment. Subsequently, any push to the `main` branch automatically builds and deploys a new version.
