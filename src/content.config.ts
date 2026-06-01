// src/content.config.ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { GlobLoad, FileLoad } from "@/utils/loaders/loaderUtils";
import { baseSchema, MenuSchema, MenuItemFields, refSchema, imageInputSchema } from "./content/schema";
import { MenuItemsLoader } from "@/utils/loaders/MenuItemsLoader";

export const collections = {
  menus: defineCollection({
    loader: FileLoad("menus", "menus.json"),
    schema: MenuSchema,
  }),

  "menu-items": defineCollection({
    loader: MenuItemsLoader(),
    schema: MenuItemFields,
  }),

  "contact-us": defineCollection({
    loader: FileLoad("contact-us", "contact-us.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        linkPrefix: z.string().optional(),
        label: z.string().optional(),
      }),
  }),

  "social-media": defineCollection({
    loader: FileLoad("social-media", "socialmedia.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        link: z.string().optional(),
      }),
  }),

  "blog": defineCollection({
    loader: GlobLoad("blog"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        author: refSchema("authors"),
        tags: z.array(z.string()).default([]),
        readingTime: z.number().optional(),
      }),
  }),

  "authors": defineCollection({
    loader: FileLoad("authors", "authors.json"),
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
    loader: GlobLoad("services"),
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
    loader: GlobLoad("projects"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        projectUrl: z.string().url().optional(),
        client: z.string().optional(),
        industry: z.string().optional(),
        beforeImage: imageInputSchema({ image }),
        afterImage: imageInputSchema({ image }),
      }),
  }),

  "testimonials": defineCollection({
    loader: GlobLoad("testimonials"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        role: z.string(),
        company: z.string().optional(),
        rating: z.number().min(1).max(5).default(5),
      }),
  }),

  "faq": defineCollection({
    loader: GlobLoad("faq"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        services: refSchema("services"),
      }),
  }),

  "reasons": defineCollection({
    loader: FileLoad("reasons", "reasons.json"),
    schema: ({ image }) =>
      baseSchema({ image }),
  }),

  "mission-vision": defineCollection({
    loader: FileLoad("mission-vision", "mission-vision.json"),
    schema: ({ image }) =>
      baseSchema({ image }),
  }),

  "values": defineCollection({
    loader: FileLoad("values", "values.json"),
    schema: ({ image }) =>
      baseSchema({ image }),
  }),

  "benefits": defineCollection({
    loader: FileLoad("benefits", "benefits.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        benefit: z.string(),
      }),
  }),

  "legal": defineCollection({
    loader: GlobLoad("legal"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        effectiveDate: z
          .union([z.date(), z.string()])
          .optional()
          .transform((val) => {
            if (!val) return undefined;
            if (val instanceof Date) return val;
            return new Date(val);
          }),
      }),
  }),

  "pricing": defineCollection({
    loader: GlobLoad("pricing"),
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

  "industries": defineCollection({
    loader: GlobLoad("industries"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        parent: refSchema("industries"),
        whyGreat: z.string().optional(),
      }),
  }),

  "steps": defineCollection({
    loader: FileLoad("steps", "steps.json"),
    schema: ({ image }) =>
      baseSchema({ image }).extend({
        step: z.number(),
      }),
  }),
};
