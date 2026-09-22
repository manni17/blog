import EssayDocument from "@/components/EssayDocument";
import { getPage } from "@/lib/site";
import completeStoryHtml from "./complete-story.html?raw";

const page = getPage("completeStory");

const CompleteStoryFrame = () => (
  <EssayDocument
    html={completeStoryHtml}
    meta={page}
    back={page.backHref ? { href: page.backHref, label: page.backLabel || "← Blog" } : undefined}
  />
);

export default CompleteStoryFrame;
