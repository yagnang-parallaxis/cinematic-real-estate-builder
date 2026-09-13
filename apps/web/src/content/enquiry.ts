import type { EnquiryContent } from "@cinematic/section-library";

export const enquiry: EnquiryContent = {
  brand: "Aurelia Residences",
  eyebrow: "Enquire",
  heading: "Book a call",
  intro: "Tell us how to reach you. The sales office answers within one working day.",
  fields: {
    name: { label: "Name", placeholder: "First and last" },
    email: { label: "Email", placeholder: "name@domain.com" },
    phone: { label: "Phone", hint: "Optional", placeholder: "+1 555 010 0142" },
    message: {
      label: "Message",
      placeholder: "Which residence, and when you would like to see it.",
    },
  },
  honeypotLabel: "Company",
  submitLabel: "Send enquiry",
  submittingLabel: "Sending",
  closeLabel: "Close",
  note: "Your details are used for this enquiry and nothing else.",
  errorMessage: "That did not send. Try again, or call the sales office.",
  success: {
    eyebrow: "Received",
    heading: "Thank you",
    body: "Your note is with the sales office. Someone will call you within one working day.",
    dismissLabel: "Back to the site",
  },
};
