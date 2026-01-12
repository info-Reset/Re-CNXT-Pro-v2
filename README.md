
# Re:CNXT Pro - Private Agency CRM

## Setup Instructions

1. **Google Cloud Setup**:
   - Create a project at [Google Cloud Console](https://console.cloud.google.com/).
   - Enable Drive and Sheets APIs.
   - Create OAuth 2.0 Credentials (Web).
   - Add `https://<your-username>.github.io` to Authorized JavaScript Origins.
   - Update `services/googleService.ts` with your Client ID.

2. **GitHub Secrets**:
   - `API_KEY`: Your Gemini API Key from [AI Studio](https://aistudio.google.com/).
   - `APP_ACCESS_KEY`: Your desired login password for the CRM.

3. **Backend Initialization**:
   - Create a blank Google Sheet in your Drive.
   - Create a Folder in your Drive for client assets.
   - In the CRM Settings > Cloud Backend, paste the IDs for both.

## Security
- This app uses `localStorage` for session handling and `OAuth 2.0` for Google Workspace access.
- No client data is stored on GitHub servers; it resides exclusively in your browser and your Google account.
