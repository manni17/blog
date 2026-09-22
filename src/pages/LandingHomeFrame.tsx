import EssayDocument from "@/components/EssayDocument";
import { getPage } from "@/lib/site";
import landingHtml from "./landing-home.html?raw";

const page = getPage("home");

const LandingHomeFrame = () => (
  <EssayDocument
    html={landingHtml}
    meta={page}
    reveal={{ threshold: 0.07, rootMargin: "0px 0px -30px 0px" }}
  />
);

export default LandingHomeFrame;
