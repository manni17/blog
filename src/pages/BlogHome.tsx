import { Link } from "react-router-dom";
import SiteChrome from "@/components/SiteChrome";
import { getAllBlogPosts } from "@/lib/blog";

const BlogHome = () => {
  const posts = getAllBlogPosts();

  return (
    <SiteChrome>
      <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>
        Steller
      </p>
      <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, margin: "0.25rem 0 0.5rem" }}>
        Essays &amp; field notes
      </h1>
      <p className="post-excerpt" style={{ maxWidth: "36rem", marginBottom: "2rem" }}>
        Architecture, product-led onboarding, and building Steller with agents.
      </p>

      <div className="post-list">
        {posts.map((post) => (
          <article key={post.slug}>
            <div>
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0.75rem 0 0" }}>
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="post-meta">
              {new Date(post.date).toLocaleDateString()} · {post.readingTimeMinutes} min read
            </p>
            <p className="post-excerpt">{post.excerpt}</p>
            <Link to={`/blog/${post.slug}`}>Read post →</Link>
          </article>
        ))}
      </div>
    </SiteChrome>
  );
};

export default BlogHome;
