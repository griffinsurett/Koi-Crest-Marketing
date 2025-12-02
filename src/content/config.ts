// src/content/config.ts
/**
 * Collection structure:
 *
 * src/content/[collection]/
 *   _meta.mdx         ← Collection config (frontmatter) + index page content (body)
 *                        The _ prefix excludes it from collection entries
 *   item-one.mdx      ← Collection item
 *   item-two.mdx      ← Collection item
 *
 * _meta.mdx frontmatter controls:
 * - title: Display name for the collection
 * - description: Collection description
 * - hasPage: Whether to generate /[collection] index page
 * - itemsHasPage: Whether items get individual pages
 * - featuredImage: Hero image for index page
 * - seo: SEO overrides
 */
import { file } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { baseSchema, MenuSchema, MenuItemFields, refSchema } from "./schema";
import { MenuItemsLoader } from "@/utils/loaders/MenuItemsLoader";

// Define your collections with the base schema - all support MDX
export const collections = {
  // ── menus.json ─────────────────────────────────────────
  menus: defineCollection({
    loader: file("src/content/menus/menus.json"),
    schema: MenuSchema,
  }),

  // ── menu-items.json ─────────────────────────────────────
  "menu-items": defineCollection({
    loader: MenuItemsLoader(),
    schema: MenuItemFields,
  }),

  "contact-us": defineCollection({
    loader: file("src/content/contact-us/contact-us.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        linkPrefix: z.string().optional(),
        label: z.string().optional(),
      }),
  }),

  "social-media": defineCollection({
    loader: file("src/content/social-media/socialmedia.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        link: z.string().optional(),
      }),
  }),

  "blog": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        author: refSchema("authors"),
        tags: z.array(z.string()).default([]),
        readingTime: z.number().optional(),
      }),
  }),
  "authors": defineCollection({
    loader: file("src/content/authors/authors.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        email: z.string().email().optional(),
        social: z
          .object({
            twitter: z.string().url().optional(),
            github: z.string().url().optional(),
            linkedin: z.string().url().optional(),
            website: z.string().url().optional(),
          })
          .optional(),
        role: z.string().optional(),
      }),
  }),
  "services": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        parent: refSchema("services"),
        tags: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((val) => {
            if (!val) return [];
            return Array.isArray(val) ? val : [val];
          }),
      }),
  }),
  "projects": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        projectUrl: z.string().url().optional(),
        technologies: z.array(z.string()).default([]),
        industry: z.string().optional(),
      }),
  }),
  "testimonials": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        role: z.string(),
        company: z.string().optional(),
        rating: z.number().min(1).max(5).default(5),
      }),
  }),
  "faq": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        services: refSchema("services"),
      }),
  }),
  "reasons": defineCollection({
  loader: file("src/content/reasons/reasons.json"),
  schema: ({ image }) =>
    baseSchema({ image }),
}),
"mission-vision": defineCollection({
  loader: file("src/content/mission-vision/mission-vision.json"),
  schema: ({ image }) =>
    baseSchema({ image }),
}),
"values": defineCollection({
  loader: file("src/content/values/values.json"),
  schema: ({ image }) =>
    baseSchema({ image }),
}),
  "benefits": defineCollection({
    loader: file("src/content/benefits/benefits.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        benefit: z.string(),
      }),
  }),
  "legal": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }),
  }),
  "pricing": defineCollection({
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        monthlyPrice: z.string(),
        downPayment: z.string().optional(),
        priceNote: z.string().optional(),
        bestFor: z.string().optional(),
        featured: z.boolean().default(false),
        includes: z.string().optional(),
        features: z.array(
          z.object({
            category: z.string(),
            items: z.array(z.string()),
          })
        ).default([]),
        cta: z.object({
          text: z.string(),
          link: z.string(),
        }).optional(),
      }),
  }),
};
