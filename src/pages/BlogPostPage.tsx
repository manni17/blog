import { Link, useParams } from "react-router-dom";
import EssayDocument from "@/components/EssayDocument";
import Seo from "@/components/Seo";
import SiteChrome from "@/components/SiteChrome";
import { formatPostDate, getBlogPostBySlug } from "@/lib/blog";
import { pages } from "@/lib/site";
import CompleteStoryFrame from "@/pages/CompleteStoryFrame";
import { getOperatingEssayHtml } from "@/pages/essays/registry";
import MicroservicesRubbleFrame from "@/pages/MicroservicesRubbleFrame";
import NotFound from "@/pages/NotFound";
import Plg2EssayFrame from "@/pages/Plg2EssayFrame";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  if (slug === "microservices-to-fat-controllers-agentic-pivot") {
    return <MicroservicesRubbleFrame />;
  }

  const operatingHtml = slug ? getOperatingEssayHtml(slug) : undefined;
  if (slug && operatingHtml) {
    const page = pages.find((entry) => entry.path === `/blog/${slug}`);
    if (!page) return <NotFound />;
    return (
      <EssayDocument
        html={operatingHtml}
        meta={page}
        back={page.backHref ? { href: page.backHref, label: page.backLabel || "← Blog" } : undefined}
      />
    );
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
