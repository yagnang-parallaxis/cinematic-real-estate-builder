import { writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { concept } from "../../../apps/web/src/content/concept";
import { Concept } from "../src/concept/Concept";

writeFileSync(
  new URL("section.html", import.meta.url),
  renderToStaticMarkup(<Concept content={concept} />),
);
