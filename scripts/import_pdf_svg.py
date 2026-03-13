from __future__ import annotations

import base64
import hashlib
import html
import mimetypes
import posixpath
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
import xml.etree.ElementTree as ET

import fitz

SVG_NS = "http://www.w3.org/2000/svg"
XLINK_NS = "http://www.w3.org/1999/xlink"
INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape"

PPT_NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}

ET.register_namespace("", SVG_NS)
ET.register_namespace("xlink", XLINK_NS)
ET.register_namespace("inkscape", INKSCAPE_NS)


def ppt_qn(prefix: str, name: str) -> str:
    return f"{{{PPT_NS[prefix]}}}{name}"


def resolve_part(base_path: str, target: str) -> str:
    return posixpath.normpath(posixpath.join(posixpath.dirname(base_path), target))


def style_attr(style: dict[str, Any]) -> str:
    return ";".join(f"{key}:{value}" for key, value in style.items() if value is not None)


def html_escape(value: str) -> str:
    return html.escape(value, quote=True)


@dataclass
class GifOverlay:
    asset_url: str
    left_pct: float
    top_pct: float
    width_pct: float
    height_pct: float


class PdfSvgImporter:
    def __init__(
        self,
        pdf_path: str,
        pptx_path: str | None,
        slug: str,
        title: str,
        date: str,
        description: str,
        repo_root: Path,
    ) -> None:
        self.pdf_path = pdf_path
        self.pptx_path = pptx_path
        self.slug = slug
        self.title = title
        self.date = date
        self.description = description
        self.repo_root = repo_root
        self.public_slides_dir = repo_root / "public" / "slides"
        self.assets_dir = repo_root / "public" / "slides" / slug
        self.markdown_path = repo_root / "src" / "content" / "slides" / f"{slug}.md"
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        self.asset_hashes = self.build_existing_hash_index()

    def import_deck(self) -> None:
        doc = fitz.open(self.pdf_path)
        gif_overlays = self.extract_gif_overlays()
        slides: list[str] = []
        for index, page in enumerate(doc, start=1):
            svg_markup = self.page_to_svg(page, index)
            links_markup = self.page_links(page)
            gif_markup = "".join(self.gif_markup(overlay) for overlay in gif_overlays.get(index, []))
            slides.append(
                '<div class="pptx-slide-canvas">'
                f'<div class="pptx-svg-layer">{svg_markup}</div>'
                f"{links_markup}{gif_markup}"
                "</div>"
            )
        self.markdown_path.write_text(self.build_markdown(slides), encoding="utf-8")

    def build_markdown(self, slides: list[str]) -> str:
        escaped_title = self.title.replace('"', '\\"')
        escaped_description = self.description.replace('"', '\\"')
        header = (
            "---\n"
            f'title: "{escaped_title}"\n'
            f'date: "{self.date}"\n'
            f'description: "{escaped_description}"\n'
            "---\n\n"
        )
        return header + "\n\n---\n\n".join(slides) + "\n"

    def page_to_svg(self, page: fitz.Page, slide_index: int) -> str:
        svg_markup = page.get_svg_image(text_as_path=True)
        root = ET.fromstring(svg_markup)
        root.attrib.pop("width", None)
        root.attrib.pop("height", None)
        root.attrib["preserveAspectRatio"] = "none"
        root.attrib["style"] = "position:absolute;inset:0;width:100%;height:100%;display:block"
        self.externalize_svg_images(root, slide_index)
        return ET.tostring(root, encoding="unicode")

    def externalize_svg_images(self, root: ET.Element, slide_index: int) -> None:
        href_key = f"{{{XLINK_NS}}}href"
        image_index = 1
        for node in root.iter():
            if not node.tag.endswith("image"):
                continue
            href = node.attrib.get(href_key)
            if not href or not href.startswith("data:image/"):
                continue
            match = re.match(r"data:(image/[^;]+);base64,(.*)", href, re.DOTALL)
            if not match:
                continue
            mime_type = match.group(1)
            payload = re.sub(r"\s+", "", match.group(2))
            data = base64.b64decode(payload)
            asset_url = self.write_asset_bytes(data, mime_type, slide_index, image_index)
            node.attrib[href_key] = asset_url
            image_index += 1

    def write_asset_bytes(self, data: bytes, mime_type: str, slide_index: int, image_index: int) -> str:
        digest = hashlib.sha256(data).hexdigest()
        existing = self.asset_hashes.get(digest)
        if existing:
            return existing
        extension = mimetypes.guess_extension(mime_type, strict=False) or ".bin"
        if extension == ".jpe":
            extension = ".jpg"
        filename = f"slide-{slide_index:03d}-asset-{image_index:02d}{extension}"
        target = self.assets_dir / filename
        target.write_bytes(data)
        asset_url = f"/slides/{self.slug}/{filename}"
        self.asset_hashes[digest] = asset_url
        return asset_url

    def page_links(self, page: fitz.Page) -> str:
        rect = page.rect
        overlays: list[str] = []
        for index, link in enumerate(page.get_links(), start=1):
            uri = link.get("uri")
            link_rect = link.get("from")
            if not uri or link_rect is None:
                continue
            left_pct = link_rect.x0 * 100 / rect.width
            top_pct = link_rect.y0 * 100 / rect.height
            width_pct = link_rect.width * 100 / rect.width
            height_pct = link_rect.height * 100 / rect.height
            style = style_attr(
                {
                    "left": f"{left_pct:.4f}%",
                    "top": f"{top_pct:.4f}%",
                    "width": f"{width_pct:.4f}%",
                    "height": f"{height_pct:.4f}%",
                    "z-index": 30,
                }
            )
            overlays.append(
                '<a class="pptx-link-overlay" '
                f'href="{html_escape(uri)}" '
                'target="_blank" rel="noreferrer" '
                f'aria-label="Open slide link {index}" '
                f'style="{style}"></a>'
            )
        return "".join(overlays)

    def extract_gif_overlays(self) -> dict[int, list[GifOverlay]]:
        if not self.pptx_path:
            return {}
        overlays: dict[int, list[GifOverlay]] = {}
        with zipfile.ZipFile(self.pptx_path) as zf:
            presentation = ET.fromstring(zf.read("ppt/presentation.xml"))
            sld_sz = presentation.find("p:sldSz", PPT_NS)
            slide_width = int(sld_sz.attrib["cx"])
            slide_height = int(sld_sz.attrib["cy"])
            slide_paths = sorted(
                [name for name in zf.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)],
                key=lambda name: int(re.search(r"(\d+)", name).group(1)),
            )
            for slide_index, slide_path in enumerate(slide_paths, start=1):
                rels = self.parse_relationships(zf, self.rels_path(slide_path))
                slide_root = ET.fromstring(zf.read(slide_path))
                for pic in slide_root.findall("p:cSld/p:spTree/p:pic", PPT_NS):
                    blip = pic.find("p:blipFill/a:blip", PPT_NS)
                    if blip is None:
                        continue
                    rel_id = blip.attrib.get(ppt_qn("r", "embed"))
                    target = rels.get(rel_id, {}).get("Target")
                    if not target or not target.lower().endswith(".gif"):
                        continue
                    image_path = resolve_part(slide_path, target)
                    asset_url = self.export_pptx_asset(zf, image_path)
                    xfrm = pic.find("p:spPr/a:xfrm", PPT_NS)
                    if xfrm is None:
                        continue
                    off = xfrm.find("a:off", PPT_NS)
                    ext = xfrm.find("a:ext", PPT_NS)
                    if off is None or ext is None:
                        continue
                    overlays.setdefault(slide_index, []).append(
                        GifOverlay(
                            asset_url=asset_url,
                            left_pct=int(off.attrib["x"]) * 100 / slide_width,
                            top_pct=int(off.attrib["y"]) * 100 / slide_height,
                            width_pct=int(ext.attrib["cx"]) * 100 / slide_width,
                            height_pct=int(ext.attrib["cy"]) * 100 / slide_height,
                        )
                    )
        return overlays

    def export_pptx_asset(self, zf: zipfile.ZipFile, part_path: str) -> str:
        data = zf.read(part_path)
        suffix = Path(part_path).suffix or ".bin"
        digest = hashlib.sha256(data).hexdigest()
        existing = self.asset_hashes.get(digest)
        if existing:
            return existing
        filename = f"{digest[:16]}{suffix}"
        target = self.assets_dir / filename
        if not target.exists():
            target.write_bytes(data)
        asset_url = f"/slides/{self.slug}/{filename}"
        self.asset_hashes[digest] = asset_url
        return asset_url

    def build_existing_hash_index(self) -> dict[str, str]:
        hashes: dict[str, str] = {}
        if not self.public_slides_dir.exists():
            return hashes
        for path in sorted(self.public_slides_dir.rglob("*")):
            if not path.is_file() or path.name == ".DS_Store":
                continue
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            asset_url = "/" + str(path.relative_to(self.repo_root / "public")).replace("\\", "/")
            hashes.setdefault(digest, asset_url)
        return hashes

    def gif_markup(self, overlay: GifOverlay) -> str:
        style = {
            "left": f"{overlay.left_pct:.4f}%",
            "top": f"{overlay.top_pct:.4f}%",
            "width": f"{overlay.width_pct:.4f}%",
            "height": f"{overlay.height_pct:.4f}%",
            "z-index": 40,
        }
        return (
            f'<img class="pptx-gif-overlay" src="{overlay.asset_url}" alt="" '
            f'style="{style_attr(style)}" />'
        )

    @staticmethod
    def rels_path(part_path: str) -> str:
        return posixpath.join(posixpath.dirname(part_path), "_rels", f"{posixpath.basename(part_path)}.rels")

    @staticmethod
    def parse_relationships(zf: zipfile.ZipFile, rel_path: str) -> dict[str, dict[str, str]]:
        if rel_path not in zf.namelist():
            return {}
        root = ET.fromstring(zf.read(rel_path))
        rels: dict[str, dict[str, str]] = {}
        for rel in root.findall(ppt_qn("pr", "Relationship")):
            rels[rel.attrib["Id"]] = rel.attrib
        return rels


def main() -> int:
    if len(sys.argv) != 7:
        print(
            "usage: python scripts/import_pdf_svg.py <pdf-path> <pptx-path-or-dash> <slug> <title> <date> <description>",
            file=sys.stderr,
        )
        return 1
    pdf_path, pptx_path, slug, title, date, description = sys.argv[1:7]
    importer = PdfSvgImporter(
        pdf_path=pdf_path,
        pptx_path=None if pptx_path == "-" else pptx_path,
        slug=slug,
        title=title,
        date=date,
        description=description,
        repo_root=Path.cwd(),
    )
    importer.import_deck()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
