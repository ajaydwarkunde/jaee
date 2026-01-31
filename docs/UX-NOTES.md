# Jaee UX Design Notes

## Brand Identity

### Personality
- **Warm & Welcoming**: The brand feels like a cozy, inviting space
- **Feminine & Elegant**: Soft, graceful, refined aesthetics
- **Premium Quality**: High-end feel without being pretentious
- **Authentic & Handcrafted**: Personal touch, not mass-produced

### Voice & Tone
- Friendly and conversational
- Warm but professional
- Use gentle, soft language
- Occasional use of emojis (💕, ✨, 🌸)

---

## Visual Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | #FAF7F2 | Background |
| Blush | #F5E6E0 | Soft accent, hover states |
| Rose | #D4A5A5 | Primary accent, CTAs |
| Dusty Rose | #C89B9B | Primary hover |
| Champagne | #E8DDD4 | Secondary accent |
| Charcoal | #2D2D2D | Text primary |
| Warm Gray | #6B6B6B | Text secondary |
| Soft White | #FFFFFF | Cards, inputs |

### Typography

**Primary (Headings)**: Cormorant Garamond
- Elegant, feminine serif
- Used for: H1, H2, H3, brand name, prices

**Secondary (Body)**: DM Sans
- Clean, modern sans-serif
- Used for: Body text, buttons, labels

### Spacing

Base unit: 4px

| Size | Value |
|------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

### Border Radius

| Size | Value |
|------|-------|
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| pill | 9999px |

---

## Component Guidelines

### Buttons

**Primary**
- Rose background, white text
- Soft shadow
- Scale slightly on press
- Used for main CTAs

**Secondary**
- Blush background, charcoal text
- No shadow
- Used for secondary actions

**Outline**
- Rose border, rose text
- Fills on hover
- Used for alternate CTAs

### Cards

- White background
- Soft shadow (0 2px 8px rgba(45, 45, 45, 0.08))
- 16px border radius
- Generous padding (24px)
- Subtle shadow increase on hover

### Forms

- Clean, minimal design
- Floating labels or top labels
- Blush border, rose on focus
- Clear error states in red
- Helper text in warm gray

---

## Page-Specific Guidelines

### Home Page
- Hero: Full-width, lifestyle imagery
- Featured products: Grid of 4-8 items
- Categories: Image cards with overlay
- Brand story: Split layout, image + text
- Newsletter: Dark section for contrast

### Shop Page
- Filters: Collapsible sidebar on desktop, drawer on mobile
- Product grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
- Sort dropdown in toolbar
- Load more or pagination at bottom

### Product Page
- Large image gallery (60% width on desktop)
- Sticky info section
- Clear price, stock status
- Prominent Add to Cart button
- Trust badges below CTA

### Cart
- Clear item display with images
- Easy quantity controls
- Prominent checkout button
- Order summary sticky on desktop

### Checkout
- Clean, distraction-free
- Progress indicator
- Trust badges
- Clear error handling

---

## Mobile Considerations

### Navigation
- Sticky header with hamburger menu
- Bottom navigation optional for key actions
- Cart icon always visible with badge

### Touch Targets
- Minimum 44x44px for all interactive elements
- Adequate spacing between touchables

### Performance
- Lazy load images
- Skeleton loaders for content
- Optimistic UI updates

---

## Accessibility

### Color Contrast
- Text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1
- Interactive elements: Clear focus states

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Focus indicators visible

### Screen Readers
- Semantic HTML structure
- ARIA labels where needed
- Alt text for images
- Form labels properly associated

### Motion
- Respect prefers-reduced-motion
- No auto-playing videos/animations
- Subtle, purposeful animations only

---

## Animation Guidelines

### Principles
- Subtle and purposeful
- Never block user interaction
- Consistent timing across app

### Durations
- Micro-interactions: 150-200ms
- Page transitions: 300-400ms
- Complex animations: 500-800ms

### Easing
- Use ease-out for elements entering
- Use ease-in for elements leaving
- Use ease-in-out for position changes

### Common Animations
- Fade in: opacity 0 → 1
- Slide up: translateY(20px) → 0 + fade
- Scale in: scale(0.95) → 1 + fade
- Hover lift: translateY(-2px) + shadow increase

---

## Error States

### Form Errors
- Red border on invalid fields
- Clear error message below field
- Scroll to first error on submit

### API Errors
- Toast notification for transient errors
- Full-page error for critical failures
- Retry options where applicable

### Empty States
- Friendly illustration or icon
- Clear explanation
- Helpful action (e.g., "Start shopping")

---

## Loading States

### Initial Load
- Full-screen spinner with logo
- Skeleton screens preferred for content

### Content Loading
- Skeleton placeholders matching content shape
- Subtle pulse animation

### Action Loading
- Button spinner inline
- Disable interaction during loading
- Optimistic UI where possible
