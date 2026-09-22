import { useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { parseEssayHtml } from "@/lib/parseEssay.mjs";
import type { PageMeta } from "@/lib/site";

interface RevealOptions {
  threshold: number;
  rootMargin: string;
}

interface EssayDocumentProps {
  html: string;
  meta: PageMeta;
  back?: { href: string; label: string };
  reveal?: RevealOptions;
}

const EssayDocument = ({ html, meta, back, reveal }: EssayDocumentProps) => {
  const parsed = useMemo(() => parseEssayHtml(html), [html]);
  const mainRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    document.querySelectorAll("[data-prerender]").forEach((node) => node.remove());
  }, []);

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      {
        threshold: reveal?.threshold ?? 0.08,
        rootMargin: reveal?.rootMargin ?? "0px 0px -40px 0px",
      },
    );
    root.querySelectorAll(".r").forEach((element) => io.observe(element));

    const progress = root.querySelector<HTMLElement>("#progress");
    const nav = root.querySelector("#nav");
    const label = root.querySelector("#chapterLabel, #navTag");
    const chapters = root.querySelectorAll<HTMLElement>("[data-chapter], [data-ch]");

    const onScroll = () => {
      if (progress) {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${height > 0 ? (window.scrollY / height) * 100 : 0}%`;
      }
      nav?.classList.toggle("scrolled", window.scrollY > 60);
      if (label) {
        chapters.forEach((chapter) => {
          if (chapter.getBoundingClientRect().top < 100) {
            const next = chapter.dataset.chapter || chapter.dataset.ch;
            if (next) label.textContent = next;
          }
        });
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [parsed.bodyHtml, reveal?.rootMargin, reveal?.threshold]);

  return (
    <div className="essay-page">
      <Seo title={meta.title} description={meta.description} path={meta.path} type={meta.type} />
      {back ? (
        <Link className="essay-back" to={back.href}>
          {back.label}
        </Link>
      ) : null}
      <noscript>
        <style>{".r{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      {parsed.links.map((link) => (
        <link key={`${link.rel}:${link.href}`} rel={link.rel} href={link.href} />
      ))}
      <style>{parsed.css}</style>
      <main ref={mainRef} dangerouslySetInnerHTML={{ __html: parsed.bodyHtml }} />
    </div>
  );
};

export default EssayDocument;
