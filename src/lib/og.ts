import { getCollection } from "astro:content";
import { PERSONAL_INFO, SKILLS } from "@/lib/personalInfo";
import { STATIC_PAGE_METADATA } from "@/lib/pageMetadata";

export type OgPageKind = "profile" | "writing" | "project" | "slides";
export type OgMediaVariant = "portrait" | "screenshot";

export interface OgPage {
  pathname: string;
  title: string;
  description: string;
  eyebrow: string;
  kind: OgPageKind;
  ogTitle?: string;
  imagePath?: string;
  mediaVariant?: OgMediaVariant;
  tags?: string[];
}

const OG_ROUTE_PREFIX = "/open-graph";
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const PROFILE_TAGS = [...SKILLS.primary];

function trimSlashes(pathname: string) {
  return pathname.replace(/^\/+|\/+$/g, "");
}

function truncateText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function formatDateLabel(value: Date | string | undefined) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return LONG_DATE_FORMATTER.format(value);
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  const parts = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!parts) {
    return normalized || undefined;
  }

  const [, year, month, day] = parts;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return LONG_DATE_FORMATTER.format(date);
}

export function getOgRouteKey(pathname: string) {
  const trimmed = trimSlashes(pathname);
  return trimmed === "" ? "index" : trimmed;
}

export function getOgImagePath(pathname: string) {
  return `${OG_ROUTE_PREFIX}/${getOgRouteKey(pathname)}.png`;
}

export function getOgCardTitle(page: OgPage) {
  if (page.ogTitle) {
    return page.ogTitle;
  }

  return page.title.replace(/\s+-\s+Andrei Voinea$/, "");
}

export async function getOgPages(): Promise<Record<string, OgPage>> {
  const blogPosts = await getCollection("blog", ({ data }) => !data.draft);
  const projects = await getCollection("projects");
  const slides = await getCollection("slides");

  const pages: Record<string, OgPage> = {
    [getOgRouteKey(STATIC_PAGE_METADATA.home.pathname)]: {
      pathname: STATIC_PAGE_METADATA.home.pathname,
      title: STATIC_PAGE_METADATA.home.title,
      description: STATIC_PAGE_METADATA.home.ogDescription ?? STATIC_PAGE_METADATA.home.description,
      eyebrow: STATIC_PAGE_METADATA.home.ogEyebrow,
      kind: "profile",
      ogTitle: STATIC_PAGE_METADATA.home.ogTitle,
      imagePath: PERSONAL_INFO.profileImage,
      mediaVariant: "portrait",
      tags: PROFILE_TAGS,
    },
    [getOgRouteKey(STATIC_PAGE_METADATA.about.pathname)]: {
      pathname: STATIC_PAGE_METADATA.about.pathname,
      title: STATIC_PAGE_METADATA.about.title,
      description: STATIC_PAGE_METADATA.about.description,
      eyebrow: STATIC_PAGE_METADATA.about.ogEyebrow,
      kind: "profile",
      ogTitle: STATIC_PAGE_METADATA.about.ogTitle,
      imagePath: PERSONAL_INFO.profileImage,
      mediaVariant: "portrait",
      tags: PROFILE_TAGS,
    },
    [getOgRouteKey(STATIC_PAGE_METADATA.resume.pathname)]: {
      pathname: STATIC_PAGE_METADATA.resume.pathname,
      title: STATIC_PAGE_METADATA.resume.title,
      description:
        STATIC_PAGE_METADATA.resume.ogDescription ?? STATIC_PAGE_METADATA.resume.description,
      eyebrow: STATIC_PAGE_METADATA.resume.ogEyebrow,
      kind: "profile",
      ogTitle: STATIC_PAGE_METADATA.resume.ogTitle,
      imagePath: PERSONAL_INFO.profileImage,
      mediaVariant: "portrait",
      tags: PROFILE_TAGS,
    },
    [getOgRouteKey(STATIC_PAGE_METADATA.blog.pathname)]: {
      pathname: STATIC_PAGE_METADATA.blog.pathname,
      title: STATIC_PAGE_METADATA.blog.title,
      description: STATIC_PAGE_METADATA.blog.description,
      eyebrow: STATIC_PAGE_METADATA.blog.ogEyebrow,
      kind: "writing",
      ogTitle: STATIC_PAGE_METADATA.blog.ogTitle,
    },
    [getOgRouteKey(STATIC_PAGE_METADATA.projects.pathname)]: {
      pathname: STATIC_PAGE_METADATA.projects.pathname,
      title: STATIC_PAGE_METADATA.projects.title,
      description: STATIC_PAGE_METADATA.projects.description,
      eyebrow: STATIC_PAGE_METADATA.projects.ogEyebrow,
      kind: "project",
      ogTitle: STATIC_PAGE_METADATA.projects.ogTitle,
    },
    [getOgRouteKey(STATIC_PAGE_METADATA.slides.pathname)]: {
      pathname: STATIC_PAGE_METADATA.slides.pathname,
      title: STATIC_PAGE_METADATA.slides.title,
      description: STATIC_PAGE_METADATA.slides.description,
      eyebrow: STATIC_PAGE_METADATA.slides.ogEyebrow,
      kind: "slides",
      ogTitle: STATIC_PAGE_METADATA.slides.ogTitle,
    },
  };

  for (const post of blogPosts) {
    const pathname = `/blog/${post.id}`;
    pages[getOgRouteKey(pathname)] = {
      pathname,
      title: post.data.title,
      description: truncateText(post.data.short, 136),
      eyebrow: ["Blog Post", formatDateLabel(post.data.date)].filter(Boolean).join(" · "),
      kind: "writing",
    };
  }

  for (const project of projects) {
    const pathname = `/projects/${project.id}`;
    pages[getOgRouteKey(pathname)] = {
      pathname,
      title: project.data.name,
      description: truncateText(project.data.shortDescription, 136),
      eyebrow: ["Project", project.data.date].filter(Boolean).join(" · "),
      kind: "project",
      imagePath: project.data.featuredImage,
      mediaVariant: project.data.featuredImage ? "screenshot" : undefined,
      tags: [...(project.data.stackPrimary ?? []), ...(project.data.stackSecondary ?? [])].slice(
        0,
        4
      ),
    };
  }

  for (const slide of slides) {
    const pathname = `/slides/${slide.id}`;
    pages[getOgRouteKey(pathname)] = {
      pathname,
      title: slide.data.title,
      description: truncateText(
        slide.data.description || `Presentation deck for ${slide.data.title}.`,
        136
      ),
      eyebrow: ["Slides", formatDateLabel(slide.data.date)].filter(Boolean).join(" · "),
      kind: "slides",
    };
  }

  return pages;
}
