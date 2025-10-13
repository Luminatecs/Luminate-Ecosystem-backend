/**
 * Temporary Credential Model
 * Represents temporary login credentials sent to guardians
 */

export interface TemporaryCredential {
  id: string;
  userId: string;
  tempCode: string;
  tempPassword: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface CreateTemporaryCredentialDTO {
  userId: string;
  expiresInDays?: number; // Default 5 days
}

export interface TemporaryCredentialResponse {
  tempCode: string;
  tempPassword: string;
  expiresAt: Date;
}
