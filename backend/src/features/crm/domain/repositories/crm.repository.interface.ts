import { Contact } from '../entities/contact.entity';
import { Company } from '../entities/company.entity';
import { Deal } from '../entities/deal.entity';
import { Organization } from '../entities/organization.entity';

export interface ICRMRepository {
  // Organization
  findOrganizationById(id: string): Promise<Organization | null>;
  findOrganizationBySlug(slug: string): Promise<Organization | null>;
  saveOrganization(org: Organization): Promise<void>;

  // Contact
  findContactById(id: string): Promise<Contact | null>;
  findContactsByOrgId(orgId: string): Promise<Contact[]>;
  searchContacts(orgId: string, query: string): Promise<Contact[]>;
  saveContact(contact: Contact): Promise<void>;

  // Company
  findCompanyById(id: string): Promise<Company | null>;
  saveCompany(company: Company): Promise<void>;

  // Deal
  findDealById(id: string): Promise<Deal | null>;
  findDealsByOrgId(orgId: string): Promise<Deal[]>;
  searchDeals(orgId: string, query: string): Promise<Deal[]>;
  saveDeal(deal: Deal): Promise<void>;
}
