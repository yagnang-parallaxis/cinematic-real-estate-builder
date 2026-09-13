"use client";

import { cn } from "@cinematic/ui";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from "react";

import { BrandMark } from "../shared/BrandMark";
import { HoverSlide } from "../shared/HoverSlide";
import { Reveal } from "../shared/Reveal";
import { useEnquiryContext } from "./EnquiryProvider";
import {
  allFieldsTouched,
  buildEnquiryPayload,
  firstInvalidField,
  isLikelyBot,
  pickTouchedErrors,
  readUtmParams,
  utmFieldEntries,
  validateEnquiry,
} from "./logic";
import type {
  EnquiryContent,
  EnquiryErrors,
  EnquiryField,
  EnquiryStatus,
  EnquirySubmit,
  EnquiryTouched,
  EnquiryValues,
  UtmParams,
} from "./types";

const EMPTY_VALUES: EnquiryValues = { name: "", email: "", phone: "", message: "", company: "" };

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]",
].join(", ");

/** No endpoint is assumed: the default handler only pretends to travel. */
const stubSubmit: EnquirySubmit = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 700);
  });

function focusable(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((node) => node.tabIndex >= 0);
}

export interface EnquiryModalProps {
  content: EnquiryContent;
  onSubmit?: EnquirySubmit;
}

export function EnquiryModal({ content, onSubmit }: EnquiryModalProps) {
  const { isOpen, source, close, openerRef } = useEnquiryContext();

  if (!isOpen) {
    return null;
  }

  return (
    <EnquiryDialog
      content={content}
      onSubmit={onSubmit}
      source={source}
      close={close}
      openerRef={openerRef}
    />
  );
}

function EnquiryDialog({
  content,
  onSubmit,
  source,
  close,
  openerRef,
}: EnquiryModalProps & {
  source: string | null;
  close: () => void;
  openerRef: RefObject<HTMLElement | null>;
}) {
  const baseId = useId();
  const [values, setValues] = useState<EnquiryValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState<EnquiryTouched>({});
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<EnquiryStatus>("idle");
  const [utm, setUtm] = useState<UtmParams>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    setUtm(readUtmParams(window.location.search));
  }, []);

  useEffect(() => {
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [close, openerRef]);

  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus();
    }
  }, [status]);

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) {
      return;
    }

    const nodes = focusable(panelRef.current);
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    const onBackdrop = event.target === event.currentTarget;
    if (onBackdrop && pressedBackdrop.current) {
      close();
    }
    pressedBackdrop.current = false;
  };

  const change =
    (field: keyof EnquiryValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const next = { ...values, [field]: event.target.value };
      setValues(next);
      setErrors(pickTouchedErrors(validateEnquiry(next), touched));
    };

  const blur = (field: EnquiryField) => () => {
    const next = { ...touched, [field]: true };
    setTouched(next);
    setErrors(pickTouchedErrors(validateEnquiry(values), next));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateEnquiry(values);
    setTouched(allFieldsTouched());
    setErrors(nextErrors);

    const invalid = firstInvalidField(nextErrors);
    if (invalid) {
      panelRef.current?.querySelector<HTMLElement>(`[data-field="${invalid}"]`)?.focus();
      return;
    }

    // A filled honeypot is answered with the same confirmation and no delivery.
    if (isLikelyBot(values)) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    try {
      await (onSubmit ?? stubSubmit)(buildEnquiryPayload(values, utm, source));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const fieldId = (field: EnquiryField) => `${baseId}-${field}`;
  const errorId = (field: EnquiryField) => `${baseId}-${field}-error`;

  const fieldProps = (field: EnquiryField) => ({
    id: fieldId(field),
    name: field,
    "data-field": field,
    value: values[field],
    placeholder: content.fields[field].placeholder,
    onChange: change(field),
    onBlur: blur(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? errorId(field) : undefined,
    className: cn("enquiry-input", errors[field] && "is-invalid"),
  });

  const fieldError = (field: EnquiryField) =>
    errors[field] ? (
      <p id={errorId(field)} className="t-caption enquiry-error">
        {errors[field]}
      </p>
    ) : null;

  const label = (field: EnquiryField) => (
    <label className="t-label enquiry-label" htmlFor={fieldId(field)}>
      {content.fields[field].label}
      {content.fields[field].hint ? (
        <span className="enquiry-hint">{content.fields[field].hint}</span>
      ) : null}
    </label>
  );

  return (
    <div
      className="enquiry-overlay"
      onMouseDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={onBackdropClick}
      onKeyDown={trapFocus}
    >
      <div
        ref={panelRef}
        className="enquiry-panel"
        data-tone="dark"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-heading`}
      >
        <button type="button" className="enquiry-close" onClick={close}>
          <HoverSlide className="t-label">{content.closeLabel}</HoverSlide>
        </button>

        <Reveal variant="block" immediate className="enquiry-head">
          <p className="t-label enquiry-lockup">
            <BrandMark className="enquiry-mark" />
            {content.brand}
          </p>
          <p className="t-label enquiry-eyebrow">{content.eyebrow}</p>
          <h2 id={`${baseId}-heading`} className="t-h3 enquiry-heading">
            {content.heading}
          </h2>
          <p className="t-body enquiry-intro">{content.intro}</p>
        </Reveal>

        {status === "success" ? (
          <Reveal variant="block" immediate>
            <div ref={successRef} className="enquiry-success" tabIndex={-1}>
              <p className="t-label enquiry-eyebrow">{content.success.eyebrow}</p>
              <h3 className="t-h4 enquiry-success-heading">{content.success.heading}</h3>
              <p className="t-body enquiry-intro">{content.success.body}</p>
              <button type="button" className="enquiry-submit" onClick={close}>
                <HoverSlide className="t-label" align="center">
                  {content.success.dismissLabel}
                </HoverSlide>
              </button>
            </div>
          </Reveal>
        ) : (
          <form
            className="enquiry-form"
            noValidate
            onSubmit={submit}
            aria-busy={status === "submitting"}
          >
            <div className="enquiry-field">
              {label("name")}
              <input
                {...fieldProps("name")}
                ref={firstFieldRef}
                type="text"
                autoComplete="name"
                required
              />
              {fieldError("name")}
            </div>

            <div className="enquiry-field">
              {label("email")}
              <input {...fieldProps("email")} type="email" autoComplete="email" required />
              {fieldError("email")}
            </div>

            <div className="enquiry-field enquiry-field-wide">
              {label("phone")}
              <input {...fieldProps("phone")} type="tel" autoComplete="tel" />
              {fieldError("phone")}
            </div>

            <div className="enquiry-field enquiry-field-wide">
              {label("message")}
              <textarea {...fieldProps("message")} rows={4} />
              {fieldError("message")}
            </div>

            <div className="enquiry-hp" aria-hidden="true">
              <label htmlFor={`${baseId}-company`}>{content.honeypotLabel}</label>
              <input
                id={`${baseId}-company`}
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.company}
                onChange={change("company")}
              />
            </div>

            {utmFieldEntries(utm).map((entry) => (
              <input
                key={entry.name}
                type="hidden"
                name={entry.name}
                value={entry.value}
                readOnly
              />
            ))}
            <input type="hidden" name="source" value={source ?? ""} readOnly />

            {status === "error" ? (
              <p role="alert" className="t-caption enquiry-alert enquiry-field-wide">
                {content.errorMessage}
              </p>
            ) : null}

            <div className="enquiry-actions enquiry-field-wide">
              <button type="submit" className="enquiry-submit" disabled={status === "submitting"}>
                <HoverSlide className="t-label" align="center">
                  {status === "submitting" ? content.submittingLabel : content.submitLabel}
                </HoverSlide>
              </button>
              {content.note ? <p className="t-caption enquiry-note">{content.note}</p> : null}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
