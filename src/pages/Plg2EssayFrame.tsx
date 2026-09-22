import EssayDocument from "@/components/EssayDocument";
import { getPage } from "@/lib/site";
import plg2EssayHtml from "./plg2-essay.html?raw";

const page = getPage("plg");

const Plg2EssayFrame = () => (
  <EssayDocument
    html={plg2EssayHtml}
    meta={page}
    back={page.backHref ? { href: page.backHref, label: page.backLabel || "← Blog" } : undefined}
  />
);

export default Plg2EssayFrame;
