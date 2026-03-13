import { getCollection } from "astro:content";

// 238 WPM matches Brysbaert's 2019 meta-analysis for English non-fiction;
// 12 seconds per visual follows Medium's published image adjustment guidance.
const BLOG_READING_WORDS_PER_MINUTE = 238;
const BLOG_VISUAL_SECONDS = 12;

function getPlainTextFromMarkdown(markdown: string) {
  return markdown
    .replace(/^(import|export)\s.+$/gm, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countVisuals(markdown: string) {
  const markdownImages = markdown.match(/!\[[^\]]*\]\([^)]+\)/g)?.length ?? 0;
  const htmlImages = markdown.match(/<img\b[^>]*>/gi)?.length ?? 0;
  const conversationFigures = markdown.match(/<ConversationFigure\b/g)?.length ?? 0;
  const harnessRuntimeFigures = markdown.match(/<HarnessRuntimeFigure\b/g)?.length ?? 0;
  const machineHarnessFigures = markdown.match(/<MachineHarnessFigure\b/g)?.length ?? 0;

  return (
    markdownImages +
    htmlImages +
    conversationFigures +
    harnessRuntimeFigures +
    machineHarnessFigures
  );
}

export function getBlogReadingStats(markdown: string) {
  const plainText = getPlainTextFromMarkdown(markdown);
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const visualCount = countVisuals(markdown);
  const readingTimeMinutes = Math.max(
    1,
    Math.ceil(wordCount / BLOG_READING_WORDS_PER_MINUTE + (visualCount * BLOG_VISUAL_SECONDS) / 60)
  );

  return {
    plainText,
    wordCount,
    visualCount,
    readingTimeMinutes,
  };
}

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.map((project) => ({
    slug: project.id,
    ...project.data,
    content: project.body,
  }));
}

export async function getProfessional() {
  const professional = await getCollection("professional");
  return professional.map((exp) => ({
    slug: exp.id,
    ...exp.data,
    content: exp.body,
  }));
}

export async function getEducation() {
  const education = await getCollection("education");
  return education.map((edu) => ({
    slug: edu.id,
    ...edu.data,
    content: edu.body,
  }));
}

export async function getBlogPosts() {
  const posts = await getCollection("blog");
  return posts.map((post) => {
    const stats = getBlogReadingStats(post.body);
    return {
      ...stats,
      slug: post.id,
      ...post.data,
      preview: stats.plainText.slice(0, 200).trim() + (stats.plainText.length > 200 ? "..." : ""),
    };
  });
}

export async function getPresentations() {
  const presentations = await getCollection("slides");
  return presentations.map((pres) => ({
    slug: pres.id,
    ...pres.data,
  }));
}
