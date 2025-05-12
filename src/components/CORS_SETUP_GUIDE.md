# Firebase Storage CORS Configuration Guide

You're encountering CORS errors because Firebase Storage's default configuration doesn't allow cross-origin requests from your local development server at `http://localhost:5173`.

## Solution

### Step 1: Create a CORS configuration file

Create a file named `cors.json` with this content:

```json
[
  {
    "origin": [
      "http://localhost:5173",
      "https://abhigyan-gurukul.web.app",
      "https://abhigyan-gurukul.firebaseapp.com"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Content-Length",
      "Authorization",
      "User-Agent",
      "x-goog-*"
    ]
  }
]
```

### Step 2: Use the Firebase CLI to apply the configuration

```bash
# Install Firebase CLI globally if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Select your project
firebase use abhigyan-gurukul

# Apply the CORS configuration
firebase storage:cors set cors.json
```

### Step 3: Verify your Firebase Storage Rules

Make sure your Firebase Storage security rules allow uploads. Go to the Firebase Console → Storage → Rules tab.

Basic rules that allow authenticated uploads:
