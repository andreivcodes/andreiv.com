from __future__ import annotations

import html
import math
import posixpath
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
import xml.etree.ElementTree as ET

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}

PX_WIDTH = 1280
PX_HEIGHT = 720


def qn(prefix: str, name: str) -> str:
    return f"{{{NS[prefix]}}}{name}"


def local_name(tag: str) -> str:
    return tag.split("}", 1)[1] if "}" in tag else tag


def xml_texts(node: ET.Element | None) -> str:
    if node is None:
        return ""
    return "".join(text.text or "" for text in node.findall(".//a:t", NS))


def html_escape(value: str) -> str:
    return html.escape(value, quote=True)


def style_attr(style: dict[str, Any]) -> str:
    return ";".join(f"{key}:{value}" for key, value in style.items() if value is not None)


def merge_dicts(*items: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = {}
    for item in items:
        merged.update({key: value for key, value in item.items() if value is not None})
    return merged


def emu_to_px(value: int, slide_extent: int, px_extent: int) -> float:
    if slide_extent == 0:
        return 0
    return value * px_extent / slide_extent


def parse_bool(value: str | None) -> bool:
    return value in {"1", "true", "True"}


def resolve_part(base_path: str, target: str) -> str:
    return posixpath.normpath(posixpath.join(posixpath.dirname(base_path), target))


def first_child(node: ET.Element | None, names: tuple[str, ...]) -> ET.Element | None:
    if node is None:
        return None
    for child in list(node):
        if local_name(child.tag) in names:
            return child
    return None


def parse_rgb(value: str) -> tuple[int, int, int]:
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)


def to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def adjust_lum(color: str, lum_mod: int | None = None, lum_off: int | None = None) -> str:
    r, g, b = parse_rgb(color.lstrip("#"))
    if lum_mod is not None:
        r = int(r * lum_mod / 100000)
        g = int(g * lum_mod / 100000)
        b = int(b * lum_mod / 100000)
    if lum_off is not None:
        r = int(r + (255 - r) * lum_off / 100000)
        g = int(g + (255 - g) * lum_off / 100000)
        b = int(b + (255 - b) * lum_off / 100000)
    return to_hex((max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))))


@dataclass
class Transform:
    scale_x: float = 1.0
    scale_y: float = 1.0
    tx: float = 0.0
    ty: float = 0.0

    def child(self, off_x: int, off_y: int, ext_cx: int, ext_cy: int, ch_off_x: int, ch_off_y: int, ch_ext_cx: int, ch_ext_cy: int) -> "Transform":
        group_scale_x = ext_cx / ch_ext_cx if ch_ext_cx else 1.0
        group_scale_y = ext_cy / ch_ext_cy if ch_ext_cy else 1.0
        return Transform(
            scale_x=self.scale_x * group_scale_x,
            scale_y=self.scale_y * group_scale_y,
            tx=self.scale_x * (off_x - ch_off_x * group_scale_x) + self.tx,
            ty=self.scale_y * (off_y - ch_off_y * group_scale_y) + self.ty,
        )

    def apply(self, x: int, y: int, cx: int, cy: int) -> tuple[float, float, float, float]:
        return (
            self.scale_x * x + self.tx,
            self.scale_y * y + self.ty,
            self.scale_x * cx,
            self.scale_y * cy,
        )


class ThemeResolver:
    def __init__(self, zf: zipfile.ZipFile) -> None:
        self.zf = zf
        self.scheme_colors: dict[str, str] = {}
        self.major_font = "Arial"
        self.minor_font = "Arial"
        self._load()

    def _load(self) -> None:
        theme_name = next(name for name in self.zf.namelist() if name.startswith("ppt/theme/theme"))
        root = ET.fromstring(self.zf.read(theme_name))
        clr_scheme = root.find(".//a:clrScheme", NS)
        if clr_scheme is not None:
            for child in list(clr_scheme):
                entry = first_child(child, ("srgbClr", "sysClr"))
                if entry is None:
                    continue
                value = entry.attrib.get("val") or entry.attrib.get("lastClr")
                if value:
                    self.scheme_colors[local_name(child.tag)] = f"#{value}"
        major = root.find(".//a:majorFont/a:latin", NS)
        minor = root.find(".//a:minorFont/a:latin", NS)
        if major is not None and major.attrib.get("typeface"):
            self.major_font = major.attrib["typeface"]
        if minor is not None and minor.attrib.get("typeface"):
            self.minor_font = minor.attrib["typeface"]

    def resolve_color(self, fill: ET.Element | None) -> str | None:
        if fill is None:
            return None
        child = first_child(fill, ("srgbClr", "schemeClr", "sysClr"))
        if child is None:
            return None
        if local_name(child.tag) == "srgbClr":
            color = f"#{child.attrib['val']}"
        elif local_name(child.tag) == "sysClr":
            color = f"#{child.attrib.get('lastClr', '000000')}"
        else:
            color = self.scheme_colors.get(child.attrib.get("val", ""), None)
        if color is None:
            return None
        lum_mod = child.find("a:lumMod", NS)
        lum_off = child.find("a:lumOff", NS)
        if lum_mod is not None or lum_off is not None:
            return adjust_lum(
                color,
                int(lum_mod.attrib["val"]) if lum_mod is not None else None,
                int(lum_off.attrib["val"]) if lum_off is not None else None,
            )
        return color


def parse_relationships(zf: zipfile.ZipFile, rel_path: str) -> dict[str, dict[str, str]]:
    if rel_path not in zf.namelist():
        return {}
    root = ET.fromstring(zf.read(rel_path))
    rels: dict[str, dict[str, str]] = {}
    for rel in root.findall(qn("pr", "Relationship")):
        rels[rel.attrib["Id"]] = rel.attrib
    return rels


def normalize_font(font_family: str | None, is_bold: bool) -> tuple[str, str]:
    family = (font_family or "Arial").strip()
    lower = family.lower()
    if "montserrat extrabold" in lower:
        return "Montserrat", "800"
    if "montserrat semibold" in lower:
        return "Montserrat", "600"
    if "montserrat" in lower:
        return "Montserrat", "700" if is_bold else "400"
    if "pacifico" in lower:
        return "Pacifico", "400"
    if "fira sans" in lower:
        return "Fira Sans", "700" if is_bold else "400"
    return family, "700" if is_bold else "400"


def parse_paragraph_style(node: ET.Element | None) -> dict[str, Any]:
    if node is None:
        return {}
    style: dict[str, Any] = {}
    align = node.attrib.get("algn")
    if align:
        style["text_align"] = {"l": "left", "ctr": "center", "r": "right", "just": "justify"}.get(align, "left")
    ln_spc = node.find("a:lnSpc/a:spcPct", NS)
    if ln_spc is not None:
        style["line_height"] = str(float(ln_spc.attrib["val"]) / 100000)
    return style


def parse_text_style(node: ET.Element | None, theme: ThemeResolver) -> dict[str, Any]:
    if node is None:
        return {}
    style: dict[str, Any] = {}
    if "sz" in node.attrib:
        style["font_size"] = f"{float(node.attrib['sz']) / 100}pt"
    style["italic"] = parse_bool(node.attrib.get("i"))
    style["bold"] = parse_bool(node.attrib.get("b"))
    latin = node.find("a:latin", NS)
    if latin is not None and latin.attrib.get("typeface"):
        style["font_family"] = latin.attrib["typeface"]
    fill = node.find("a:solidFill", NS)
    if fill is not None:
        style["color"] = theme.resolve_color(fill)
    return style


def parse_level_styles(lst_style: ET.Element | None, theme: ThemeResolver) -> dict[int, dict[str, Any]]:
    levels: dict[int, dict[str, Any]] = {}
    if lst_style is None:
        return levels
    for child in list(lst_style):
        name = local_name(child.tag)
        if not name.startswith("lvl") or not name.endswith("pPr"):
            continue
        level = int(name[3]) - 1
        levels[level] = {
            "paragraph": parse_paragraph_style(child),
            "text": parse_text_style(child.find("a:defRPr", NS), theme),
        }
    return levels


@dataclass
class PlaceholderContext:
    body_pr: ET.Element | None
    level_styles: dict[int, dict[str, Any]]


class SlideResources:
    def __init__(self, zf: zipfile.ZipFile, slide_path: str, theme: ThemeResolver) -> None:
        self.zf = zf
        self.slide_path = slide_path
        self.slide_rels = parse_relationships(zf, self._rels_path(slide_path))
        self.layout_path = self._resolve_by_type("/slideLayout")
        self.layout_root = ET.fromstring(zf.read(self.layout_path)) if self.layout_path else None
        self.layout_rels = parse_relationships(zf, self._rels_path(self.layout_path)) if self.layout_path else {}
        self.master_path = self._resolve_layout_by_type("/slideMaster")
        self.master_root = ET.fromstring(zf.read(self.master_path)) if self.master_path else None
        self.master_styles = self._parse_master_styles(theme)
        self.placeholders = self._parse_placeholders(theme)
        self.hyperlinks = self._parse_hyperlinks()

    @staticmethod
    def _rels_path(part_path: str | None) -> str:
        if not part_path:
            return ""
        return posixpath.join(posixpath.dirname(part_path), "_rels", f"{posixpath.basename(part_path)}.rels")

    def _resolve_by_type(self, suffix: str) -> str | None:
        for rel in self.slide_rels.values():
            if rel["Type"].endswith(suffix):
                return resolve_part(self.slide_path, rel["Target"])
        return None

    def _resolve_layout_by_type(self, suffix: str) -> str | None:
        if not self.layout_path:
            return None
        for rel in self.layout_rels.values():
            if rel["Type"].endswith(suffix):
                return resolve_part(self.layout_path, rel["Target"])
        return None

    def _parse_hyperlinks(self) -> dict[str, str]:
        links: dict[str, str] = {}
        for rel_id, rel in self.slide_rels.items():
            if rel["Type"].endswith("/hyperlink"):
                links[rel_id] = rel["Target"]
        return links

    def _parse_master_styles(self, theme: ThemeResolver) -> dict[str, dict[int, dict[str, Any]]]:
        styles: dict[str, dict[int, dict[str, Any]]] = {"title": {}, "body": {}, "other": {}}
        if self.master_root is None:
            return styles
        tx_styles = self.master_root.find("p:txStyles", NS)
        if tx_styles is None:
            return styles
        mapping = {"titleStyle": "title", "bodyStyle": "body", "otherStyle": "other"}
        for child in list(tx_styles):
            key = mapping.get(local_name(child.tag))
            if not key:
                continue
            styles[key] = parse_level_styles(child, theme)
        return styles

    def _parse_placeholders(self, theme: ThemeResolver) -> dict[tuple[str, str], PlaceholderContext]:
        contexts: dict[tuple[str, str], PlaceholderContext] = {}
        if self.layout_root is None:
            return contexts
        for sp in self.layout_root.findall(".//p:sp", NS):
            ph = sp.find("p:nvSpPr/p:nvPr/p:ph", NS)
            if ph is None:
                continue
            ph_type = ph.attrib.get("type", "body")
            ph_idx = ph.attrib.get("idx", "0")
            tx_body = sp.find("p:txBody", NS)
            contexts[(ph_type, ph_idx)] = PlaceholderContext(
                body_pr=tx_body.find("a:bodyPr", NS) if tx_body is not None else None,
                level_styles=parse_level_styles(tx_body.find("a:lstStyle", NS) if tx_body is not None else None, theme),
            )
        return contexts

    def placeholder_context(self, shape: ET.Element) -> PlaceholderContext | None:
        ph = shape.find("p:nvSpPr/p:nvPr/p:ph", NS)
        if ph is None:
            return None
        ph_type = ph.attrib.get("type", "body")
        ph_idx = ph.attrib.get("idx", "0")
        return self.placeholders.get((ph_type, ph_idx))

    def style_bucket(self, shape: ET.Element) -> str:
        ph = shape.find("p:nvSpPr/p:nvPr/p:ph", NS)
        if ph is None:
            return "other"
        ph_type = ph.attrib.get("type", "body")
        if ph_type in {"title", "ctrTitle"}:
            return "title"
        if ph_type in {"body", "subTitle"}:
            return "body"
        return "other"


class PptxImporter:
    def __init__(self, pptx_path: str, slug: str, title: str, date: str, description: str, repo_root: Path) -> None:
        self.pptx_path = pptx_path
        self.slug = slug
        self.title = title
        self.date = date
        self.description = description
        self.repo_root = repo_root
        self.assets_dir = repo_root / "public" / "slides" / slug
        self.markdown_path = repo_root / "src" / "content" / "slides" / f"{slug}.md"
        self.assets_dir.mkdir(parents=True, exist_ok=True)

    def import_deck(self) -> None:
        with zipfile.ZipFile(self.pptx_path) as zf:
            theme = ThemeResolver(zf)
            presentation = ET.fromstring(zf.read("ppt/presentation.xml"))
            sld_sz = presentation.find("p:sldSz", NS)
            slide_cx = int(sld_sz.attrib["cx"])
            slide_cy = int(sld_sz.attrib["cy"])
            slide_paths = sorted(
                [name for name in zf.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)],
                key=lambda name: int(re.search(r"(\d+)", name).group(1)),
            )
            slides = [
                self.render_slide(zf, theme, slide_cx, slide_cy, slide_path, index)
                for index, slide_path in enumerate(slide_paths, start=1)
            ]
            markdown = self.build_markdown(slides)
            self.markdown_path.write_text(markdown, encoding="utf-8")

    def build_markdown(self, slides: list[str]) -> str:
        header = (
            "---\n"
            f'title: "{self.title.replace(chr(34), "\\\"")}"\n'
            f'date: "{self.date}"\n'
            f'description: "{self.description.replace(chr(34), "\\\"")}"\n'
            "---\n\n"
        )
        return header + "\n\n---\n\n".join(slides) + "\n"

    def render_slide(
        self,
        zf: zipfile.ZipFile,
        theme: ThemeResolver,
        slide_cx: int,
        slide_cy: int,
        slide_path: str,
        slide_index: int,
    ) -> str:
        resources = SlideResources(zf, slide_path, theme)
        slide_root = ET.fromstring(zf.read(slide_path))
        background = self.resolve_background(slide_root, resources, theme)
        sp_tree = slide_root.find("p:cSld/p:spTree", NS)
        transform = Transform()
        elements: list[str] = []
        z_index = 1
        for child in list(sp_tree):
            name = local_name(child.tag)
            if name in {"nvGrpSpPr", "grpSpPr"}:
                continue
            rendered = self.render_node(
                zf,
                theme,
                resources,
                child,
                transform,
                slide_cx,
                slide_cy,
                slide_index,
                z_index,
            )
            if rendered:
                elements.extend(rendered)
                z_index += len(rendered)
        bg_style = style_attr(
            {
                "background": background or "transparent",
            }
        )
        return (
            f'<div class="pptx-slide-canvas" style="{bg_style}">\n'
            + "\n".join(elements)
            + "\n</div>"
        )

    def resolve_background(self, slide_root: ET.Element, resources: SlideResources, theme: ThemeResolver) -> str | None:
        for root in [slide_root, resources.master_root]:
            if root is None:
                continue
            bg_pr = root.find("p:cSld/p:bg/p:bgPr", NS)
            if bg_pr is None:
                continue
            fill = bg_pr.find("a:solidFill", NS)
            color = theme.resolve_color(fill)
            if color:
                return color
        return None

    def render_node(
        self,
        zf: zipfile.ZipFile,
        theme: ThemeResolver,
        resources: SlideResources,
        node: ET.Element,
        transform: Transform,
        slide_cx: int,
        slide_cy: int,
        slide_index: int,
        z_index: int,
    ) -> list[str]:
        name = local_name(node.tag)
        if name == "grpSp":
            return self.render_group(zf, theme, resources, node, transform, slide_cx, slide_cy, slide_index, z_index)
        if name == "pic":
            return [self.render_picture(zf, resources, node, transform, slide_cx, slide_cy, slide_index, z_index)]
        if name == "sp":
            return [self.render_shape(theme, resources, node, transform, slide_cx, slide_cy, z_index)]
        if name == "cxnSp":
            return [self.render_connector(theme, node, transform, slide_cx, slide_cy, z_index)]
        return []

    def render_group(
        self,
        zf: zipfile.ZipFile,
        theme: ThemeResolver,
        resources: SlideResources,
        node: ET.Element,
        transform: Transform,
        slide_cx: int,
        slide_cy: int,
        slide_index: int,
        z_index: int,
    ) -> list[str]:
        xfrm = node.find("p:grpSpPr/a:xfrm", NS)
        if xfrm is None:
            return []
        off = xfrm.find("a:off", NS)
        ext = xfrm.find("a:ext", NS)
        ch_off = xfrm.find("a:chOff", NS)
        ch_ext = xfrm.find("a:chExt", NS)
        child_transform = transform.child(
            int(off.attrib["x"]),
            int(off.attrib["y"]),
            int(ext.attrib["cx"]),
            int(ext.attrib["cy"]),
            int(ch_off.attrib["x"]) if ch_off is not None else 0,
            int(ch_off.attrib["y"]) if ch_off is not None else 0,
            int(ch_ext.attrib["cx"]) if ch_ext is not None else int(ext.attrib["cx"]),
            int(ch_ext.attrib["cy"]) if ch_ext is not None else int(ext.attrib["cy"]),
        )
        rendered: list[str] = []
        next_z = z_index
        for child in list(node):
            child_name = local_name(child.tag)
            if child_name in {"nvGrpSpPr", "grpSpPr"}:
                continue
            result = self.render_node(zf, theme, resources, child, child_transform, slide_cx, slide_cy, slide_index, next_z)
            if result:
                rendered.extend(result)
                next_z += len(result)
        return rendered

    def px_box(self, transform: Transform, x: int, y: int, cx: int, cy: int, slide_cx: int, slide_cy: int) -> tuple[float, float, float, float]:
        slide_x, slide_y, slide_w, slide_h = transform.apply(x, y, cx, cy)
        return (
            emu_to_px(slide_x, slide_cx, PX_WIDTH),
            emu_to_px(slide_y, slide_cy, PX_HEIGHT),
            emu_to_px(slide_w, slide_cx, PX_WIDTH),
            emu_to_px(slide_h, slide_cy, PX_HEIGHT),
        )

    def common_position_style(
        self,
        xfrm: ET.Element,
        transform: Transform,
        slide_cx: int,
        slide_cy: int,
        z_index: int,
    ) -> dict[str, Any]:
        off = xfrm.find("a:off", NS)
        ext = xfrm.find("a:ext", NS)
        left, top, width, height = self.px_box(
            transform,
            int(off.attrib["x"]),
            int(off.attrib["y"]),
            int(ext.attrib["cx"]),
            int(ext.attrib["cy"]),
            slide_cx,
            slide_cy,
        )
        rotations: list[str] = []
        if parse_bool(xfrm.attrib.get("flipH")):
            rotations.append("scaleX(-1)")
        if parse_bool(xfrm.attrib.get("flipV")):
            rotations.append("scaleY(-1)")
        if "rot" in xfrm.attrib:
            rotations.append(f"rotate({float(xfrm.attrib['rot']) / 60000}deg)")
        style = {
            "left": f"{left:.3f}px",
            "top": f"{top:.3f}px",
            "width": f"{width:.3f}px",
            "height": f"{height:.3f}px",
            "z-index": z_index,
        }
        if rotations:
            style["transform"] = " ".join(rotations)
            style["transform-origin"] = "center center"
        return style

    def shape_visual_style(self, theme: ThemeResolver, sp_pr: ET.Element | None, width: float, height: float) -> tuple[dict[str, Any], str | None]:
        style: dict[str, Any] = {}
        geometry = None
        if sp_pr is not None:
            geom = sp_pr.find("a:prstGeom", NS)
            if geom is not None:
                geometry = geom.attrib.get("prst")
            if sp_pr.find("a:noFill", NS) is not None:
                style["background"] = "transparent"
            else:
                fill = sp_pr.find("a:solidFill", NS)
                fill_color = theme.resolve_color(fill)
                if fill_color:
                    style["background"] = fill_color
            line = sp_pr.find("a:ln", NS)
            if line is not None and line.find("a:noFill", NS) is None:
                border_color = theme.resolve_color(line.find("a:solidFill", NS)) or "#000000"
                border_width = float(line.attrib.get("w", "12700")) / 9525
                style["border"] = f"{border_width:.2f}px solid {border_color}"
        if geometry == "ellipse":
            style["border-radius"] = "50%"
        elif geometry == "roundRect":
            style["border-radius"] = f"{min(width, height) * 0.14:.2f}px"
        elif geometry == "triangle":
            style["clip-path"] = "polygon(50% 0%, 0% 100%, 100% 100%)"
        elif geometry == "parallelogram":
            style["clip-path"] = "polygon(18% 0%, 100% 0%, 82% 100%, 0% 100%)"
        elif geometry == "diamond":
            style["clip-path"] = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
        return style, geometry

    def render_shape(
        self,
        theme: ThemeResolver,
        resources: SlideResources,
        node: ET.Element,
        transform: Transform,
        slide_cx: int,
        slide_cy: int,
        z_index: int,
    ) -> str:
        xfrm = node.find("p:spPr/a:xfrm", NS)
        if xfrm is None:
            return ""
        position_style = self.common_position_style(xfrm, transform, slide_cx, slide_cy, z_index)
        width = float(position_style["width"][:-2])
        height = float(position_style["height"][:-2])
        visual_style, geometry = self.shape_visual_style(theme, node.find("p:spPr", NS), width, height)
        placeholder = resources.placeholder_context(node)
        tx_body = node.find("p:txBody", NS)
        body_pr = tx_body.find("a:bodyPr", NS) if tx_body is not None else None
        if body_pr is None and placeholder is not None:
            body_pr = placeholder.body_pr
        text_html = self.render_text_body(node, tx_body, placeholder, resources, theme)
        extra = ""
        if geometry == "cloudCallout":
            visual_style["background"] = "transparent"
            extra = self.render_cloud_callout(theme, node.find("p:spPr", NS))
        elif geometry == "moon":
            visual_style["background"] = "transparent"
            extra = self.render_moon(theme, node.find("p:spPr", NS))
        outer_style = merge_dicts(
            position_style,
            visual_style,
            {
                "display": "flex",
                "align-items": self.vertical_anchor(body_pr),
                "justify-content": "stretch",
                "overflow": "visible" if geometry in {"cloudCallout", "moon"} else "hidden",
                "padding": self.padding(body_pr, slide_cx, slide_cy),
            },
        )
        return (
            f'<div class="pptx-shape" style="{style_attr(outer_style)}">'
            f"{extra}{text_html}</div>"
        )

    def padding(self, body_pr: ET.Element | None, slide_cx: int, slide_cy: int) -> str:
        if body_pr is None:
            return "0px"
        left = emu_to_px(int(body_pr.attrib.get("lIns", "91425")), slide_cx, PX_WIDTH)
        right = emu_to_px(int(body_pr.attrib.get("rIns", "91425")), slide_cx, PX_WIDTH)
        top = emu_to_px(int(body_pr.attrib.get("tIns", "91425")), slide_cy, PX_HEIGHT)
        bottom = emu_to_px(int(body_pr.attrib.get("bIns", "91425")), slide_cy, PX_HEIGHT)
        return f"{top:.2f}px {right:.2f}px {bottom:.2f}px {left:.2f}px"

    def vertical_anchor(self, body_pr: ET.Element | None) -> str:
        if body_pr is None:
            return "flex-start"
        anchor = body_pr.attrib.get("anchor", "t")
        return {"ctr": "center", "b": "flex-end", "t": "flex-start"}.get(anchor, "flex-start")

    def render_text_body(
        self,
        shape: ET.Element,
        tx_body: ET.Element | None,
        placeholder: PlaceholderContext | None,
        resources: SlideResources,
        theme: ThemeResolver,
    ) -> str:
        if tx_body is None:
            return ""
        shape_levels = parse_level_styles(tx_body.find("a:lstStyle", NS), theme)
        paragraphs: list[str] = []
        bucket = resources.style_bucket(shape)
        master_levels = resources.master_styles.get(bucket, {})
        for paragraph in tx_body.findall("a:p", NS):
            p_pr = paragraph.find("a:pPr", NS)
            level = int((p_pr.attrib.get("lvl", "0") if p_pr is not None else "0"))
            base_paragraph = merge_dicts(
                master_levels.get(level, {}).get("paragraph", {}),
                placeholder.level_styles.get(level, {}).get("paragraph", {}) if placeholder else {},
                shape_levels.get(level, {}).get("paragraph", {}),
                parse_paragraph_style(p_pr),
            )
            end_rpr = paragraph.find("a:endParaRPr", NS)
            base_text = merge_dicts(
                master_levels.get(level, {}).get("text", {}),
                placeholder.level_styles.get(level, {}).get("text", {}) if placeholder else {},
                shape_levels.get(level, {}).get("text", {}),
                parse_text_style(end_rpr, theme),
            )
            runs_html: list[str] = []
            for child in list(paragraph):
                tag = local_name(child.tag)
                if tag == "r":
                    runs_html.append(self.render_run(child.find("a:rPr", NS), child.find("a:t", NS), base_text, resources, theme))
                elif tag == "fld":
                    text_node = child.find("a:t", NS)
                    runs_html.append(self.render_run(child.find("a:rPr", NS), text_node, base_text, resources, theme))
                elif tag == "br":
                    runs_html.append("<br />")
            paragraph_style = {
                "width": "100%",
                "text-align": base_paragraph.get("text_align", "left"),
            }
            if "line_height" in base_paragraph:
                paragraph_style["line-height"] = base_paragraph["line_height"]
            paragraphs.append(f'<div class="pptx-text" style="{style_attr(paragraph_style)}">{"".join(runs_html)}</div>')
        return "".join(paragraphs)

    def render_run(
        self,
        r_pr: ET.Element | None,
        text_node: ET.Element | None,
        base_style: dict[str, Any],
        resources: SlideResources,
        theme: ThemeResolver,
    ) -> str:
        text = text_node.text if text_node is not None and text_node.text is not None else ""
        style = merge_dicts(base_style, parse_text_style(r_pr, theme))
        font_family, font_weight = normalize_font(style.get("font_family"), bool(style.get("bold")))
        inline = {
            "font-family": f"'{font_family}', sans-serif" if " " in font_family else font_family,
            "font-size": style.get("font_size", "16pt"),
            "font-weight": font_weight,
            "font-style": "italic" if style.get("italic") else "normal",
            "color": style.get("color", "#000000"),
            "white-space": "pre-wrap",
        }
        content = html_escape(text)
        if r_pr is not None:
            link = r_pr.find("a:hlinkClick", NS)
            if link is not None and link.attrib.get(qn("r", "id")) in resources.hyperlinks:
                href = resources.hyperlinks[link.attrib[qn("r", "id")]]
                return f'<a href="{html_escape(href)}" target="_blank" rel="noreferrer" style="{style_attr(inline)}">{content}</a>'
        return f'<span style="{style_attr(inline)}">{content}</span>'

    def export_media(self, zf: zipfile.ZipFile, part_path: str) -> str:
        target = self.assets_dir / Path(part_path).name
        if not target.exists():
            target.write_bytes(zf.read(part_path))
        return f"/slides/{self.slug}/{target.name}"

    def render_picture(
        self,
        zf: zipfile.ZipFile,
        resources: SlideResources,
        node: ET.Element,
        transform: Transform,
        slide_cx: int,
        slide_cy: int,
        slide_index: int,
        z_index: int,
    ) -> str:
        xfrm = node.find("p:spPr/a:xfrm", NS)
        style = self.common_position_style(xfrm, transform, slide_cx, slide_cy, z_index)
        blip = node.find("p:blipFill/a:blip", NS)
        rel_id = blip.attrib.get(qn("r", "embed")) if blip is not None else None
        target = resources.slide_rels.get(rel_id, {}).get("Target") if rel_id else None
        asset_url = self.export_media(zf, resolve_part(resources.slide_path, target)) if target else ""
        wrapper_style = merge_dicts(style, {"overflow": "hidden"})
        img_style: dict[str, Any] = {
            "display": "block",
            "width": "100%",
            "height": "100%",
            "object-fit": "fill",
        }
        src_rect = node.find("p:blipFill/a:srcRect", NS)
        if src_rect is not None:
            left = int(src_rect.attrib.get("l", "0")) / 1000
            top = int(src_rect.attrib.get("t", "0")) / 1000
            right = int(src_rect.attrib.get("r", "0")) / 1000
            bottom = int(src_rect.attrib.get("b", "0")) / 1000
            width_factor = 100 / max(1, 100 - left - right)
            height_factor = 100 / max(1, 100 - top - bottom)
            img_style["width"] = f"{width_factor:.4f}%"
            img_style["height"] = f"{height_factor:.4f}%"
            img_style["margin-left"] = f"{-(left * width_factor / 100):.4f}%"
            img_style["margin-top"] = f"{-(top * height_factor / 100):.4f}%"
        hyperlink = node.find("p:nvPicPr/p:cNvPr/a:hlinkClick", NS)
        image_html = f'<img class="pptx-image" src="{asset_url}" alt="" style="{style_attr(img_style)}" />'
        if hyperlink is not None and hyperlink.attrib.get(qn("r", "id")) in resources.hyperlinks:
            href = resources.hyperlinks[hyperlink.attrib[qn("r", "id")]]
            image_html = f'<a href="{html_escape(href)}" target="_blank" rel="noreferrer" style="display:block;width:100%;height:100%">{image_html}</a>'
        return f'<div class="pptx-image" style="{style_attr(wrapper_style)}">{image_html}</div>'

    def render_connector(
        self,
        theme: ThemeResolver,
        node: ET.Element,
        transform: Transform,
        slide_cx: int,
        slide_cy: int,
        z_index: int,
    ) -> str:
        xfrm = node.find("p:spPr/a:xfrm", NS)
        style = self.common_position_style(xfrm, transform, slide_cx, slide_cy, z_index)
        width = float(style["width"][:-2])
        height = float(style["height"][:-2])
        line = node.find("p:spPr/a:ln", NS)
        stroke = theme.resolve_color(line.find("a:solidFill", NS) if line is not None else None) or "#FFFFFF"
        stroke_width = float(line.attrib.get("w", "19050")) / 9525 if line is not None else 2.0
        tail = line.find("a:tailEnd", NS) if line is not None else None
        marker = ""
        if tail is not None and tail.attrib.get("type") == "triangle":
            marker = (
                '<defs><marker id="pptx-arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">'
                f'<path d="M 0 0 L 12 6 L 0 12 z" fill="{stroke}" /></marker></defs>'
            )
        geom = node.find("p:spPr/a:prstGeom", NS)
        geom_name = geom.attrib.get("prst", "straightConnector1") if geom is not None else "straightConnector1"
        if geom_name == "curvedConnector4":
            path = f"M 0 {height} C {width*0.1:.2f} {height*0.2:.2f}, {width*0.35:.2f} {height*0.05:.2f}, {width*0.5:.2f} {height*0.5:.2f} S {width*0.9:.2f} {height*0.8:.2f}, {width:.2f} 0"
        elif geom_name == "curvedConnector3":
            path = f"M 0 {height} C {width*0.2:.2f} {height*0.6:.2f}, {width*0.35:.2f} {height*0.3:.2f}, {width:.2f} 0"
        else:
            path = f"M 0 0 L {width:.2f} {height:.2f}"
        svg = (
            f'<svg class="pptx-connector" width="{width:.3f}" height="{height:.3f}" viewBox="0 0 {width:.3f} {height:.3f}" '
            'xmlns="http://www.w3.org/2000/svg" overflow="visible">'
            f"{marker}<path d=\"{path}\" fill=\"none\" stroke=\"{stroke}\" stroke-width=\"{stroke_width:.2f}\" "
            + ('marker-end="url(#pptx-arrow)" ' if marker else "")
            + 'stroke-linecap="round" stroke-linejoin="round" /></svg>'
        )
        return f'<div class="pptx-connector" style="{style_attr(style)}">{svg}</div>'

    def render_cloud_callout(self, theme: ThemeResolver, sp_pr: ET.Element | None) -> str:
        fill = theme.resolve_color(sp_pr.find("a:solidFill", NS) if sp_pr is not None else None) or "#000000"
        line = sp_pr.find("a:ln", NS) if sp_pr is not None else None
        stroke = theme.resolve_color(line.find("a:solidFill", NS) if line is not None else None) or "#FFFFFF"
        stroke_width = float(line.attrib.get("w", "19050")) / 9525 if line is not None else 2.0
        return (
            '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">'
            f'<path d="M18 68C8 68 0 60 0 50c0-9 6-16 15-18 1-14 12-24 27-24 8 0 15 3 20 8 3-2 7-3 11-3 12 0 22 9 24 20 10 2 18 11 18 22 0 13-11 24-24 24H83c3 3 6 7 6 12 0 3-1 6-2 9-5-5-9-9-14-11-6 7-14 11-23 11-11 0-21-6-27-14-5 1-9 3-13 6 1-3 2-6 2-10 0-6-2-10-6-14Z" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width:.2f}" vector-effect="non-scaling-stroke" />'
            f'<circle cx="42" cy="78" r="5.5" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width:.2f}" vector-effect="non-scaling-stroke" />'
            f'<circle cx="35" cy="88" r="3.8" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width:.2f}" vector-effect="non-scaling-stroke" />'
            f'<circle cx="30" cy="96" r="2.6" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width:.2f}" vector-effect="non-scaling-stroke" />'
            "</svg>"
        )

    def render_moon(self, theme: ThemeResolver, sp_pr: ET.Element | None) -> str:
        fill = theme.resolve_color(sp_pr.find("a:solidFill", NS) if sp_pr is not None else None) or "#D0D0D0"
        return (
            '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">'
            f'<path d="M76 10c-8 3-15 8-21 15-17 20-16 49 1 68 5 6 12 11 20 14-7 3-14 4-22 4-31 0-56-25-56-56S23-1 54-1c8 0 15 2 22 5Z" fill="{fill}" />'
            "</svg>"
        )


def main() -> int:
    if len(sys.argv) != 6:
        print("usage: python scripts/import_pptx_canvas.py <pptx-path> <slug> <title> <date> <description>", file=sys.stderr)
        return 1
    pptx_path, slug, title, date, description = sys.argv[1:6]
    importer = PptxImporter(pptx_path, slug, title, date, description, Path.cwd())
    importer.import_deck()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
