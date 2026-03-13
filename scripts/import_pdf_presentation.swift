import Foundation
import PDFKit

struct Config {
  let pdfPath: String
  let slug: String
  let title: String
  let date: String
  let description: String
  let targetWidth: CGFloat
}

enum ImportError: Error, CustomStringConvertible {
  case invalidArguments
  case unreadablePDF(String)
  case missingPage(Int)
  case thumbnailEncodingFailed(Int)

  var description: String {
    switch self {
    case .invalidArguments:
      return """
      usage: swift scripts/import_pdf_presentation.swift <pdf-path> <slug> <title> <date> <description> [target-width]
      """
    case let .unreadablePDF(path):
      return "Unable to open PDF at \(path)"
    case let .missingPage(index):
      return "Missing page \(index + 1)"
    case let .thumbnailEncodingFailed(index):
      return "Failed to encode thumbnail for page \(index + 1)"
    }
  }
}

func parseConfig() throws -> Config {
  let args = CommandLine.arguments
  guard args.count == 6 || args.count == 7 else {
    throw ImportError.invalidArguments
  }

  let targetWidth = args.count == 7 ? CGFloat(Double(args[6]) ?? 1920) : 1920

  return Config(
    pdfPath: args[1],
    slug: args[2],
    title: args[3],
    date: args[4],
    description: args[5],
    targetWidth: targetWidth
  )
}

func shellEscapedYAML(_ value: String) -> String {
  value
    .replacingOccurrences(of: "\\", with: "\\\\")
    .replacingOccurrences(of: "\"", with: "\\\"")
}

func renderPage(_ page: PDFPage, targetWidth: CGFloat, pageIndex: Int) throws -> Data {
  let bounds = page.bounds(for: .mediaBox)
  let targetHeight = targetWidth * bounds.height / bounds.width
  let image = page.thumbnail(of: NSSize(width: targetWidth, height: targetHeight), for: .mediaBox)

  guard
    let tiffRepresentation = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiffRepresentation),
    let pngData = bitmap.representation(using: .png, properties: [:])
  else {
    throw ImportError.thumbnailEncodingFailed(pageIndex)
  }

  return pngData
}

func buildMarkdown(config: Config, slideCount: Int) -> String {
  let header = """
  ---
  title: "\(shellEscapedYAML(config.title))"
  date: "\(shellEscapedYAML(config.date))"
  description: "\(shellEscapedYAML(config.description))"
  ---

  """

  let slides = (1...slideCount).map { index in
    let filename = String(format: "slide-%03d.png", index)
    return """
    <div style="display:flex;align-items:center;justify-content:center;width:100%;margin:0;">
      <img src="/slides/\(config.slug)/\(filename)" alt="\(shellEscapedYAML(config.title)) slide \(index)" style="display:block;width:100%;height:auto;max-height:700px;object-fit:contain;" />
    </div>
    """
  }

  return header + slides.joined(separator: "\n\n---\n\n") + "\n"
}

func main() throws {
  let config = try parseConfig()
  let pdfURL = URL(fileURLWithPath: config.pdfPath)
  guard let document = PDFDocument(url: pdfURL) else {
    throw ImportError.unreadablePDF(config.pdfPath)
  }

  let repoRoot = FileManager.default.currentDirectoryPath
  let assetDirectory = URL(fileURLWithPath: repoRoot)
    .appendingPathComponent("public/slides/\(config.slug)", isDirectory: true)
  let markdownURL = URL(fileURLWithPath: repoRoot)
    .appendingPathComponent("src/content/slides/\(config.slug).md")

  try FileManager.default.createDirectory(at: assetDirectory, withIntermediateDirectories: true)

  let existingFiles = try FileManager.default.contentsOfDirectory(
    at: assetDirectory,
    includingPropertiesForKeys: nil
  )
  for file in existingFiles where file.pathExtension.lowercased() == "png" {
    try FileManager.default.removeItem(at: file)
  }

  for index in 0..<document.pageCount {
    guard let page = document.page(at: index) else {
      throw ImportError.missingPage(index)
    }

    let pngData = try renderPage(page, targetWidth: config.targetWidth, pageIndex: index)
    let filename = String(format: "slide-%03d.png", index + 1)
    let outputURL = assetDirectory.appendingPathComponent(filename)
    try pngData.write(to: outputURL)
    print("rendered \(config.slug)/\(filename)")
  }

  let markdown = buildMarkdown(config: config, slideCount: document.pageCount)
  try markdown.write(to: markdownURL, atomically: true, encoding: .utf8)
  print("wrote \(markdownURL.path)")
}

do {
  try main()
} catch let error as ImportError {
  fputs("\(error.description)\n", stderr)
  exit(1)
} catch {
  fputs("\(error)\n", stderr)
  exit(1)
}
