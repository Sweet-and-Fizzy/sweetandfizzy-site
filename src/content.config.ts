import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Strict objects: a misspelled YAML key fails the build instead of silently dropping copy.
const obj = <T extends z.ZodRawShape>(shape: T) => z.object(shape).strict();

const figure = (image: any) => obj({
  caption: z.string().default(''),
  wide: z.boolean().optional(),
  process: obj({ steps: z.array(z.string()), loop: z.string().optional() }).optional(),
  image: obj({ src: image(), alt: z.string() }).optional(),
  placeholder: z.string().optional(),
});

const work = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/work' }),
  schema: ({ image }) => obj({
    name: z.string(),
    title: z.string(),
    description: z.string().default(''),
    order: z.number(),
    phase: z.union([z.literal(1), z.literal(2)]),
    card: obj({ line: z.string(), image: obj({ src: image(), alt: z.string() }).optional() }).optional(),
    link: obj({ href: z.string().url(), label: z.string() }).optional(),
    link2: obj({ href: z.string().url(), label: z.string() }).optional(),
    heroImage: obj({ src: image(), alt: z.string() }).optional(),
    did: z.array(z.string()),
    facts: z.array(obj({ k: z.string(), v: z.string() })),
    goal: obj({ icon: z.string().optional(), title: z.string(), body: z.string(), pull: z.string().optional(), figures: z.array(figure(image)).default([]) }),
    chapters: z.array(obj({
      level: z.union([z.literal(2), z.literal(3)]),
      icon: z.string().optional(),
      title: z.string(),
      body: z.string(),
      link: obj({ href: z.string().url(), label: z.string() }).optional(),
      figures: z.array(figure(image)).default([]),
    })),
    quote: obj({ text: z.string(), name: z.string(), role: z.string() }).optional(),
    today: obj({ icon: z.string().optional(), title: z.string(), body: z.string(), figures: z.array(figure(image)).default([]) }),
    results: z.array(obj({ n: z.string(), label: z.string() })),
    paper: obj({ kicker: z.string(), title: z.string(), authors: z.string(), doi: z.string().optional() }).optional(),
    links: obj({ title: z.string(), items: z.array(obj({ href: z.string().url(), label: z.string(), note: z.string() })) }).optional(),
    prev: obj({ href: z.string(), label: z.string() }).optional(),
    next: obj({ href: z.string(), label: z.string() }).optional(),
    cta: obj({ title: z.string(), body: z.string(), button: z.string(), href: z.string().default('/contact/?audience=program') }),
  }),
});

const color = z.enum(['blue', 'orange', 'yellow']);
const link = obj({ label: z.string(), href: z.string() });

const home = defineCollection({
  loader: glob({ pattern: 'home.yaml', base: './src/content/pages' }),
  schema: ({ image }) => {
    const tile = obj({ name: z.string(), line: z.string(), image: image().optional(), href: z.string().optional() });
    return obj({
      title: z.string(),
      description: z.string(),
      hero: obj({ title: z.string(), lead: z.string(), doors: z.array(obj({ n: z.string(), href: z.string(), color, title: z.string(), text: z.string() })) }),
      areas: z.array(obj({
        id: z.string(), n: z.string(), color, title: z.string(), lead: z.string(),
        facts: z.array(z.string()), papersLink: link.optional(),
        offers: z.array(obj({ title: z.string(), body: z.string(), link: link.optional() })),
        cta: link.optional(), secondary: link.optional(),
        workTitle: z.string(), work: z.array(tile), more: z.array(tile),
      })),
      principles: obj({ title: z.string(), lead: z.string(), items: z.array(obj({ color, title: z.string(), text: z.string() })) }),
      contact: obj({ title: z.string(), body: z.string(), button: z.string() }),
    });
  },
});

const cta = obj({ title: z.string(), body: z.string(), button: z.string() });
const paper = obj({ venue: z.string(), title: z.string(), authors: z.string(), summary: z.string().optional(), doi: z.string().optional() });
const titled = <T extends z.ZodTypeAny>(item: T) => obj({ title: z.string(), lead: z.string().optional(), items: z.array(item) });

const connectci = defineCollection({
  loader: glob({ pattern: 'connect-ci.yaml', base: './src/content/pages' }),
  schema: ({ image }) => obj({
    title: z.string(), description: z.string(),
    hero: obj({ eyebrow: z.string(), title: z.string(), body: z.string(), primary: link, secondary: link }),
    stats: z.array(obj({ n: z.string(), label: z.string() })),
    communities: obj({ title: z.string(), lead: z.string(), link, items: z.array(obj({ name: z.string(), logo: image().optional(), href: z.string().url().optional(), text: z.string() })) }),
    features: titled(obj({ icon: z.string(), title: z.string(), text: z.string() })),
    help: titled(obj({ title: z.string(), text: z.string() })),
    budget: obj({ title: z.string(), lead: z.string(), steps: z.array(obj({ n: z.string(), title: z.string(), text: z.string() })) }),
    owners: obj({ title: z.string(), body: z.string() }),
    membership: obj({ title: z.string(), lead: z.string(), tiers: z.array(obj({ name: z.string(), who: z.string(), price: z.string(), per: z.string(), items: z.array(z.string()), cta: link })) }),
    faq: titled(obj({ q: z.string(), a: z.string() })),
    papers: titled(paper),
    supporters: obj({ title: z.string(), items: z.array(obj({ name: z.string(), logo: z.string().optional(), award: z.string().optional() })) }),
    cta,
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: 'publications.yaml', base: './src/content/pages' }),
  schema: obj({
    title: z.string(), description: z.string(),
    hero: obj({ eyebrow: z.string(), title: z.string(), body: z.string() }),
    stats: z.array(obj({ n: z.string(), label: z.string() })),
    note: z.string(),
    groups: z.array(obj({ title: z.string(), color, blurb: z.string(), link, papers: z.array(paper) })),
    more: z.string(),
    cta,
  }),
});

// crop shows only part of the image in the thumbnail: the left and top edge and the width
// of the region, in percent of the image. The tile's 16:10 shape sets the region's height.
const crop = obj({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), w: z.number().min(10).max(100) });
const flexItem = (image: any) => obj({ title: z.string(), text: z.string(), link: link.optional(), image: obj({ src: image(), alt: z.string(), crop: crop.optional() }).optional() });
const flexSection = (image: any) => z.discriminatedUnion('kind', [
  obj({ kind: z.literal('cards'), id: z.string().optional(), title: z.string(), lead: z.string().optional(), items: z.array(flexItem(image)) }),
  obj({ kind: z.literal('rows'), id: z.string().optional(), title: z.string(), lead: z.string().optional(), items: z.array(flexItem(image)) }),
  obj({ kind: z.literal('list'), id: z.string().optional(), dark: z.boolean().optional(), title: z.string(), lead: z.string().optional(), items: z.array(flexItem(image)) }),
  obj({ kind: z.literal('steps'), id: z.string().optional(), title: z.string(), lead: z.string().optional(), items: z.array(flexItem(image)) }),
  obj({ kind: z.literal('quote'), id: z.string().optional(), title: z.string(), text: z.string() }),
  obj({ kind: z.literal('prose'), id: z.string().optional(), title: z.string(), body: z.string() }),
  obj({ kind: z.literal('paper'), id: z.string().optional(), title: z.string(), paper }),
  obj({ kind: z.literal('logos'), id: z.string().optional(), title: z.string(), body: z.string().optional(),
    items: z.array(obj({ name: z.string(), logo: z.string().optional(), award: z.string().optional(), href: z.string().url().optional() })) }),
]);

const flex = defineCollection({
  loader: glob({ pattern: ['ai-agents.yaml', 'planning-a-proposal.yaml', 'privacy.yaml', 'accessibility.yaml'], base: './src/content/pages' }),
  schema: ({ image }) => obj({
    title: z.string(), description: z.string(), accent: color,
    hero: obj({ eyebrow: z.string(), title: z.string(), body: z.string(), primary: link.optional(), secondary: link.optional(), art: z.enum(['agents']).optional() }),
    sections: z.array(flexSection(image)),
    cta: obj({ title: z.string(), body: z.string(), button: z.string(), href: z.string(), secondary: link.optional() }).optional(),
  }),
});

export const collections = { work, home, connectci, publications, flex };
