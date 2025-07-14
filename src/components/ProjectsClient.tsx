import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { LinkIcon } from "lucide-react";

interface Project {
  slug: string;
  type: "Project";
  name: string;
  shortDescription: string;
  date: string;
  stackPrimary?: string[];
  stackSecondary?: string[];
  url?: string;
  demoUrl?: string;
  repository?: string;
  index?: number;
  inAbout?: boolean;
  aboutTopPadding?: number;
  content: string;
}

interface ProjectsClientProps {
  projects: Project[];
  withTitle: boolean;
}

export const ProjectsClient = ({ projects, withTitle }: ProjectsClientProps) => {
  return (
    <div className="flex flex-col gap-8">
      {withTitle && (
        <div className="text-2xl font-bold mb-4 text-center md:text-left">
          Projects
        </div>
      )}
      <div>
        {projects
          .filter((p) => p.inAbout)
          .sort((a, b) => (a.index || 0) - (b.index || 0))
          .map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
      </div>
    </div>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div
      className="w-full flex flex-col items-end gap-2"
      style={{ paddingTop: `${(project.aboutTopPadding || 0) * 0.25}rem` }}
    >
      <div className="text-sm">{project.date}</div>
      <Separator className="-mr-2 md:-mr-8 w-32" />
      <Card className="w-full shadow-none md:shadow-sm border-0 md:border">
        <CardHeader className="w-full p-2 md:p-6">
          <CardTitle>
            <a href={`/projects/${project.slug}`}>{project.name}</a>
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm">
          {project.shortDescription}
        </CardContent>

        <CardFooter className="w-full flex flex-col md:flex-row justify-between p-2 md:p-6">
          <div className="flex flex-wrap gap-2">
            {project.stackPrimary &&
              project.stackPrimary.map((stack) => (
                <Badge className="pointer-events-none" key={stack}>
                  {stack}
                </Badge>
              ))}
            {project.stackSecondary &&
              project.stackSecondary.map((stack) => (
                <Badge
                  className="pointer-events-none"
                  variant="secondary"
                  key={stack}
                >
                  {stack}
                </Badge>
              ))}
          </div>
          {project.url || project.demoUrl || project.repository ? (
            <a
              href={project.url || project.demoUrl || project.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-row gap-2 items-center fill-stone-400 text-stone-400"
            >
              <LinkIcon className="w-4 h-4" />
              {project.url || (project.demoUrl ? `Demo: ${project.demoUrl}` : 'Source Code')}
            </a>
          ) : (
            <div></div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};