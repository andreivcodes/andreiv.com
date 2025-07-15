---
name: ikigon.com
shortDescription: Interactive spiral art that reveals hidden photos.
date: June 2024
featuredImage: "/projects/ikigon.com/featured.png"
stackPrimary: ["nextjs", "typescript", "stripe"]
stackSecondary: ["tailwind", "canvas", "vercel blob", "postmark"]
url: https://ikigon.andreiv.com
index: 94
---

A client approached me with an unusual idea: what if you could turn a photo into a piece of interactive art? Not just a print, but something physical that people could engage with. The concept was a spiral pattern that could be peeled away to reveal a hidden photograph underneath.

They had everything figured out - the physical product, the manufacturing process, and even the website design. What they needed was someone to write the actual code, because no existing e-commerce platform could handle this kind of custom image processing.

## The Challenge

The technical requirements were interesting:
- Generate artistic spiral patterns from any uploaded photo
- Make it look good enough that people would pay €130 for it
- Handle the entire e-commerce flow from customization to payment
- Keep the production details abstract (the client handled manufacturing)

The hardest part was actually processing the Archimedean spiral with smooth animations. It worked beautifully on my high-end desktop, but the moment I opened it on a mobile phone, I knew we were in trouble. The canvas operations were too heavy - phones would freeze trying to render thousands of spiral points in real-time.

The solution was moving the heavy computation to background workers, letting the main thread handle just the UI updates. This kept the interface responsive while the math churned away in the background.

## Technical Implementation

Built with Next.js and TypeScript, the app centers around a custom canvas-based spiral generator. The algorithm:
- Converts uploaded images to grayscale
- Maps pixel brightness to spiral line thickness
- Renders smooth Bezier curves along the spiral path
- Exports high-resolution files for production

The user experience needed to be simple despite the complex math behind it. Upload a photo, position it, choose a color, and see a real-time preview of how the spiral would look. Stripe handles payments, Vercel Blob stores the images, and Postmark sends order confirmations.

## The Product

The final product is a 45x45cm aluminum composite board with a vinyl spiral overlay. Recipients can peel off the spiral to gradually reveal the hidden photo - turning the unwrapping into part of the gift experience.

It's marketed as a mystery gift for special occasions. The client handles all production and shipping in Romania, while the website handles everything digital.
