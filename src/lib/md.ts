import { marked } from 'marked';

// Copy fields are light Markdown (bold, links, lists). Rendered at build time.
export const md = (s: string) => marked.parse(s, { async: false }) as string;
export const mdInline = (s: string) => marked.parseInline(s, { async: false }) as string;
