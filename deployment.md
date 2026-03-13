# Deploying HyperClass

This guide explains how to deploy your "HyperClass" application. 

Since your app uses **WebSockets** (for real-time chat and updates), we need to split it into two parts:
1.  **Backend (Server)**: Deployed to **Render** (supports WebSockets).
2.  **Frontend (Client)**: Deployed to **Vercel** (fast, global CDN).

---

## Part 1: Deploy Backend to Render

1.  Push your code to GitHub (you already did this!).
2.  Go to [dashboard.render.com](https://dashboard.render.com/) and create a new **Web Service**.
3.  Connect your GitHub repository `aadil-sp/hyperclass`.
4.  Current settings:
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
5.  Click **Create Web Service**.
6.  Once deployed, copy your **Render URL** (e.g., `https://hyperclass-server.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploy Frontend to Vercel

1.  Go to [vercel.com](https://vercel.com/) and click **Add New > Project**.
2.  Import your GitHub repository `aadil-sp/hyperclass`.
3.  Configure the project:
    *   **Root Directory**: Edit and select `client`.
    *   **Framework Preset**: Vite (should detect automatically).
    *   **Environment Variables**:
        *   Key: `VITE_SERVER_URL`
        *   Value: *Your Render URL from Part 1* (e.g., `https://hyperclass-server.onrender.com`)
4.  Click **Deploy**.

---

## Part 3: Local "One-Click" Run

You can still run the app locally exactly as before!
Just double-click `Launch HyperClass.command` on your Desktop.

The app is smart enough to use your local server when running locally, and the cloud server when running on Vercel.
