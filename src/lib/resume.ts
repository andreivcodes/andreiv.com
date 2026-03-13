import { marked } from "marked";
import { getEducation, getProfessional } from "@/lib/content";

export interface ResumeProfessionalEntry {
  slug: string;
  companyName?: string;
  companyAbout?: string | null;
  role?: string;
  startDate: string;
  endDate?: string;
  period: string;
  html: string;
}

export interface ResumeEducationEntry {
  slug: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
  period: string;
  html: string;
}

function formatProfessionalPeriod(startDate: string, endDate?: string) {
  return `${startDate} - ${endDate || "Present"}`;
}

function formatEducationPeriod(startDate: string, endDate?: string) {
  return startDate === endDate || !endDate ? startDate : `${startDate} - ${endDate}`;
}

function getYear(date: string) {
  const match = date.match(/\d{4}/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

export async function renderMarkdownToHtml(markdown: string) {
  return await marked.parse(markdown || "");
}

export async function getResumeEntries() {
  const [professional, education] = await Promise.all([getProfessional(), getEducation()]);

  const professionalEntries = await Promise.all(
    [...professional]
      .sort((a, b) => (a.index || 999) - (b.index || 999))
      .map(async (entry) => ({
        slug: entry.slug,
        companyName: entry.companyName,
        companyAbout: entry.companyAbout,
        role: entry.role,
        startDate: entry.startDate,
        endDate: entry.endDate,
        period: formatProfessionalPeriod(entry.startDate, entry.endDate),
        html: await renderMarkdownToHtml(entry.content || ""),
      }))
  );

  const educationEntries = await Promise.all(
    [...education]
      .sort((a, b) => getYear(b.startDate) - getYear(a.startDate))
      .map(async (entry) => ({
        slug: entry.slug,
        institution: entry.institution,
        degree: entry.degree,
        field: entry.field,
        startDate: entry.startDate,
        endDate: entry.endDate,
        description: entry.description,
        period: formatEducationPeriod(entry.startDate, entry.endDate),
        html: await renderMarkdownToHtml(entry.content || ""),
      }))
  );

  return {
    professional: professionalEntries,
    education: educationEntries,
  };
}
