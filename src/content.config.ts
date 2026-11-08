import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const figure = (image: any) => z.object({
  caption: z.string().default(''),
  image: z.object({ src: image(), alt: z.string() }).optional(),
  placeholder: z.string().optional(),
});

const work = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/work' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    title: z.string(),
    description: z.string().default(''),
    order: z.number(),
    phase: z.union([z.literal(1), z.literal(2)]),
    card: z.object({ line: z.string(), image: z.object({ src: image(), alt: z.string() }).optional() }).optional(),
    link: z.object({ href: z.string().url(), label: z.string() }).optional(),
    heroImage: z.object({ src: image(), alt: z.string() }).optional(),
    did: z.array(z.string()),
    facts: z.array(z.object({ k: z.string(), v: z.string() })),
    goal: z.object({ icon: z.string().optional(), title: z.string(), body: z.string(), pull: z.string().optional() }),
    chapters: z.array(z.object({
      level: z.union([z.literal(2), z.literal(3)]),
      icon: z.string().optional(),
      title: z.string(),
      body: z.string(),
      figures: z.array(figure(image)).default([]),
    })),
    quote: z.object({ text: z.string(), name: z.string(), role: z.string() }).optional(),
    today: z.object({ icon: z.string().optional(), title: z.string(), body: z.string(), figures: z.array(figure(image)).default([]) }),
    results: z.array(z.object({ n: z.string(), label: z.string() })),
    paper: z.object({ kicker: z.string(), title: z.string(), authors: z.string(), doi: z.string().optional() }).optional(),
    links: z.object({ title: z.string(), items: z.array(z.object({ href: z.string().url(), label: z.string(), note: z.string() })) }).optional(),
    prev: z.object({ href: z.string(), label: z.string() }).optional(),
    next: z.object({ href: z.string(), label: z.string() }).optional(),
    cta: z.object({ title: z.string(), body: z.string(), button: z.string(), href: z.string().default('/contact/?audience=program') }),
  }),
});

export const collections = { work };
