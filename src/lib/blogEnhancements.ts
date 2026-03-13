export function initBlogCodeEnhancements(rootSelector = ".blog-post-content") {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) {
    return;
  }

  const codeBlocks = root.querySelectorAll<HTMLElement>("pre code");

  codeBlocks.forEach((block) => {
    const pre = block.parentElement;
    if (!pre || pre.parentElement?.classList.contains("blog-code-wrapper")) {
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
      "absolute top-2 right-2 rounded p-1.5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-muted/50 hover:text-foreground";
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
