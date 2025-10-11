# Mr Bubbles Express - Uber Eats Style Design Guidelines

## Overview
The Customer and Driver apps follow Uber Eats design patterns exactly - mobile-first, clean, and optimized for iOS App Store and Google Play Store deployment.

## Color Palette

### Primary Colors
- **Uber Green (Primary Action)**: `#06C167` - Main CTA buttons, active states
- **Black (Secondary Action)**: `#000000` - Secondary buttons, navigation
- **White (Background)**: `#FFFFFF` - Main background, cards

### Text Colors
- **Primary Text**: `#000000` - Headings, main content
- **Secondary Text**: `#6B7280` - Descriptions, metadata
- **Tertiary Text**: `#9CA3AF` - Hints, placeholders
- **Link/Action Text**: `#06C167` - Interactive text elements

### System Colors
- **Background**: `#F9FAFB` - Page background (very subtle gray)
- **Card Background**: `#FFFFFF` - White cards with subtle shadow
- **Border**: `#E5E7EB` - Dividers, card borders
- **Error**: `#EF4444` - Error states
- **Success**: `#06C167` - Success states

## Typography

### Font Family
- **Primary (iOS)**: `SF Pro Text, SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif`
- **Primary (Android)**: `Roboto, -apple-system, BlinkMacSystemFont, sans-serif`
- **Fallback**: System fonts for web/cross-platform compatibility
- SF Pro is the standard Uber Eats font on iOS, Roboto on Android

### Font Sizes
- **Page Title**: `28px` / `font-bold` - Main page headers
- **Section Title**: `20px` / `font-semibold` - Section headers
- **Card Title**: `16px` / `font-semibold` - Product names
- **Body Text**: `14px` / `font-normal` - Descriptions
- **Small Text**: `12px` / `font-normal` - Metadata, helper text
- **Button Text**: `16px` / `font-semibold` - All buttons

### Font Weights
- **Bold**: `700` - Page titles, emphasis
- **Semibold**: `600` - Headings, buttons, card titles
- **Normal**: `400` - Body text, descriptions

## Spacing & Layout

### Padding
- **Page Container**: `16px` horizontal padding
- **Card Padding**: `16px` all sides
- **Button Padding**: `16px` vertical, `24px` horizontal
- **Section Spacing**: `24px` between major sections
- **Item Spacing**: `12px` between list items

### Border Radius
- **All Components**: `8px` - Universal Uber Eats standard
  - Buttons: 8px
  - Cards: 8px
  - Input Fields: 8px
  - Product Images: 8px
  - Modals: 8px
  - Containers: 8px

### Shadows
- **Card Shadow**: `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)` - Subtle elevation
- **Button Shadow**: None - Flat design
- **Modal Shadow**: `0 10px 25px rgba(0, 0, 0, 0.15)` - Modal overlays

## Components

### Buttons

#### Primary Button (Uber Green)
```
- Background: #06C167
- Text: White (#FFFFFF)
- Border Radius: 8px
- Padding: 16px 24px
- Font: 16px semibold
- Height: 56px (mobile touch-friendly)
- Full width on mobile
```

#### Secondary Button (Black)
```
- Background: #000000
- Text: White (#FFFFFF)
- Border Radius: 8px
- Padding: 16px 24px
- Font: 16px semibold
- Height: 56px
```

#### Ghost Button (Outline)
```
- Background: Transparent
- Border: 1px solid #E5E7EB
- Text: #000000
- Border Radius: 8px
- Padding: 12px 16px
```

### Product Cards
```
- Background: White
- Border Radius: 8px (Uber Eats standard)
- Shadow: Subtle card shadow
- Image: Square or 4:3 ratio, 8px border radius
- Title: 16px semibold black
- Price: 14px semibold black
- Description: 12px gray
- Padding: 12px
```

### Quantity Controls
```
- Container: Flexbox horizontal
- Minus Button: 32px x 32px, border 1px #E5E7EB, centered "-" icon
- Quantity Display: 32px width, centered, 16px semibold
- Plus Button: 32px x 32px, border 1px #E5E7EB, centered "+" icon
```

### Bottom Action Bar
```
- Position: Fixed bottom
- Background: White
- Padding: 16px
- Border Top: 1px solid #E5E7EB
- Button: Full width primary green button
- Safe area padding for iOS notch
```

### Cart/Checkout Summary
```
- Background: White card
- Each row: Flexbox space-between
- Label: 14px normal gray
- Value: 14px semibold black
- Total row: 16px bold black
- Divider: 1px solid #E5E7EB
```

## Mobile Optimization

### Touch Targets
- **Minimum Height**: 44px (iOS) / 48px (Android)
- **Buttons**: 56px height for primary actions
- **Interactive Elements**: Minimum 44px x 44px

### Responsive Breakpoints
- **Mobile**: < 768px (primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (secondary)

### Safe Areas
- **Top Safe Area**: Account for iOS status bar
- **Bottom Safe Area**: Account for iOS home indicator
- **Side Safe Areas**: Minimum 16px padding

## Icon System
- Use **Lucide React** icons
- Icon Size: 20px for inline, 24px for prominent actions
- Icon Color: Inherit from parent text color
- Icon Weight: 2px stroke width

## Interactions

### Hover States (Desktop)
- **Buttons**: Darken by 5% (`#05A858` for green)
- **Cards**: Slight shadow increase
- **Links**: Underline

### Active/Press States
- **Buttons**: Scale 0.98, brief opacity to 0.9
- **Cards**: Slight scale 0.99
- **Quick feedback**: 100ms transition

### Loading States
- **Buttons**: Show spinner, disable interaction
- **Skeleton**: Animated gray pulse for content loading
- **Full Page**: Centered spinner with Mr Bubbles branding

## Image Guidelines
- **Product Images**: Clean white background, professional photography
- **Aspect Ratio**: Square (1:1) or 4:3 for products
- **Quality**: High resolution (2x for retina displays)
- **Format**: WebP with JPG fallback
- **Lazy Loading**: Enabled for all images below fold

## Accessibility
- **Contrast Ratio**: Minimum 4.5:1 for text
- **Focus States**: Visible 2px outline for keyboard navigation
- **Touch Targets**: Minimum 44px x 44px
- **Alt Text**: Descriptive alt text for all images
- **ARIA Labels**: For icon-only buttons

## Platform-Specific

### iOS
- Use native iOS safe area insets
- Haptic feedback on button press
- Native date/time pickers
- Apple Pay integration

### Android
- Material Design ripple effects
- Native Android back button support
- Google Pay integration

## Best Practices
1. **Mobile First**: Design for smallest screen, scale up
2. **Touch Friendly**: Large tap targets, generous spacing
3. **Fast Loading**: Optimize images, lazy load below fold
4. **Clear Actions**: Single primary action per screen
5. **Visual Hierarchy**: Use size, weight, and color to guide users
6. **Consistent Spacing**: Use 4px, 8px, 12px, 16px, 24px, 32px scale
7. **Error Prevention**: Validate inputs, confirm destructive actions
8. **Feedback**: Always acknowledge user actions immediately
