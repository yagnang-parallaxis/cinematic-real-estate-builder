"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

export interface EnquiryContextValue {
  isOpen: boolean;
  /** Which call to action opened the modal, submitted with the enquiry. */
  source: string | null;
  open: (source?: string) => void;
  close: () => void;
  /** The element that opened the modal, so focus can be handed back on close. */
  openerRef: RefObject<HTMLElement | null>;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

/**
 * Holds the state for the one enquiry modal on the site. Every "Book a call"
 * across the page opens this rather than navigating, so the state lives above
 * the sections and the modal itself is mounted once near the root.
 */
export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((nextSource?: string) => {
    const active = typeof document === "undefined" ? null : document.activeElement;
    openerRef.current = active instanceof HTMLElement ? active : null;
    setSource(nextSource ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<EnquiryContextValue>(
    () => ({ isOpen, source, open, close, openerRef }),
    [isOpen, source, open, close],
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiryContext(): EnquiryContextValue {
  const value = useContext(EnquiryContext);

  if (!value) {
    throw new Error("useEnquiry must be used inside an EnquiryProvider.");
  }

  return value;
}

export function useEnquiry(): Pick<EnquiryContextValue, "isOpen" | "open" | "close"> {
  const { isOpen, open, close } = useEnquiryContext();
  return useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
}
