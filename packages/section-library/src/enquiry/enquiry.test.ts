import { describe, expect, it } from "vitest";

import {
  allFieldsTouched,
  buildEnquiryPayload,
  ENQUIRY_MESSAGES,
  firstInvalidField,
  isLikelyBot,
  isPlausiblePhone,
  isValidEmail,
  MIN_MESSAGE_LENGTH,
  pickTouchedErrors,
  readUtmParams,
  utmFieldEntries,
  validateEnquiry,
} from "./logic";
import type { EnquiryValues } from "./types";

const valid: EnquiryValues = {
  name: "Ingrid Halvorsen",
  email: "ingrid@northharbour.example",
  phone: "+1 (555) 010-0142",
  message: "We would like to see the garden residence on a weekday morning.",
  company: "",
};

function withValues(overrides: Partial<EnquiryValues>): EnquiryValues {
  return { ...valid, ...overrides };
}

describe("validateEnquiry", () => {
  it("returns no errors for complete, well-formed values", () => {
    expect(validateEnquiry(valid)).toEqual({});
  });

  it("accepts an absent phone number", () => {
    expect(validateEnquiry(withValues({ phone: "" }))).toEqual({});
    expect(validateEnquiry(withValues({ phone: "   " }))).toEqual({});
  });

  it("requires a name", () => {
    expect(validateEnquiry(withValues({ name: "" }))).toEqual({ name: ENQUIRY_MESSAGES.name });
  });

  it("treats a whitespace-only name as missing", () => {
    expect(validateEnquiry(withValues({ name: "  \t " }))).toEqual({ name: ENQUIRY_MESSAGES.name });
  });

  it("rejects a malformed email", () => {
    expect(validateEnquiry(withValues({ email: "ingrid at northharbour" }))).toEqual({
      email: ENQUIRY_MESSAGES.email,
    });
  });

  it("rejects a phone number that cannot be dialled", () => {
    expect(validateEnquiry(withValues({ phone: "0142" }))).toEqual({
      phone: ENQUIRY_MESSAGES.phone,
    });
  });

  it("rejects a message under the minimum length", () => {
    expect(validateEnquiry(withValues({ message: "Interested" }))).toEqual({
      message: ENQUIRY_MESSAGES.message,
    });
  });

  it("measures the message after trimming", () => {
    const padded = `   ${"a".repeat(MIN_MESSAGE_LENGTH - 1)}   `;
    expect(validateEnquiry(withValues({ message: padded }))).toEqual({
      message: ENQUIRY_MESSAGES.message,
    });
    expect(validateEnquiry(withValues({ message: "a".repeat(MIN_MESSAGE_LENGTH) }))).toEqual({});
  });

  it("reports several failures at once", () => {
    expect(
      validateEnquiry({ name: "", email: "nope", phone: "12", message: "hi", company: "" }),
    ).toEqual({
      name: ENQUIRY_MESSAGES.name,
      email: ENQUIRY_MESSAGES.email,
      phone: ENQUIRY_MESSAGES.phone,
      message: ENQUIRY_MESSAGES.message,
    });
  });

  it("ignores the honeypot when validating", () => {
    expect(validateEnquiry(withValues({ company: "Bot Industries" }))).toEqual({});
  });
});

describe("isValidEmail", () => {
  it.each([
    "ingrid@northharbour.example",
    "ingrid.halvorsen@sales.north-harbour.co.uk",
    "  spaced@example.com  ",
    "i+enquiry@example.com",
  ])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each([
    "",
    "ingrid",
    "ingrid@",
    "@example.com",
    "ingrid@example",
    "ingrid@example.c",
    "ingrid@@example.com",
    "ingrid @example.com",
    "ingrid@example.com.",
  ])("rejects %s", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe("isPlausiblePhone", () => {
  it.each(["+1 (555) 010-0142", "5550100142", "+47 21 00 01 42", "555.010.0142"])(
    "accepts %s",
    (phone) => {
      expect(isPlausiblePhone(phone)).toBe(true);
    },
  );

  it.each(["", "12345", "call me", "+1 (555) 010-0142 ext 9", "1234567890123456"])(
    "rejects %s",
    (phone) => {
      expect(isPlausiblePhone(phone)).toBe(false);
    },
  );
});

describe("readUtmParams", () => {
  it("reads every supported parameter", () => {
    expect(
      readUtmParams(
        "?utm_source=newsletter&utm_medium=email&utm_campaign=harbour&utm_content=footer&utm_term=quiet+harbour",
      ),
    ).toEqual({
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "harbour",
      utmContent: "footer",
      utmTerm: "quiet harbour",
    });
  });

  it("works without the leading question mark", () => {
    expect(readUtmParams("utm_source=print")).toEqual({ utmSource: "print" });
  });

  it("ignores unrelated parameters", () => {
    expect(readUtmParams("?loader=1&utm_source=print&ref=partner")).toEqual({
      utmSource: "print",
    });
  });

  it("returns an empty record for an empty search string", () => {
    expect(readUtmParams("")).toEqual({});
    expect(readUtmParams("?")).toEqual({});
  });

  it("drops parameters that are present but blank", () => {
    expect(readUtmParams("?utm_source=&utm_medium=%20&utm_campaign=harbour")).toEqual({
      utmCampaign: "harbour",
    });
  });
});

describe("utmFieldEntries", () => {
  it("emits every slot, blank where unknown", () => {
    expect(utmFieldEntries({ utmSource: "newsletter" })).toEqual([
      { name: "utm_source", value: "newsletter" },
      { name: "utm_medium", value: "" },
      { name: "utm_campaign", value: "" },
      { name: "utm_content", value: "" },
      { name: "utm_term", value: "" },
    ]);
  });
});

describe("isLikelyBot", () => {
  it("is false when the honeypot is untouched", () => {
    expect(isLikelyBot(valid)).toBe(false);
    expect(isLikelyBot(withValues({ company: "   " }))).toBe(false);
  });

  it("is true when the honeypot carries a value", () => {
    expect(isLikelyBot(withValues({ company: "Bot Industries" }))).toBe(true);
  });
});

describe("buildEnquiryPayload", () => {
  const utm = { utmSource: "newsletter", utmMedium: "email" };

  it("assembles trimmed values with the UTM record and the source", () => {
    const payload = buildEnquiryPayload(
      withValues({ name: "  Ingrid  ", email: "  Ingrid@Example.com ", phone: " 5550100142 " }),
      utm,
      "nav",
    );

    expect(payload).toEqual({
      name: "Ingrid",
      email: "ingrid@example.com",
      phone: "5550100142",
      message: valid.message,
      source: "nav",
      utm,
    });
  });

  it("strips the honeypot", () => {
    const payload = buildEnquiryPayload(withValues({ company: "Bot Industries" }), {}, "footer");
    expect("company" in payload).toBe(false);
  });

  it("falls back to an explicit source when none was recorded", () => {
    expect(buildEnquiryPayload(valid, {}, null).source).toBe("unattributed");
    expect(buildEnquiryPayload(valid, {}, "  ").source).toBe("unattributed");
    expect(buildEnquiryPayload(valid, {}).source).toBe("unattributed");
  });

  it("copies the UTM record rather than holding a reference", () => {
    const source = { utmSource: "newsletter" };
    const payload = buildEnquiryPayload(valid, source, "nav");
    source.utmSource = "changed";
    expect(payload.utm).toEqual({ utmSource: "newsletter" });
  });
});

describe("pickTouchedErrors", () => {
  const errors = { name: ENQUIRY_MESSAGES.name, email: ENQUIRY_MESSAGES.email };

  it("keeps only the errors for fields that have been touched", () => {
    expect(pickTouchedErrors(errors, { email: true })).toEqual({ email: ENQUIRY_MESSAGES.email });
  });

  it("returns nothing when no field has been touched", () => {
    expect(pickTouchedErrors(errors, {})).toEqual({});
  });

  it("keeps every error once every field is touched", () => {
    expect(pickTouchedErrors(errors, allFieldsTouched())).toEqual(errors);
  });
});

describe("firstInvalidField", () => {
  it("follows the order the fields are read in", () => {
    expect(
      firstInvalidField({ message: ENQUIRY_MESSAGES.message, email: ENQUIRY_MESSAGES.email }),
    ).toBe("email");
  });

  it("returns null when there is nothing to fix", () => {
    expect(firstInvalidField({})).toBe(null);
  });
});

describe("allFieldsTouched", () => {
  it("marks each field", () => {
    expect(allFieldsTouched()).toEqual({ name: true, email: true, phone: true, message: true });
  });
});
