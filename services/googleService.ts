
/**
 * Note: Replace CLIENT_ID with the value from your Google Cloud Console.
 */

declare global {
  interface Window {
    google: any;
  }
}

export const GOOGLE_CONFIG = {
  // Uses the Client ID from environment variables (set in GitHub Secrets)
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'PASTE_YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
  SCOPES: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents',
};


export class GoogleWorkspaceService {
  private static tokenClient: any = null;
  private static accessToken: string | null = null;

  static extractIdFromUrl(url: string): string {
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : url;
  }

  static init() {
    if (window.google && window.google.accounts) {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        scope: GOOGLE_CONFIG.SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            console.log("Workspace connected successfully");
            // Optionally store a hint that we're connected
            localStorage.setItem('google_workspace_connected', 'true');
          }
        },
      });
    }
  }

  static isAuthorized(): boolean {
    return !!this.accessToken;
  }

  static async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const wasConnected = localStorage.getItem('google_workspace_connected') === 'true';
    if (wasConnected) {
      try {
        return await this.connect(true); // Attempt silent re-auth
      } catch (err) {
        console.warn("Silent re-auth failed, manual connection required");
        localStorage.removeItem('google_workspace_connected');
      }
    }

    throw new Error("User not authorized. Please connect Workspace in Settings.");
  }

  static connect(silent: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        this.init();
      }

      if (!this.tokenClient) {
        reject("Google Identity Services not loaded. Check your index.html scripts.");
        return;
      }

      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          reject(response);
          return;
        }
        this.accessToken = response.access_token;
        localStorage.setItem('google_workspace_connected', 'true');
        resolve(response.access_token);
      };

      if (silent) {
        this.tokenClient.requestAccessToken({ prompt: '' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      }
    });
  }

  static async createClientFolder(clientName: string, parentFolderId: string) {
    const token = await this.getAccessToken();

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: clientName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Drive Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  static async updateSpreadsheetValues(spreadsheetId: string, values: any[][], range: string = 'Sheet1!A1') {
    const token = await this.getAccessToken();

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: values
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Sheets Error: ${error.error?.message || response.statusText}`);
    }

    return await response.json();
  }

  static async syncClientsToSheet(spreadsheetId: string, clients: any[]) {
    // Format headers and rows
    const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Status', 'Total Revenue', 'Notes', 'Created At'];
    const rows = clients.map(client => [
      client.id,
      client.name,
      client.company,
      client.email,
      client.phone,
      client.status,
      client.totalRevenue,
      client.notes,
      client.createdAt
    ]);

    return await this.updateSpreadsheetValues(spreadsheetId, [headers, ...rows]);
  }
}
