import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    short: z.string(),
    date: z.coerce.date(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    shortDescription: z.string(),
    date: z.string(),
    featuredImage: z.string().optional(),
    stackPrimary: z.array(z.string()).optional(),
    stackSecondary: z.array(z.string()).optional(),
    url: z.string().url().optional(),
    repository: z.string().url().optional(),
    index: z.number().optional(),
  }),
});

const professional = defineCollection({
  type: "content",
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
  type: "content",
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
  type: "content",
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
