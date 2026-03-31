import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface SiteChromeProps {
  children: ReactNode;
}

const SiteChrome = ({ children }: SiteChromeProps) => (
  <div className="layout">
    <header className="site-header">
      <Link to="/blog" className="site-brand">
        Steller Blog
      </Link>
      <nav className="site-nav">
        <Link to="/blog">All posts</Link>
        <a href="https://developers.steler.org">Developers</a>
      </nav>
    </header>
    <main className="site-main">{children}</main>
    <footer className="site-footer">
      <a href="https://github.com/manni17/blog">Source on GitHub</a>
      {" · "}
      <a href="https://developers.steler.org">developers.steler.org</a>
    </footer>
  </div>
);

export default SiteChrome;
