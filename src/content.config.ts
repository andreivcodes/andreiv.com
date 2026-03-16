import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    short: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    name: z.string(),
    shortDescription: z.string(),
    date: z.string(),
    featuredImage: z.string().optional(),
    stackPrimary: z.array(z.string()).optional(),
    stackSecondary: z.array(z.string()).optional(),
    url: z.url().optional(),
    repository: z.url().optional(),
    index: z.number().optional(),
  }),
});

const professional = defineCollection({
  loader: glob({ base: "./src/content/professional", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    companyName: z.string().optional(),
    companyAbout: z.string().optional().nullable(),
    role: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    index: z.number(),
  }),
});

const education = defineCollection({
  loader: glob({ base: "./src/content/education", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string().optional(),
    index: z.number(),
  }),
});

const slides = defineCollection({
  loader: glob({ base: "./src/content/slides", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = {
  blog,
  projects,
  professional,
  education,
  slides,
};
