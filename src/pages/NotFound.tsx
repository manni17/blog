import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import SiteChrome from "@/components/SiteChrome";

const NotFound = () => (
  <SiteChrome>
    <Seo
      title="Page not found — Muhanad Abdelrahim"
      description="That address is not a page on this site."
      path="/"
      noindex
    />
    <div className="not-found">
      <h1>Page not found</h1>
      <p>That address is not a page on this site.</p>
      <p>
        <Link to="/">Home</Link>
        {" · "}
        <Link to="/blog">Blog</Link>
      </p>
    </div>
  </SiteChrome>
);

export default NotFound;
