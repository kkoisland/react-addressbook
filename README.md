# React Address Book

📊 For a visual overview of this project, see the [Speaker Deck presentation](https://speakerdeck.com/kkoisland/react-addressbook).

A personal address book application built with React + TypeScript for managing contacts and printing mailing labels.

## Features

- Create, edit, duplicate, and delete contacts
- Quick search and advanced search with multiple filter criteria
- Print labels for Brother DK-1209 (JP/US address formats)
- Quick print by label type or custom filtered print
- Copy phone numbers and email addresses to clipboard
- Dark/Light mode support
- Data stored locally in browser (localStorage)

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Biome (Formatter & Linter)
- localStorage for data persistence

## Resources

🚀 **Live Demo**: https://www.kkoisland.com/react-addressbook/

📝 **Slides**: [Google Slides](https://docs.google.com/presentation/d/1tO9qYSCKY4RH4LRjyMLPHxCnSFrTuc64ZFn_Tc7rRk4/preview) — Same content as the Speaker Deck presentation, for those who cannot access Speaker Deck.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm biome:check  # Check code with Biome
pnpm biome:fix    # Fix code with Biome
```

## Roadmap

- [ ] Brother DK-1209 label printing - hardware testing
- [ ] Database migration (Firebase or AWS) for cloud storage and sharing
- [ ] Responsive design for mobile/tablet
- [ ] Error handling and data validation improvements
- [ ] CSV import
