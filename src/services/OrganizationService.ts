import { OrganizationRepository } from '../repositories/OrganizationRepository';
import { 
  Organization, 
  CreateOrganizationInput, 
  UpdateOrganizationInput
} from '../models/Auth/interfaces';
import { 
  QueryOptions, 
  PaginatedResponse 
} from '../types/database';

export class OrganizationService {
  private organizationRepository: OrganizationRepository;

  constructor() {
    this.organizationRepository = new OrganizationRepository();
  }

  /**
   * Create a new organization
   */
  async createOrganization(orgData: CreateOrganizationInput): Promise<Organization> {
    // Check if organization already exists
    const existingOrg = await this.organizationRepository.findByName(orgData.name);
    if (existingOrg) {
      throw new Error('Organization with this name already exists');
    }

    return await this.organizationRepository.create(orgData);
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id: string): Promise<Organization | null> {
    return await this.organizationRepository.findById(id);
  }

  /**
   * Get all organizations with pagination and filtering
   */
  async getOrganizations(options: QueryOptions): Promise<PaginatedResponse<Organization>> {
    return await this.organizationRepository.findMany(options);
  }

  /**
   * Get only active organizations
   */
  async getActiveOrganizations(options: QueryOptions): Promise<PaginatedResponse<Organization>> {
    return await this.organizationRepository.findActive(options);
  }

  /**
   * Update organization
   */
  async updateOrganization(id: string, orgData: UpdateOrganizationInput): Promise<Organization | null> {
    // If name is being updated, check for duplicates
    if (orgData.name) {
      const existingOrg = await this.organizationRepository.findByName(orgData.name);
      if (existingOrg && existingOrg.id !== id) {
        throw new Error('Organization with this name already exists');
      }
    }

    return await this.organizationRepository.update(id, orgData);
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id: string): Promise<boolean> {
    // Check if organization has any users
    const stats = await this.organizationRepository.getStats(id);
    if (stats.userCount > 0) {
      throw new Error('Cannot delete organization with existing users');
    }

    return await this.organizationRepository.delete(id);
  }

  /**
   * Activate/deactivate organization
   */
  async setOrganizationActiveStatus(id: string, isActive: boolean): Promise<Organization | null> {
    return await this.organizationRepository.setActiveStatus(id, isActive);
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(id: string): Promise<{
    organization: Organization | null;
    userCount: number;
    activeUserCount: number;
  }> {
    return await this.organizationRepository.getStats(id);
  }

  /**
   * Check if organization exists by name
   */
  async organizationExists(name: string): Promise<boolean> {
    return await this.organizationRepository.existsByName(name);
  }
}
