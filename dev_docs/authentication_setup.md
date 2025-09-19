# Frontend Authentication Setup

This document details the setup of the authentication UI and logic within the React frontend.

### 1. Installed Packages

The following npm packages were installed:

- `axios`: For making HTTP requests to the backend API.
- `react-router-dom`: For handling routing and navigation within the application.
- `@react-oauth/google`: For integrating Google OAuth2 login.

### 2. Environment Variables

- An `.env` file was created in the `frontend` root to store the Google Client ID.
- The variable `VITE_GOOGLE_CLIENT_ID` is used to securely store the client ID and is loaded by Vite.

### 3. Core Configuration (`src/main.tsx`)

- The main application component is wrapped with `BrowserRouter` to enable routing.
- The `GoogleOAuthProvider` is wrapped around the app, configured with the Client ID from the `.env` file.

### 4. App Routing (`src/App.tsx`)

- The main `App` component was updated to act as a router.
- It includes a simple navigation bar with links to Home, Login, and Signup pages.
- It defines the routes for `/`, `/login`, and `/signup`.

### 5. Authentication Components

New components were created to handle the authentication user interface:

- **`src/components/Login.tsx`:** A form with email and password fields that sends a login request to the backend's `/api/auth/login/` endpoint.
- **`src/components/Signup.tsx`:** A form with first name, last name, email, and password fields that sends a registration request to `/api/auth/registration/`.
- **`src/components-google/GoogleLoginButton.tsx`:**
    - Initially implemented using the `GoogleLogin` component.
    - Later refactored to use the `useGoogleLogin` hook for a more robust access token-based flow.
    - It now gets an access token from Google and sends it to the backend's `/accounts/google/` endpoint.
