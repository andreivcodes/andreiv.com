import { CONTACT_INFO, PERSONAL_INFO } from "@/lib/personalInfo";

const SITE_URL = "https://andreiv.com";

function getAbsoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function getWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: PERSONAL_INFO.name,
    url: SITE_URL,
    description: "Personal website of Andrei Voinea.",
    inLanguage: "en",
  };
}

export function getPersonStructuredData({
  pathname = "/",
  description,
}: {
  pathname?: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSONAL_INFO.name,
    url: getAbsoluteUrl(pathname),
    image: getAbsoluteUrl(PERSONAL_INFO.profileImage),
    jobTitle: PERSONAL_INFO.title,
    description: description ?? PERSONAL_INFO.summary,
    email: `mailto:${CONTACT_INFO.email}`,
    sameAs: [CONTACT_INFO.github, CONTACT_INFO.twitter, CONTACT_INFO.linkedin],
    homeLocation: {
      "@type": "Place",
      name: PERSONAL_INFO.location,
    },
  };
}

export function getBlogPostStructuredData({
  title,
  description,
  pathname,
  datePublished,
  wordCount,
}: {
  title: string;
  description: string;
  pathname: string;
  datePublished: Date;
  wordCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: getAbsoluteUrl(pathname),
    datePublished: datePublished.toISOString(),
    author: {
      "@type": "Person",
      name: PERSONAL_INFO.name,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: PERSONAL_INFO.name,
      url: SITE_URL,
    },
    image: getAbsoluteUrl(PERSONAL_INFO.profileImage),
    wordCount,
    mainEntityOfPage: getAbsoluteUrl(pathname),
    inLanguage: "en",
  };
}
