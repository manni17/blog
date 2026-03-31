import { Link, useParams } from "react-router-dom";
import SiteChrome from "@/components/SiteChrome";
import { getBlogPostBySlug } from "@/lib/blog";
import MicroservicesRubbleFrame from "@/pages/MicroservicesRubbleFrame";
import Plg2EssayFrame from "@/pages/Plg2EssayFrame";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  if (slug === "microservices-to-fat-controllers-agentic-pivot") {
    return <MicroservicesRubbleFrame />;
  }

  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <SiteChrome>
        <div className="not-found">
          <h1>Post not found</h1>
          <p style={{ color: "var(--muted)" }}>The post you requested does not exist.</p>
          <p>
            <Link to="/blog">Back to blog</Link>
          </p>
        </div>
      </SiteChrome>
    );
  }

  if (post.customLayout === "plg2-essay") {
    return <Plg2EssayFrame />;
  }

  return (
    <SiteChrome>
      <Link to="/blog" style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
        ← Back to blog
      </Link>
      <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, margin: "1rem 0 0.5rem" }}>
        {post.title}
      </h1>
      <p className="post-meta">
        {new Date(post.date).toLocaleDateString()} · {post.readingTimeMinutes} min read
      </p>
      <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
    </SiteChrome>
  );
};

export default BlogPostPage;
