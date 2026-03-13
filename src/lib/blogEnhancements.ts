export function initBlogCodeEnhancements(rootSelector = ".blog-post-content") {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) {
    return;
  }

  const codeBlocks = root.querySelectorAll<HTMLElement>("pre code");

  codeBlocks.forEach((block) => {
    const pre = block.parentElement;
    if (
      !pre ||
      pre.parentElement?.classList.contains("blog-code-wrapper") ||
      pre.hasAttribute("data-no-copy") ||
      pre.closest("[data-no-copy]")
    ) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "blog-code-wrapper relative group";
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
    `;
    copyButton.className =
      "text-muted-foreground absolute top-2 right-2 rounded-md border border-border/70 bg-background/80 p-1.5 opacity-100 shadow-sm backdrop-blur-sm transition-[color,border-color,background-color,opacity] duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 hover:border-primary/35 hover:bg-muted/40 hover:text-foreground focus-visible:border-primary/35 focus-visible:bg-muted/40 focus-visible:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
    copyButton.setAttribute("aria-label", "Copy code");

    copyButton.addEventListener("click", async () => {
      const code = block.textContent || "";
      await navigator.clipboard.writeText(code);

      copyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      `;

      window.setTimeout(() => {
        copyButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        `;
      }, 2000);
    });

    wrapper.appendChild(copyButton);
  });
}
