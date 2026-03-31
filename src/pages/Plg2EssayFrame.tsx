import { Link } from "react-router-dom";
import { useEffect } from "react";
import plg2EssayHtml from "./plg2-essay.html?raw";

const PAGE_TITLE = "We Stopped Teaching. We Started Doing. — Steller PLG 2.0";

const Plg2EssayFrame = () => {
  useEffect(() => {
    const previous = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#F8F6F1" }}>
      <Link
        to="/blog"
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 10000,
          borderRadius: 6,
          border: "1px solid #E0DBCF",
          background: "rgba(254, 253, 251, 0.95)",
          padding: "6px 12px",
          fontFamily: "ui-monospace, monospace",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#141210",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          textDecoration: "none",
        }}
      >
        ← Blog
      </Link>
      <iframe
        title={PAGE_TITLE}
        srcDoc={plg2EssayHtml}
        sandbox="allow-scripts allow-same-origin"
        style={{ display: "block", width: "100%", height: "100vh", border: 0 }}
      />
    </div>
  );
};

export default Plg2EssayFrame;
