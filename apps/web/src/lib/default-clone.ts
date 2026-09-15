import type { CloneConfig } from "@cinematic/schemas";

import { amenityBrowser } from "../content/amenity-browser";
import { storyArch } from "../content/arch";
import { assurance } from "../content/assurance";
import { concept } from "../content/concept";
import { contact } from "../content/contact";
import { enquiry } from "../content/enquiry";
import { interiors } from "../content/interiors";
import { location } from "../content/location";
import { closingView, residenceFigures } from "../content/passages";
import { residenceGrid, residences } from "../content/residences";
import {
  architecture,
  footer,
  hero,
  loading,
  navigation,
  residenceTypes,
  story,
} from "../content/site";
import { vista } from "../content/vista";
import { assembleClone } from "./clone-assembly";

/**
 * The Aurelia template as a `CloneConfig`. This is the seed input for
 * `data/clones/aurelia/config.json` and the last-resort fallback when neither
 * the API nor the on-disk clone can be reached.
 */
export function buildDefaultClone(): CloneConfig {
  return assembleClone({
    loading,
    navigation,
    hero,
    arch: storyArch,
    story,
    vista,
    concept,
    location,
    residenceTypes,
    amenityBrowser,
    interiors,
    architecture,
    assurance,
    residenceFigures,
    closingView,
    contact,
    footer,
    enquiry,
    residenceListing: residenceGrid,
    residences,
  });
}
