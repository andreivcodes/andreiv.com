export const STATIC_PAGE_METADATA = {
  home: {
    pathname: "/",
    title: "Andrei Voinea - Software Engineer",
    description: "Personal website of Andrei Voinea, a software engineer from Romania.",
    ogTitle: "Andrei Voinea",
    ogEyebrow: "Software Engineer · Building in public",
    ogDescription: "Web, web3, and systems work from Sibiu, Romania.",
  },
  about: {
    pathname: "/about",
    title: "About - Andrei Voinea",
    description:
      "Learn more about Andrei Voinea, a software engineer passionate about building in the open.",
    ogTitle: "About",
    ogEyebrow: "Profile · Builder and collaborator",
  },
  resume: {
    pathname: "/resume",
    title: "Resume - Andrei Voinea",
    description: "Printable resume for Andrei Voinea.",
    ogTitle: "Resume",
    ogEyebrow: "Experience · Roles, skills, and contact",
    ogDescription: "A concise view of experience across embedded, web, and web3 engineering.",
  },
  blog: {
    pathname: "/blog",
    title: "Blog - Andrei Voinea",
    description:
      "Thoughts and writings from Andrei Voinea on software engineering and building in the open.",
    ogTitle: "Blog",
    ogEyebrow: "Writing · Notes, essays, and rants",
  },
  projects: {
    pathname: "/projects",
    title: "Projects - Andrei Voinea",
    description: "Open source projects and side projects built by Andrei Voinea.",
    ogTitle: "Projects",
    ogEyebrow: "Selected Work · Products and experiments",
  },
  slides: {
    pathname: "/slides",
    title: "Slides - Andrei Voinea",
    description: "Technical presentations and workshops on software engineering topics.",
    ogTitle: "Slides",
    ogEyebrow: "Talks · Workshops and decks",
  },
} as const;

export type StaticPageMetadata = (typeof STATIC_PAGE_METADATA)[keyof typeof STATIC_PAGE_METADATA];
