# Alexis Hayat Photography Gallery

This project is a Next.js App Router gallery website for a photographer.

## Folder convention

The app reads photos from `public/gallery`.

- Any subfolder in `public/gallery` is treated as a category.
- Example: `public/gallery/Star Trail` creates category `Star Trail`.
- Supported image extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`.

Example tree:

```text
public/
  gallery/
	Star Trail/
	  image-001.jpg
	  image-002.jpg
	Portraits/
	  portrait-a.webp
```

## Sorting and pagination

- Photos are sorted by file modification date (`mtime`) descending.
- Latest added or modified files appear first.
- Pagination is local to each category with `6` photos per page.
- Each category page shows `2` rows of `3` photos.
- Pagination state is local in the UI (no URL query or dedicated route).

## Zoom

- Click any photo to open a full-screen lightbox.
- Lightbox uses `yet-another-react-lightbox` with `Zoom` plugin.
- Zoom supports wheel, pinch, drag, keyboard navigation, and double-click steps.

## Category sections and side navigation

- Category sections are always open.
- A sticky side navigation links to category anchors on the current page.
- Clicking a category scrolls smoothly to that section.

## Development

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

Run lint checks:

```bash
npm run lint
```
