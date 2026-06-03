import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

/**
 * Converts a slug string into a title-cased string.
 * @returns The title-cased string
 */
function toTitleCase(
  /** slug - The hyphen-separated slug to convert */
  slug: string,
): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default defineManifest({
  manifest_version: 3,
  name: toTitleCase(pkg.name),
  description: pkg.description,
  version: pkg.version,
  icons: {
    48: 'public/logo.png',
  },
  content_scripts: [
    {
      js: ['src/content/main.ts'],
      matches: ['https://github.com/*/pull/*'],
    },
  ],
})
