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

const color = z.enum(['blue', 'orange', 'yellow']);
const link = z.object({ label: z.string(), href: z.string() });

const home = defineCollection({
  loader: glob({ pattern: 'home.yaml', base: './src/content/pages' }),
  schema: ({ image }) => {
    const tile = z.object({ name: z.string(), line: z.string(), image: image().optional(), href: z.string().optional() });
    return z.object({
      title: z.string(),
      description: z.string(),
      hero: z.object({ title: z.string(), lead: z.string(), doors: z.array(z.object({ n: z.string(), href: z.string(), color, title: z.string(), text: z.string() })) }),
      areas: z.array(z.object({
        id: z.string(), n: z.string(), color, title: z.string(), lead: z.string(),
        facts: z.array(z.string()), papersLink: link.optional(),
        offers: z.array(z.object({ title: z.string(), body: z.string(), link: link.optional() })),
        cta: link.optional(), secondary: link.optional(),
        workTitle: z.string(), work: z.array(tile), more: z.array(tile),
      })),
      principles: z.object({ title: z.string(), lead: z.string(), items: z.array(z.object({ color, title: z.string(), text: z.string() })) }),
      contact: z.object({ title: z.string(), body: z.string(), button: z.string() }),
    });
  },
});

const cta = z.object({ title: z.string(), body: z.string(), button: z.string() });
const paper = z.object({ venue: z.string(), title: z.string(), authors: z.string(), summary: z.string().optional(), doi: z.string().optional() });
const titled = <T extends z.ZodTypeAny>(item: T) => z.object({ title: z.string(), lead: z.string().optional(), items: z.array(item) });

const connectci = defineCollection({
  loader: glob({ pattern: 'connect-ci.yaml', base: './src/content/pages' }),
  schema: ({ image }) => z.object({
    title: z.string(), description: z.string(),
    hero: z.object({ eyebrow: z.string(), title: z.string(), body: z.string(), primary: link, secondary: link }),
    stats: z.array(z.object({ n: z.string(), label: z.string() })),
    communities: z.object({ title: z.string(), lead: z.string(), link, items: z.array(z.object({ name: z.string(), logo: image().optional(), text: z.string() })) }),
    features: titled(z.object({ icon: z.string(), title: z.string(), text: z.string() })),
    help: titled(z.object({ title: z.string(), text: z.string() })),
    budget: z.object({ title: z.string(), lead: z.string(), steps: z.array(z.object({ n: z.string(), title: z.string(), text: z.string() })) }),
    owners: z.object({ title: z.string(), body: z.string() }),
    membership: z.object({ title: z.string(), lead: z.string(), tiers: z.array(z.object({ name: z.string(), who: z.string(), price: z.string(), per: z.string(), items: z.array(z.string()), cta: link })) }),
    faq: titled(z.object({ q: z.string(), a: z.string() })),
    papers: titled(paper),
    supporters: z.string(),
    cta,
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: 'publications.yaml', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(), description: z.string(),
    hero: z.object({ eyebrow: z.string(), title: z.string(), body: z.string() }),
    stats: z.array(z.object({ n: z.string(), label: z.string() })),
    note: z.string(),
    groups: z.array(z.object({ title: z.string(), color, blurb: z.string(), link, papers: z.array(paper) })),
    more: z.string(),
    cta,
  }),
});

export const collections = { work, home, connectci, publications };
