export interface EssayLink {
  rel: string;
  href: string;
}

export interface ParsedEssay {
  css: string;
  links: EssayLink[];
  bodyHtml: string;
}

export function parseEssayHtml(html: string): ParsedEssay;
