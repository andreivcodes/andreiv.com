import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "../ui/button";
import { PERSONAL_INFO, SKILLS, CONTACT_INFO } from "@/lib/personalInfo";
import superjson from "superjson";

interface ProfessionalData {
  companyName: string;
  companyAbout?: string | null;
  role?: string;
  startDate: string;
  endDate?: string;
  content: string;
}

interface EducationData {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
  content: string;
}

interface DownloadPDFButtonProps {
  resumeData: string;
}

export default function DownloadPDFButton({
  resumeData,
}: DownloadPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const footerHeight = 100; // Approximate footer height

      // Check if we're within footer range
      setIsNearBottom(scrollPosition > documentHeight - footerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadImage = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject("Failed to get canvas context");
          return;
        }

        // Create circular image
        const size = 300;
        canvas.width = size;
        canvas.height = size;

        // Clear canvas and set transparent background
        ctx.clearRect(0, 0, size, size);

        // Save the current state
        ctx.save();

        // Draw circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw image
        ctx.drawImage(img, 0, 0, size, size);

        // Restore the state
        ctx.restore();

        // Convert to PNG to preserve transparency
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject("Failed to load image");
      img.src = url;
    });
  };

  // Parse HTML content to extract text
  const parseHtmlContent = (html: string): string[] => {
    if (!html) return [];

    // Split by <br> tags first to preserve line breaks
    const sections = html.split(/<br\s*\/?>\s*<\/?\s*br\s*\/?>/i);
    const paragraphs: string[] = [];

    sections.forEach((section) => {
      // Parse each section
      const parser = new DOMParser();
      const doc = parser.parseFromString(section, "text/html");

      // Get text content and clean it up
      const text = doc.body.textContent?.trim();
      if (text && text.length > 5) {
        paragraphs.push(text);
      }
    });

    // If no sections found, try to parse as a whole
    if (paragraphs.length === 0) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const text = doc.body.textContent?.trim();
      if (text) {
        // Split by sentences for better formatting
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        sentences.forEach((sentence) => {
          const trimmed = sentence.trim();
          if (trimmed.length > 5) {
            paragraphs.push(trimmed);
          }
        });
      }
    }

    return paragraphs;
  };

  const formatPeriod = (startDate: string, endDate?: string): string => {
    return endDate ? `${startDate} - ${endDate}` : `${startDate} - Present`;
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // Parse the resume data passed from server
      const { professional, education } = superjson.parse(resumeData) as {
        professional: ProfessionalData[];
        education: EducationData[];
      };

      const pdf = new jsPDF("p", "mm", "a4");

      // Page dimensions - clean and simple
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Simple color palette
      const black = [0, 0, 0] as [number, number, number];
      const darkGray = [51, 51, 51] as [number, number, number];
      const gray = [102, 102, 102] as [number, number, number];
      const lightGray = [200, 200, 200] as [number, number, number];

      // Helper functions
      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      const drawLine = () => {
        pdf.setDrawColor(...lightGray);
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      };

      // Header with personal info and picture
      const imageSize = 35;
      const imageX = pageWidth - margin - imageSize;
      const textMaxWidth = contentWidth - imageSize - 10; // Leave 10mm gap between text and image

      try {
        const profileImageData = await loadImage(PERSONAL_INFO.profileImage);
        pdf.addImage(
          profileImageData,
          "PNG",
          imageX,
          yPosition,
          imageSize,
          imageSize,
        );
      } catch (error) {
        console.error("Failed to load profile image:", error);
      }

      // Name
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(...black);
      pdf.text(PERSONAL_INFO.name, margin, yPosition + 5);
      yPosition += 10;

      // Title
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...darkGray);
      const titleLines = pdf.splitTextToSize(PERSONAL_INFO.title, textMaxWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 5;

      // Location
      pdf.setFontSize(10);
      pdf.setTextColor(...gray);
      pdf.text(PERSONAL_INFO.location, margin, yPosition);
      yPosition = Math.max(yPosition + 10, margin + imageSize + 5); // Ensure we're below the image

      // Contact information
      pdf.setFontSize(9);
      pdf.setTextColor(...darkGray);

      const contactInfo: string[] = [];
      if (CONTACT_INFO.email) contactInfo.push(CONTACT_INFO.email);
      if (CONTACT_INFO.website)
        contactInfo.push(CONTACT_INFO.website.replace("https://", ""));
      if (CONTACT_INFO.linkedin) {
        const linkedinUsername = CONTACT_INFO.linkedin.split("/").pop() || "";
        contactInfo.push(`linkedin/${linkedinUsername}`);
      }
      if (CONTACT_INFO.github) {
        const githubUsername = CONTACT_INFO.github.split("/").pop() || "";
        contactInfo.push(`github/${githubUsername}`);
      }

      // Display contact info in multiple lines for better spacing
      if (contactInfo.length > 0) {
        // Split into two rows for better layout
        const midPoint = Math.ceil(contactInfo.length / 2);
        const firstRow = contactInfo.slice(0, midPoint).join(" • ");
        const secondRow = contactInfo.slice(midPoint).join(" • ");

        pdf.text(firstRow, margin, yPosition);
        yPosition += 5;
        if (secondRow) {
          pdf.text(secondRow, margin, yPosition);
          yPosition += 5;
        }
      }

      yPosition += 10;
      drawLine();

      // About/Summary
      if (PERSONAL_INFO.summary) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...darkGray);
        const summaryLines = pdf.splitTextToSize(
          PERSONAL_INFO.summary,
          contentWidth,
        );
        pdf.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 5 + 8;
      }

      // Skills
      if (SKILLS.primary.length > 0 || SKILLS.secondary.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...darkGray);
        pdf.text("Skills", margin, yPosition);
        yPosition += 5;

        // Primary skills
        if (SKILLS.primary.length > 0) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(...black);
          const primaryText = SKILLS.primary
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" • ");
          pdf.text(primaryText, margin, yPosition);
          yPosition += 5;
        }

        // Secondary skills
        if (SKILLS.secondary.length > 0) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(...gray);
          const secondaryText = SKILLS.secondary
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" • ");
          const secondaryLines = pdf.splitTextToSize(
            secondaryText,
            contentWidth,
          );
          pdf.text(secondaryLines, margin, yPosition);
          yPosition += secondaryLines.length * 5 + 3;
        }
      }

      yPosition += 10;
      drawLine();

      // Professional Experience
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(...black);
      pdf.text("Professional Experience", margin, yPosition);
      yPosition += 10;

      // Sort professional experience by index (same as about page)
      const sortedProfessional = [...professional].sort(
        (a, b) => (a as any).index - (b as any).index,
      );

      sortedProfessional.forEach((exp, index) => {
        const data = exp as ProfessionalData;
        addNewPageIfNeeded(40);

        // Period on the right
        const period = formatPeriod(data.startDate, data.endDate);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...gray);
        const periodWidth = pdf.getTextWidth(period);
        pdf.text(period, pageWidth - margin - periodWidth, yPosition);

        // Role
        if (data.role) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(11);
          pdf.setTextColor(...black);
          pdf.text(data.role, margin, yPosition);
          yPosition += 6;
        }

        // Company (with optional about info)

        if (data.companyName) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(...darkGray);
          let companyText = data.companyName;
          if (data.companyAbout) {
            companyText += ` • ${data.companyAbout}`;
          }
          pdf.text(companyText, margin, yPosition);
          yPosition += 7;
        }

        // Description points from content
        const contentPoints = parseHtmlContent(data.content);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...darkGray);

        contentPoints.forEach((point) => {
          const lines = pdf.splitTextToSize(`• ${point}`, contentWidth - 5);

          addNewPageIfNeeded(lines.length * 5);

          lines.forEach((line, i) => {
            pdf.text(i === 0 ? line : "  " + line, margin, yPosition);
            yPosition += 5;
          });
          yPosition += 1;
        });

        if (index < sortedProfessional.length - 1) {
          yPosition += 5;
        }
      });

      yPosition += 5;
      addNewPageIfNeeded(30);
      drawLine();

      // Education
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(...black);
      pdf.text("Education", margin, yPosition);
      yPosition += 10;

      // Sort education by year (newest first) - same as about page
      const sortedEducation = [...education].sort((a, b) => {
        // Parse years from startDate for chronological sorting
        const getYear = (date: string) => {
          const match = date.match(/\d{4}/);
          return match ? parseInt(match[0]) : 0;
        };
        return (
          getYear((b as EducationData).startDate) -
          getYear((a as EducationData).startDate)
        );
      });

      sortedEducation.forEach((edu, index) => {
        const data = edu as EducationData;
        addNewPageIfNeeded(30);

        // Period on the right
        const period = formatPeriod(data.startDate, data.endDate);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...gray);
        const periodWidth = pdf.getTextWidth(period);
        pdf.text(period, pageWidth - margin - periodWidth, yPosition);

        // Degree and field
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(...black);
        const degreeText = data.field
          ? `${data.degree} ${data.field}`
          : data.degree;
        const degreeLines = pdf.splitTextToSize(degreeText, contentWidth - 40);
        pdf.text(degreeLines, margin, yPosition);
        yPosition += degreeLines.length * 5 + 1;

        // Institution
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...darkGray);
        pdf.text(data.institution, margin, yPosition);
        yPosition += 5;

        // Description
        if (data.description) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(...gray);
          pdf.text(data.description, margin, yPosition);
          yPosition += 5;
        }

        // Additional details from content
        if (data.content) {
          const contentLines = parseHtmlContent(data.content);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(...darkGray);
          contentLines.forEach((detail) => {
            const detailLines = pdf.splitTextToSize(detail, contentWidth);
            detailLines.forEach((line) => {
              pdf.text(line, margin, yPosition);
              yPosition += 5;
            });
          });
        }

        if (index < sortedEducation.length - 1) {
          yPosition += 5;
        }
      });

      // Footer
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.setTextColor(...gray);
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      pdf.text(
        `Generated from ${CONTACT_INFO.website} on ${currentDate}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      );

      // Add metadata
      pdf.setProperties({
        title: `${PERSONAL_INFO.name} - Resume`,
        subject: "Professional Resume",
        author: PERSONAL_INFO.name,
        keywords: "software engineer, full-stack, web3, embedded systems",
        creator: CONTACT_INFO.website,
      });

      // Save the PDF
      const date = new Date().toISOString().split("T")[0];
      pdf.save(
        `${PERSONAL_INFO.name.toLowerCase().replace(" ", "-")}-resume-${date}.pdf`,
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className={`fixed right-8 z-50 transition-all duration-300 ease-in-out
                  ${isNearBottom ? "bottom-16 md:bottom-20" : "bottom-8"}
                  sm:right-6 md:right-8`}
      data-pdf-exclude
    >
      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2
                   bg-primary hover:bg-primary/90 text-primary-foreground
                   hover:scale-105 transform"
      >
        <Download className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">
          {isGenerating ? "Generating PDF..." : "Download Resume"}
        </span>
        <span className="sm:hidden">{isGenerating ? "..." : "PDF"}</span>
      </Button>
    </div>
  );
}
