import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import satori from "satori";
import { getOgCardTitle, type OgPage, type OgPageKind } from "@/lib/og";

const OG_SIZE = {
  width: 1200,
  height: 630,
};

const LAYOUT = {
  navHeight: 54,
  outerPaddingX: 46,
  outerPaddingY: 36,
  columnGap: 38,
  leftColumnWidth: 585,
  rightPanelWidth: 485,
  rightPanelHeight: 466,
};

const COLORS = {
  background: "#050505",
  surface: "#0b0b0c",
  surfaceMuted: "#121214",
  border: "#19191c",
  text: "#f5f5f5",
  textMuted: "#a1a1aa",
  textSoft: "#71717a",
};

const ACCENTS: Record<
  OgPageKind,
  {
    color: string;
    nav: "about" | "blog" | "projects" | "talks";
  }
> = {
  profile: {
    color: "#22c55e",
    nav: "about",
  },
  writing: {
    color: "#14b8a6",
    nav: "blog",
  },
  project: {
    color: "#f59e0b",
    nav: "projects",
  },
  slides: {
    color: "#60a5fa",
    nav: "talks",
  },
};

const fontDataPromise = Promise.all([
  readFile(path.join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf")),
  readFile(path.join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf")),
  readFile(
    path.join(process.cwd(), "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf")
  ),
  readFile(
    path.join(process.cwd(), "node_modules/geist/dist/fonts/geist-mono/GeistMono-Medium.ttf")
  ),
]);
const mediaCache = new Map<string, Promise<string | undefined>>();

function truncateTitle(title: string) {
  const normalized = title.replace(/\s+/g, " ").trim();
  if (normalized.length <= 90) {
    return normalized;
  }

  return `${normalized.slice(0, 89).trimEnd()}…`;
}

function getTitleSize(title: string) {
  if (title.length > 72) {
    return 58;
  }

  if (title.length > 54) {
    return 64;
  }

  if (title.length > 38) {
    return 72;
  }

  return 80;
}

function getFooterPath() {
  return "andreiv.com";
}

function getImagePath(imagePath: string) {
  return path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
}

function toDataUrl(buffer: Buffer, mimeType = "image/png") {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function getPanelImage(page: OgPage) {
  if (!page.imagePath || !page.mediaVariant) {
    return undefined;
  }

  const cacheKey = `${page.mediaVariant}:${page.imagePath}`;
  const cached = mediaCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const loader = (async () => {
    const source = sharp(getImagePath(page.imagePath));

    if (page.mediaVariant === "portrait") {
      const portrait = await source
        .resize(300, 300, {
          fit: "cover",
          position: "attention",
        })
        .png()
        .toBuffer();

      return toDataUrl(portrait);
    }

    const screenshot = await source
      .resize(410, 260, {
        fit: "contain",
        background: {
          r: 11,
          g: 11,
          b: 12,
          alpha: 1,
        },
      })
      .png()
      .toBuffer();

    return toDataUrl(screenshot);
  })().catch(() => undefined);

  mediaCache.set(cacheKey, loader);
  return loader;
}

async function getFonts() {
  const [geistRegular, geistBold, geistMonoRegular, geistMonoMedium] = await fontDataPromise;

  return [
    {
      name: "Geist",
      data: geistRegular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: geistBold,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Geist Mono",
      data: geistMonoRegular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist Mono",
      data: geistMonoMedium,
      weight: 500 as const,
      style: "normal" as const,
    },
  ];
}

function Nav({ active }: { active?: (typeof ACCENTS)[OgPageKind]["nav"] }) {
  const items = ["about", "blog", "projects", "talks"] as const;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: "Geist Mono",
        fontSize: 20,
        color: COLORS.textMuted,
      }}
    >
      {items.map((item) => (
        <div
          key={item}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            textTransform: "lowercase",
          }}
        >
          <span style={{ color: item === active ? COLORS.text : COLORS.textMuted }}>{item}</span>
          <span
            style={{
              width: 42,
              height: 2,
              backgroundColor: item === active ? COLORS.text : "transparent",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 999,
        padding: "6px 12px",
        fontFamily: "Geist Mono",
        fontSize: 14,
        color: COLORS.textMuted,
        textTransform: "lowercase",
      }}
    >
      {label}
    </div>
  );
}

function PortraitPanel({ page, imageDataUrl }: { page: OgPage; imageDataUrl: string }) {
  return (
    <div
      style={{
        width: LAYOUT.rightPanelWidth,
        height: LAYOUT.rightPanelHeight,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 30,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          fontFamily: "Geist Mono",
          fontSize: 16,
          color: COLORS.textMuted,
        }}
      >
        <span>{page.pathname}</span>
        <span>profile</span>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 24,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.background,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 300,
            height: 300,
            borderRadius: 999,
            overflow: "hidden",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <img
            src={imageDataUrl}
            width="300"
            height="300"
            style={{
              width: 300,
              height: 300,
            }}
          />
        </div>
      </div>

      {page.tags?.length ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 22,
          }}
        >
          {page.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ScreenshotPanel({
  accent,
  imageDataUrl,
  page,
}: {
  accent: string;
  imageDataUrl: string;
  page: OgPage;
}) {
  return (
    <div
      style={{
        width: LAYOUT.rightPanelWidth,
        height: LAYOUT.rightPanelHeight,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 30,
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          fontFamily: "Geist Mono",
          fontSize: 16,
          color: COLORS.textMuted,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: accent }} />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: COLORS.border,
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: COLORS.border,
            }}
          />
        </div>
        <span>{page.pathname}</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: 300,
          borderRadius: 24,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.background,
          overflow: "hidden",
        }}
      >
        <img
          src={imageDataUrl}
          width="410"
          height="260"
          style={{
            width: 410,
            height: 260,
          }}
        />
      </div>

      {page.tags?.length ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 18,
          }}
        >
          {page.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PlaceholderPanel({ accent, page }: { accent: string; page: OgPage }) {
  const lines = [
    { width: 250, color: COLORS.text },
    { width: 390, color: COLORS.textMuted },
    { width: 340, color: COLORS.textMuted },
    { width: 200, color: COLORS.textSoft },
  ];

  return (
    <div
      style={{
        width: LAYOUT.rightPanelWidth,
        height: LAYOUT.rightPanelHeight,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 30,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 26,
          fontFamily: "Geist Mono",
          fontSize: 16,
          color: COLORS.textMuted,
        }}
      >
        <span>{page.pathname}</span>
        <span>preview</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          flex: 1,
          borderRadius: 24,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.background,
          padding: 24,
        }}
      >
        <div
          style={{
            width: 112,
            height: 3,
            backgroundColor: accent,
            marginBottom: 10,
          }}
        />

        {lines.map((line, index) => (
          <div
            key={index}
            style={{
              width: line.width,
              height: index === 0 ? 20 : 12,
              borderRadius: 999,
              backgroundColor: line.color,
              opacity: index === 0 ? 0.9 : 0.35,
            }}
          />
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 18,
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.surfaceMuted,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
            }}
          >
            <div
              style={{
                width: 170,
                height: 12,
                borderRadius: 999,
                backgroundColor: COLORS.textMuted,
                opacity: 0.45,
              }}
            />
            <div
              style={{
                width: 230,
                height: 12,
                borderRadius: 999,
                backgroundColor: COLORS.textSoft,
                opacity: 0.35,
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            fontFamily: "Geist Mono",
            fontSize: 16,
            color: COLORS.textSoft,
          }}
        >
          {getFooterPath()}
        </div>
      </div>
    </div>
  );
}

function RightPanel({
  accent,
  imageDataUrl,
  page,
}: {
  accent: string;
  imageDataUrl?: string;
  page: OgPage;
}) {
  if (page.mediaVariant === "portrait" && imageDataUrl) {
    return <PortraitPanel page={page} imageDataUrl={imageDataUrl} />;
  }

  if (page.mediaVariant === "screenshot" && imageDataUrl) {
    return <ScreenshotPanel accent={accent} imageDataUrl={imageDataUrl} page={page} />;
  }

  return <PlaceholderPanel accent={accent} page={page} />;
}

function OgCard({
  accent,
  activeNav,
  imageDataUrl,
  page,
}: {
  accent: string;
  activeNav?: (typeof ACCENTS)[OgPageKind]["nav"];
  imageDataUrl?: string;
  page: OgPage;
}) {
  const title = truncateTitle(getOgCardTitle(page));
  const titleSize = getTitleSize(title);

  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.background,
        color: COLORS.text,
      }}
    >
      <div
        style={{
          height: LAYOUT.navHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${LAYOUT.outerPaddingX}px`,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Geist Mono",
            fontSize: 20,
            color: COLORS.textMuted,
          }}
        >
          andreiv&apos;s website
        </div>
        <Nav active={activeNav} />
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          gap: LAYOUT.columnGap,
          padding: `${LAYOUT.outerPaddingY}px ${LAYOUT.outerPaddingX}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: LAYOUT.leftColumnWidth,
            maxWidth: LAYOUT.leftColumnWidth,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 28,
                fontFamily: "Geist Mono",
                fontSize: 22,
                color: COLORS.textMuted,
              }}
            >
              <span
                style={{
                  width: 52,
                  height: 2,
                  backgroundColor: accent,
                }}
              />
              <span>{page.eyebrow}</span>
            </div>

            <div
              style={{
                display: "flex",
                fontFamily: "Geist",
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                maxWidth: "100%",
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontFamily: "Geist Mono",
                fontSize: 24,
                lineHeight: 1.45,
                color: COLORS.textMuted,
                maxWidth: "100%",
              }}
            >
              {page.description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${COLORS.border}`,
              paddingTop: 20,
              fontFamily: "Geist Mono",
              fontSize: 18,
              color: COLORS.textSoft,
            }}
          >
            <span>keep building in the open</span>
            <span>{getFooterPath()}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "flex-end",
            width:
              OG_SIZE.width - LAYOUT.outerPaddingX * 2 - LAYOUT.leftColumnWidth - LAYOUT.columnGap,
          }}
        >
          <RightPanel accent={accent} imageDataUrl={imageDataUrl} page={page} />
        </div>
      </div>
    </div>
  );
}

export async function renderOgImage(page: OgPage) {
  const [{ color: accent, nav }, imageDataUrl, fonts] = await Promise.all([
    Promise.resolve(ACCENTS[page.kind]),
    getPanelImage(page),
    getFonts(),
  ]);
  const activeNav = page.pathname === "/" ? undefined : nav;

  const svg = await satori(
    <OgCard accent={accent} activeNav={activeNav} imageDataUrl={imageDataUrl} page={page} />,
    {
      width: OG_SIZE.width,
      height: OG_SIZE.height,
      fonts,
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
