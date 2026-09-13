import type {
  EnquiryErrors,
  EnquiryField,
  EnquiryPayload,
  EnquiryTouched,
  EnquiryValues,
  UtmParams,
} from "./types";

export const ENQUIRY_FIELD_ORDER: readonly EnquiryField[] = ["name", "email", "phone", "message"];

export const MIN_MESSAGE_LENGTH = 12;

export const ENQUIRY_MESSAGES: Record<EnquiryField, string> = {
  name: "Add your name.",
  email: "Add an email address we can reply to.",
  phone: "Check the phone number.",
  message: "Write a sentence or two.",
};

/** Local part, one @, a dotted domain, and a two-letter or longer suffix. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;

/** Digits once the usual separators are removed, with an optional country prefix. */
const PHONE_PATTERN = /^\+?\d{7,15}$/;

const PHONE_SEPARATORS = /[\s().\-/]/g;

const UTM_PARAM_TO_KEY = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
} as const satisfies Record<string, keyof UtmParams>;

export const UTM_PARAM_NAMES = Object.keys(UTM_PARAM_TO_KEY) as (keyof typeof UTM_PARAM_TO_KEY)[];

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isPlausiblePhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone.trim().replace(PHONE_SEPARATORS, ""));
}

export function validateEnquiry(values: EnquiryValues): EnquiryErrors {
  const errors: EnquiryErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = ENQUIRY_MESSAGES.name;
  }

  if (!isValidEmail(values.email)) {
    errors.email = ENQUIRY_MESSAGES.email;
  }

  if (values.phone.trim().length > 0 && !isPlausiblePhone(values.phone)) {
    errors.phone = ENQUIRY_MESSAGES.phone;
  }

  if (values.message.trim().length < MIN_MESSAGE_LENGTH) {
    errors.message = ENQUIRY_MESSAGES.message;
  }

  return errors;
}

export function readUtmParams(search: string): UtmParams {
  const params = new URLSearchParams(search);
  const utm: UtmParams = {};

  for (const param of UTM_PARAM_NAMES) {
    const value = params.get(param)?.trim();
    if (value) {
      utm[UTM_PARAM_TO_KEY[param]] = value;
    }
  }

  return utm;
}

/** Every UTM slot, empty ones included, so the form posts a stable shape. */
export function utmFieldEntries(utm: UtmParams): { name: string; value: string }[] {
  return UTM_PARAM_NAMES.map((param) => ({
    name: param,
    value: utm[UTM_PARAM_TO_KEY[param]] ?? "",
  }));
}

export function isLikelyBot(values: EnquiryValues): boolean {
  return values.company.trim().length > 0;
}

export function buildEnquiryPayload(
  values: EnquiryValues,
  utm: UtmParams,
  source?: string | null,
): EnquiryPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    message: values.message.trim(),
    source: source?.trim() ? source.trim() : "unattributed",
    utm: { ...utm },
  };
}

/** Errors are only shown once the reader has been near the field. */
export function pickTouchedErrors(errors: EnquiryErrors, touched: EnquiryTouched): EnquiryErrors {
  const visible: EnquiryErrors = {};

  for (const field of ENQUIRY_FIELD_ORDER) {
    const message = errors[field];
    if (touched[field] && message) {
      visible[field] = message;
    }
  }

  return visible;
}

export function firstInvalidField(errors: EnquiryErrors): EnquiryField | null {
  return ENQUIRY_FIELD_ORDER.find((field) => errors[field]) ?? null;
}

export function allFieldsTouched(): EnquiryTouched {
  const touched: EnquiryTouched = {};

  for (const field of ENQUIRY_FIELD_ORDER) {
    touched[field] = true;
  }

  return touched;
}
