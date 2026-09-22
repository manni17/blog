import EssayDocument from "@/components/EssayDocument";
import { getPage } from "@/lib/site";
import storyHtml from "./microservices-rubble.html?raw";

const page = getPage("rubble");

const MicroservicesRubbleFrame = () => (
  <EssayDocument
    html={storyHtml}
    meta={page}
    back={page.backHref ? { href: page.backHref, label: page.backLabel || "← Home" } : undefined}
  />
);

export default MicroservicesRubbleFrame;
