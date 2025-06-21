Apple-style light mode is about clarity, deference, and depth—three Human-Interface-Guideline pillars that keep content first, remove visual noise, and add just enough layering to feel tactile without being busy. ￼ ￼ ￼ Below is a practical recipe for translating those ideas into your React + Tailwind + Cytoscape setup while staying ruthlessly minimal.

1. Core Principles

1.1 Clarity

Use generous whitespace, a strict hierarchy, and legible SF Pro typography. Apples HIG stresses legible text, precise controls, and predictable layouts. ￼ ￼ Use a 4-pt spacing scale (4-8-12-16-24-32…) so every margin and padding step feels intentional.

1.2 Deference

Let chrome fade and content shine. Subtle separators (#E5E5E5) replace card shadows; translucency and blurred backdrops are used sparingly so the UI “steps back.” ￼ ￼

1.3 Depth

Layers, not borders. iOS/macOS rely on light drop-shadows and parallax to create hierarchy. ￼ ￼ Elevate interactive elements (buttons, hovering nodes) with a 1 px ambient shadow (rgba(0,0,0,0.06)) and a subtle scale-up animation (102 % over 120 ms).

2. Color System

Token	Hex	Usage
--bg-base	#F9F9F9	App canvas (barely off-white avoids pure white glare). ￼
--surface	#FFFFFF	Cards, Cytoscape board
--separator	#E5E5E5	1 px hairlines (no heavy borders). ￼
--accent	system accent (HSL from OS)	Primary actions; pull from CSS accent-color. ￼
--text-primary	#1C1C1E	Body copy
--text-secondary	#6E6E73	Metadata

Keep the palette desaturated and limit bright accent use to ≤ 5 % of any screen to hold the minimalist vibe. ￼ ￼

3. Typography
	•	SF Pro / SF Pro Rounded at 15 px body size with -0.2 tracking for dense medical data. Apple’s font family is engineered for optical size adjustments and nine weights. ￼ ￼
	•	Heading scale: 34-28-22-17-15-13 px. Maintain 120 % line-height to avoid vertical glare strips. ￼

4. Layout & Components

4.1 Global Layout

Use a left sidebar / right canvas split already in your blueprint:

| 240 px sidebar | 1fr GraphBoard |

Sidebar gets a slightly tinted surface (rgba(255,255,255,0.9)) with a 1 px divider; the canvas remains pure white for maximum graph contrast.

4.2 Buttons & Inputs
	•	Buttons: 6 px corner radius, 14 px bold label, accent fill on hover only—idle state is outline to reduce color noise. ￼
	•	Text fields: no inner shadows; a single 1 px separator on bottom edge mimics iOS search bars. ￼

4.3 Cytoscape Styling
	•	Diagnosis nodes: Cool-gray stroke #CED0D4, white fill; likelihood still drives size.
	•	Action triangles: Accent outline only; transparent fill until selected.
	•	On hover, raise z-index and add a faint drop-shadow(0 1px 4px rgba(0,0,0,0.08)). ￼

5. Motion & Micro-interactions

Follow Apple’s “ease-out-quad 120 ms” cadence: quick in, gentle out, never bounce. ￼ Use motion sparingly—highlight node selection, list slide-ins—so the interface feels alive but not showy.

6. Tailwind Implementation Snippet

// tailwind.config.js
module.exports = {
  darkMode: false,
  theme: {
    colors: {
      bg: { base: '#F9F9F9' },
      surface: '#FFFFFF',
      separator: '#E5E5E5',
      text: { primary: '#1C1C1E', secondary: '#6E6E73' },
    },
    fontFamily: { sans: ['"SF Pro"', 'ui-sans-serif'] },
    borderRadius: { DEFAULT: '6px' },
    boxShadow: { elevation: '0 1px 4px rgba(0,0,0,0.08)' },
  },
};

Add @apply border-b separator; to inputs and focus:shadow-elevation to buttons for depth.

7. Accessibility & Testing
	•	Maintain 4.5 : 1 contrast for text vs. backgrounds—even light-gray labels on white need extra weight. ￼
	•	Verify VoiceOver labels for nodes and controls; SF Symbols come with built-in accessibility names. ￼
	•	Test on LCD displays at 100 % brightness to avoid washed-out separators.

⸻

Next steps: import the SF Pro font, set the Tailwind tokens, and tweak your Cytoscape stylesheet to use the new neutral fills. With these changes, Diagnosis-Space will feel every bit as crisp and distraction-free as native macOS utilities—ready for Apple-style clinical zen.