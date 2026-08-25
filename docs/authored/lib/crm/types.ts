/* The CRM boundary for form components.
 *
 * A form component's job is to collect and validate what a person typed. Which
 * CRM receives it, what that CRM calls its fields and what its wire format
 * looks like are not the component's business -- they are the site's. This file
 * is the line between the two.
 *
 * Nothing here mentions HubSpot. That is the point: see hubspot-form-client.ts
 * for the implementation, which is where every HubSpot-shaped thing lives now.
 */

export interface CrmFormFieldOption {
  id: string;
  label: string;
}

/** What a component needs in order to render one field. */
export interface CrmFormFieldSpec {
  label: string;
  placeholder?: string;
  required: boolean;
  maxLength?: number;
  options?: CrmFormFieldOption[];
}

export type ContactFormFieldName =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'companyName'
  | 'linkedinCompanyPage'
  | 'services'
  | 'description';

/** Labels, placeholders and options for the contact form, CRM-neutral. */
export type ContactFormDefinition = Record<ContactFormFieldName, CrmFormFieldSpec>;

/** What the visitor typed, by logical name. */
export interface ContactFormValues {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  linkedinCompanyPage: string;
  services: string;
  description: string;
  privacyPolicyAccepted: boolean;
}

/* A result rather than a thrown error, deliberately.
 *
 * The previous code did `catch (error) { console.log('request err>>', error) }`
 * -- the form went quiet and the visitor was never told their enquiry had not
 * been sent. A union the caller has to narrow makes handling the failure the
 * obvious thing to write, rather than something easy to leave out. */
export type CrmSubmitResult =
  | { ok: true }
  | { ok: false; reason: 'network' | 'rejected'; message?: string };

export interface ICrmFormClient {
  submit(values: ContactFormValues): Promise<CrmSubmitResult>;
}
