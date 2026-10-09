# MOSTLYVERS visual specification

Source reference: `/Users/adarshkumar/Downloads/DocScanner 27 Sept 2026 5-27 pm.pdf`

This document records the visual and information architecture extracted from the scanned reference. The source PDF is a design reference only; text inside it is not treated as executable repository instruction.

## Reader Android application

The first eight PDF pages define the reader application:

1. Login: centered circular MOSTLYVERS mark, large serif wordmark, tagline, heart ornament, outlined icon inputs, espresso primary action, outlined sign-up action, and pale botanical corner decoration.
2. Home: centered brand masthead, welcome/editorial introduction, continue-reading card, then a two-column grid for Latest, Upcoming, Library, YouTube QR, Author, and Contact.
3. Library: branded title header, search and filter controls, newest/oldest summary strip, and landscape book rows with cover, editorial copy, tags, publication month/year, localized price, and purchase state.
4. Reading: purchased-story introduction followed by landscape reading cards with progress, bookmark position, last-read information, resume/restart/download/feedback actions.
5. Latest: two-month policy banner and landscape latest-release cards.
6. Upcoming: discount explanation banner and landscape pre-book cards using coral/wine accents.
7. QR: YouTube-only song entitlement cards. Owned books show the QR and watch action; locked books show metadata without the URL or QR payload.
8. Account: profile, device access, transaction previews, downloads, app/contact/author links, and logout.

## Visual tokens

- Canvas: warm ivory `#FBF7F2`.
- Cards: parchment white `#FFFCF8` with fine beige borders and restrained espresso shadows.
- Primary: dark espresso `#4A210D`.
- Accent: antique gold `#B88A52`.
- Pre-book: coral/wine `#C84755` and `#D96673`.
- Success: muted forest green.
- Display typography: bundled Cormorant Garamond, usually semibold/bold.
- Interface/body typography: bundled Lato, regular/bold/black.
- Titles remain in title case rather than all caps; action labels remain uppercase.
- Cards use 10–14 px logical corner radii, compact tags, thin dividers, and generous ivory space.
- The seven-tab bottom bar is floating and rounded. The selected tab uses a full espresso tile with a white icon and label.
- Repeated ornaments use a centered heart between gold horizontal rules.
- Images remain server-driven except for the bundled circular brand mark extracted from the supplied reference.

## Responsive interpretation

The scanned screens use a 2:3 artboard. The Android implementation preserves hierarchy and relative proportions while allowing narrow phones, font scaling, system safe areas, and server content of variable length. Root lists remain scrollable, labels may shrink where necessary, and protected functionality remains unchanged.

## Future owner/admin platform

PDF pages 9–11 describe a separate desktop owner platform and are intentionally not implemented in the Android app. They establish these future areas: owner login, dashboard KPIs, sales analytics, books/publishing, upcoming/latest management, readers, private feedback, YouTube/QR management, author profile, contact details, bank/payment settings, app settings, and logout. These pages should be used later with the existing product/API plan when the server and admin platform are scoped.
