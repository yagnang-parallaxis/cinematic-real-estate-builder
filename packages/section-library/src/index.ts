/* Sections, in the order they appear on the page */
export { LoadingScreen } from "./loading/LoadingScreen";
export type { LoadingContent } from "./loading/types";
export { Navigation } from "./navigation/Navigation";
export type { NavigationContent, NavigationLink, NavTone } from "./navigation/types";
export { Hero } from "./hero/Hero";
export type { HeroContent, HeroHotspot, HeroVariant } from "./hero/types";
export { HomeOpen } from "./home-open/HomeOpen";
export { Overture } from "./overture/Overture";
export type { OvertureContent } from "./overture/types";
export { ArchReveal } from "./arch/ArchReveal";
export type { ArchRevealContent } from "./arch/types";
export { Storytelling } from "./story/Storytelling";
export type { StoryBeat, StoryContent } from "./story/types";
export { Vista } from "./vista/Vista";
export type { VistaContent } from "./vista/types";
export { Concept } from "./concept/Concept";
export type {
  ConceptBetweenPanel,
  ConceptContent,
  ConceptFloral,
  ConceptFloralAccent,
  ConceptFloralCorner,
  ConceptFloralPlace,
  ConceptIntroPanel,
  ConceptPole,
  ConceptRoutePanel,
  ConceptWaypoint,
} from "./concept/types";
export { Location } from "./location/Location";
export type { LocationContent, LocationPoint } from "./location/types";
export { ResidenceTypes } from "./residence-types/ResidenceTypes";
export type { ResidenceType, ResidenceTypesContent } from "./residence-types/types";
export { ResidenceGrid } from "./residences/ResidenceGrid";
export { ResidenceDetail } from "./residences/ResidenceDetail";
export type {
  Residence,
  ResidenceCrumb,
  ResidenceDetailContent,
  ResidenceDrawing,
  ResidenceFilters,
  ResidenceGridContent,
  ResidencePhoto,
  ResidenceSort,
  ResidenceSortOption,
  ResidenceStatus,
  ResidenceTypeOption,
} from "./residences/types";
/* The helpers a page needs before it can render either residence view. */
export {
  bedroomOptions,
  findResidence,
  parseBedroomsParam,
  parseSortParam,
  parseTypeParam,
  similarResidences,
  typeOptions,
} from "./residences/logic";
export { AmenityBrowser } from "./amenity-browser/AmenityBrowser";
export type { AmenityBrowserContent, AmenityPanel } from "./amenity-browser/types";
export { Interiors } from "./interiors/Interiors";
export type { InteriorImage, InteriorsContent } from "./interiors/types";
export { Architecture } from "./architecture/Architecture";
export type { ArchitectureBreakpoint, ArchitectureContent } from "./architecture/types";
export { Assurance } from "./assurance/Assurance";
export type {
  AssuranceContent,
  AssuranceImage,
  AssuranceLink,
  AssuranceRow,
} from "./assurance/types";
export { Statement } from "./statement/Statement";
export type {
  StatementAction,
  StatementContent,
  StatementFigure,
  StatementVariant,
} from "./statement/types";
export { Contact } from "./contact/Contact";
export type {
  ContactChannel,
  ContactChannelKind,
  ContactContent,
  ContactCta,
  ContactMap,
  ContactPin,
  ContactSocial,
  ContactSocialNetwork,
} from "./contact/types";
export { Footer } from "./footer/Footer";
export type { FooterContent, FooterLink } from "./footer/types";

/* Route transition (the overlay itself is mounted by the application shell) */
export {
  navigationPath,
  resolveHref,
  routeAnnouncement,
  shouldInterceptNavigation,
  shouldPlayPageTransition,
  TRANSITION_MS,
  transitionMs,
} from "./transition/logic";
export type {
  NavigationIntent,
  PageTransitionContent,
  PageTransitionStyle,
} from "./transition/types";

/* Sitewide enquiry modal */
export { EnquiryModal } from "./enquiry/EnquiryModal";
export type { EnquiryModalProps } from "./enquiry/EnquiryModal";
export { EnquiryProvider, useEnquiry, useEnquiryContext } from "./enquiry/EnquiryProvider";
export type { EnquiryContextValue } from "./enquiry/EnquiryProvider";
export { EnquiryTrigger } from "./enquiry/EnquiryTrigger";
export type {
  EnquiryContent,
  EnquiryErrors,
  EnquiryField,
  EnquiryFieldContent,
  EnquiryPayload,
  EnquiryStatus,
  EnquirySubmit,
  EnquiryTouched,
  EnquiryValues,
  UtmParams,
} from "./enquiry/types";

/* Shared primitives */
export { CircleCta } from "./shared/CircleCta";
export { FIT_FLOOR, fitScale, quantiseScale } from "./shared/fit-text";
export { useFitText } from "./shared/useFitText";
export { Parallax } from "./shared/Parallax";
export type { ParallaxRole } from "./shared/Parallax";
export { Reveal, RevealLines } from "./shared/Reveal";
export type { RevealProps, RevealVariant } from "./shared/Reveal";
export { Section } from "./shared/Section";
export type { SectionProps } from "./shared/Section";
export { SmoothScroll } from "./shared/SmoothScroll";
export { isMediaTone, navContrastForTone, SECTION_TONES } from "./shared/tone";
export type { NavContrast, SectionTone } from "./shared/tone";
