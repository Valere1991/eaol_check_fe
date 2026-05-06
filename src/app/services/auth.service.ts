import { Injectable } from '@angular/core';
import Keycloak, { KeycloakProfile } from 'keycloak-js';

export interface EaolUser {
  username: string;
  email?: string;
  roles: string[];
  tenantId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = new Keycloak({
    url: 'http://localhost:8083',
    realm: 'eaol',
    clientId: 'eaol-dashboard'
  });

  authenticated = false;
  profile?: KeycloakProfile;
  roles: string[] = [];
  tenantId = 'demo';

  async init(): Promise<boolean> {
    try {
      this.authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false
      });
      if (this.authenticated) {
        await this.refreshUser();
      }
      return this.authenticated;
    } catch (err) {
      console.warn('Keycloak init failed. Dashboard remains in local dev mode.', err);
      this.authenticated = false;
      return false;
    }
  }

  login(): Promise<void> {
    return this.keycloak.login({ redirectUri: window.location.origin });
  }

  logout(): Promise<void> {
    return this.keycloak.logout({ redirectUri: window.location.origin });
  }

  async token(): Promise<string | undefined> {
    if (!this.authenticated) return undefined;
    await this.keycloak.updateToken(30);
    return this.keycloak.token;
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  currentUser(): EaolUser {
    return {
      username: this.profile?.username || 'local-dev',
      email: this.profile?.email,
      roles: this.roles,
      tenantId: this.tenantId
    };
  }

  private async refreshUser(): Promise<void> {
    this.profile = await this.keycloak.loadUserProfile();
    this.roles = this.keycloak.realmAccess?.roles || [];
    this.tenantId = this.deriveTenantId(this.profile?.username || '');
  }

  private deriveTenantId(username: string): string {
    if (username.startsWith('firma-')) return 'firma-it';
    return 'demo';
  }
}
