import { getCollection } from "astro:content";

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.map((project) => ({
    slug: project.slug,
    ...project.data,
    content: project.body,
  }));
}

export async function getProfessional() {
  const professional = await getCollection("professional");
  return professional.map((exp) => ({
    slug: exp.slug,
    ...exp.data,
    content: exp.body,
  }));
}

export async function getEducation() {
  const education = await getCollection("education");
  return education.map((edu) => ({
    slug: edu.slug,
    ...edu.data,
    content: edu.body,
  }));
}

export async function getBlogPosts() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    slug: post.slug,
    ...post.data,
    wordCount: post.body.split(/\s+/).length,
    preview:
      post.body
        .slice(0, 200)
        .replace(/[#*`\[\]]/g, "")
        .trim() + "...",
  }));
}

export async function getPresentations() {
  const presentations = await getCollection("slides");
  return presentations.map((pres) => ({
    slug: pres.slug,
    ...pres.data,
  }));
}
