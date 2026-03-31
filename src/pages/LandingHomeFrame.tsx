import { useEffect } from "react";
import landingHtml from "./landing-home.html?raw";

const PAGE_TITLE = "Muhanad Abdelrahim — Agentic Founder · Product Strategist";

const LandingHomeFrame = () => {
  useEffect(() => {
    const previous = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <iframe
      title={PAGE_TITLE}
      srcDoc={landingHtml}
      sandbox="allow-scripts allow-same-origin"
      style={{ display: "block", width: "100%", height: "100vh", border: 0 }}
    />
  );
};

export default LandingHomeFrame;
