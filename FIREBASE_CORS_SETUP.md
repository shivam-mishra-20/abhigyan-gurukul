# Firebase CORS Setup Instructions

To fix CORS issues with Firebase Storage, follow these steps:

1. Install the Firebase CLI if you haven't already:

   ```bash
   npm install -g firebase-tools
   ```

2. Log in to Firebase:

   ```bash
   firebase login
   ```

3. Set the current project:

   ```bash
   firebase use abhigyan-gurukul
   ```

4. Apply the CORS configuration (from firebase.storage.cors.json):

   ```bash
   firebase storage:cors set firebase.storage.cors.json
   ```

5. Verify the new CORS settings:
   ```bash
   firebase storage:cors get
   ```

These steps need to be executed by someone with Firebase admin access for the abhigyan-gurukul project.

## Troubleshooting

If you still experience CORS issues:

1. Make sure your storage bucket is correctly set to `abhigyan-gurukul.appspot.com` in the .env file
2. Check that Firebase Storage rules allow write access
3. Verify you're using the correct Firebase project
4. Clear browser cache or try in incognito mode
