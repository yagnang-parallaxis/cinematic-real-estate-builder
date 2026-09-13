export type EnquiryField = "name" | "email" | "phone" | "message";

export interface EnquiryValues {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Honeypot. Hidden from people and assistive tech; any value marks a bot. */
  company: string;
}

export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

export type EnquiryTouched = Partial<Record<EnquiryField, boolean>>;

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface EnquiryPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
  /** Which call to action opened the modal. */
  source: string;
  utm: UtmParams;
}

export type EnquirySubmit = (payload: EnquiryPayload) => Promise<void>;

export type EnquiryStatus = "idle" | "submitting" | "success" | "error";

export interface EnquiryFieldContent {
  label: string;
  placeholder?: string;
  /** Shown beside the label; the phone field is the only optional one. */
  hint?: string;
}

export interface EnquiryContent {
  brand: string;
  eyebrow: string;
  heading: string;
  intro: string;
  fields: Record<EnquiryField, EnquiryFieldContent>;
  honeypotLabel: string;
  submitLabel: string;
  submittingLabel: string;
  closeLabel: string;
  note?: string;
  errorMessage: string;
  success: {
    eyebrow: string;
    heading: string;
    body: string;
    dismissLabel: string;
  };
}
