---
name: phototailors.com
shortDescription: Custom photo album configurator with real-time rendering.
date: Oct 2024
featuredImage: "/projects/phototailors.com/featured.png"
stackPrimary: ["nextjs", "typescript", "postgres"]
stackSecondary: ["satori", "tailwind", "radix ui", "kysely"]
url: https://phototailors.andreiv.com
index: 93
---

The client came to me with pixel-perfect designs and a clear vision: a photo album configurator with really, REALLY complex configurations. Not just picking a size and color, but configuring essentially everything you can imagine about a photo album - from the grain direction of the linen to the type of adhesive for mounting photos.

They're a designer who knew exactly what they wanted and understood that no existing e-commerce platform could handle this level of customization with real-time visual feedback.

## The Complexity

The configurator handles:
- 6 album sizes with custom page counts
- 9 different instant photo formats (Polaroid, Instax, Kodak)
- 100+ material and color combinations
- 5 printing methods with realistic visual effects
- 30+ fonts with material-aware rendering
- Photo covers with interactive positioning
- Multiple mounting options per photo type

Every choice affects what's available next. Pick Instax Mini? You get different layout options than Polaroid Go. Choose velvet? Different printing methods become available. It's a branching tree of possibilities that needed to feel intuitive.

## Technical Implementation

The most challenging part was the real-time cover rendering. First, it was too heavy to run on the client side. Second, the website rendering was supposed to be used for the actual album cover print as well, preferably in vector format. Using Next.js's ImageResponse API (built on Satori), I created a server-side rendering engine that generates album covers on the fly. Each text effect - metallic foil, UV printing, laser engraving - is rendered differently based on the selected material.

State management was another challenge. With hundreds of possible combinations, I used URL-based state with nuqs, turning the entire configuration into a shareable link. The multi-step wizard guides users through the complexity without overwhelming them.

## The Result

A configurator that feels more like a design tool than a shopping cart. Users can experiment with combinations, see instant visual feedback, and create truly personalized photo albums. The client handles production of these complex orders, while the website handles the equally complex task of making it all feel simple.
