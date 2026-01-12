
import { Client, AgencyProfile } from '../types';
import { MOCK_CLIENTS } from '../constants';

const CLIENTS_KEY = 'zenith_crm_clients';
const PROFILE_KEY = 'zenith_crm_profile';

export class StorageService {
  static getClients(): Client[] {
    const data = localStorage.getItem(CLIENTS_KEY);
    if (!data) {
      // Initialize with mock data if empty
      this.saveClients(MOCK_CLIENTS);
      return MOCK_CLIENTS;
    }
    return JSON.parse(data);
  }

  static saveClients(clients: Client[]): void {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }

  static getProfile(): AgencyProfile {
    const data = localStorage.getItem(PROFILE_KEY);
    if (!data) {
      const defaultProfile: AgencyProfile = {
        name: 'Re:CNXT Agency',
        website: 'https://re-cnxt.agency',
        plan: 'Pro',
        lastBackup: new Date().toISOString()
      };
      this.saveProfile(defaultProfile);
      return defaultProfile;
    }
    return JSON.parse(data);
  }

  static saveProfile(profile: AgencyProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  static addClient(client: Client): void {
    const clients = this.getClients();
    clients.push(client);
    this.saveClients(clients);
  }

  static updateClient(updatedClient: Client): void {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === updatedClient.id);
    if (index !== -1) {
      clients[index] = updatedClient;
      this.saveClients(clients);
    }
  }
}
