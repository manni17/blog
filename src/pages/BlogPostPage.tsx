import { Link, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import SiteChrome from "@/components/SiteChrome";
import { formatPostDate, getBlogPostBySlug } from "@/lib/blog";
import CompleteStoryFrame from "@/pages/CompleteStoryFrame";
import MicroservicesRubbleFrame from "@/pages/MicroservicesRubbleFrame";
import NotFound from "@/pages/NotFound";
import Plg2EssayFrame from "@/pages/Plg2EssayFrame";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  if (slug === "microservices-to-fat-controllers-agentic-pivot") {
    return <MicroservicesRubbleFrame />;
  }

  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <NotFound />;
  }

  if (post.customLayout === "plg2-essay") {
    return <Plg2EssayFrame />;
  }

  if (post.customLayout === "complete-story") {
    return <CompleteStoryFrame />;
  }

  return (
    <SiteChrome>
      <Seo title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} type="article" />
      <Link to="/blog" style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
        ← Back to blog
      </Link>
      <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, margin: "1rem 0 0.5rem" }}>
        {post.title}
      </h1>
      <p className="post-meta">
        {formatPostDate(post.date)} · {post.readingTimeMinutes} min read
      </p>
      <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
    </SiteChrome>
  );
};

export default BlogPostPage;
