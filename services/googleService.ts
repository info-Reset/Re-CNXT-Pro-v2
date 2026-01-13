
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
          }
        },
      });
    }
  }

  static connect(): Promise<string> {
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
        }
        this.accessToken = response.access_token;
        resolve(response.access_token);
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  static async createClientFolder(clientName: string, parentFolderId: string) {
    if (!this.accessToken) throw new Error("Not authenticated");

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: clientName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      }),
    });

    return await response.json();
  }
  static async updateSpreadsheetValues(spreadsheetId: string, values: any[][]) {
    if (!this.accessToken) throw new Error("Not authenticated");

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: values
      }),
    });

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
