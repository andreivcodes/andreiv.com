---
name: this website
shortDescription: A never ending project.
date: Mar 2024
featuredImage: "/projects/personal-website/featured.png"
stackPrimary: ["astro", "react", "typescript"]
stackSecondary: ["tailwind v4", "shadcn/ui", "framer-motion", "mermaid", "katex", "proxmox", "dokploy"]
url: https://andreiv.com
repository: https://github.com/andreivcodes/andreiv.com
index: 40
---

Every developer eventually builds their own website. It starts simple - just a place to put your name and maybe list some projects. But then it grows into something more personal, something that actually represents how you work and think.

Mine started the same way. I needed somewhere to point people when they asked about my work. A living resume that I could update without sending new PDFs around.

## The Evolution

First, it was contact static pages. Then I started writing things down - technical notes, things I learned, stuff I knew I'd forget. Not really blog posts, more like a public notebook for future me to reference.

When I started getting invited to give talks, I faced the eternal presenter's dilemma: PowerPoint on a USB stick? Google Slides and pray for wifi? Instead, I built a presentation system right into the site. Now I write my slides in markdown, with full support for code blocks, diagrams, and math. I can present from any browser, and the slides live at URLs I can share afterwards.

The whole thing runs on a server under my desk. It's a Proxmox VM with Dokploy handling deployments. There's something satisfying about self-hosting - my website literally lives in my home. When someone visits, packets flow from the server three feet away from where I'm sitting.

## Technical Choices

I chose Astro because...well, it's a great choice for a personal website blogish kind of thing. The site builds to static files for speed, but I can drop in React components where I need them.

The content lives in markdown files with frontmatter. No CMS, no database for content - just files I can edit in my editor. When I want to publish something, I commit and push. Built it CMS with git. Dokploy handles the rest.

## Never Finished

This website is never done. There's always something to tweak, some new experiment to try, some component to rewrite.
