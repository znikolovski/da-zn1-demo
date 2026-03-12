/* eslint-disable */
/* global WebImporter */

/**
 * Parser for alert-banner block.
 * Source: .butter-bar element
 * Output: Single-row block with text content and link.
 */
export default function parse(element, { document }) {
  // Extract the meaningful text content from the butter-bar
  const textContainer = element.querySelector('.butter-bar__content') || element;

  // Find all paragraph/text nodes
  const paragraphs = textContainer.querySelectorAll('p');
  const contentEl = document.createElement('div');

  if (paragraphs.length > 0) {
    paragraphs.forEach((p) => {
      const clone = p.cloneNode(true);
      // Clean up tracking parameters from links
      clone.querySelectorAll('a').forEach((a) => {
        try {
          const url = new URL(a.href);
          // Remove tracking params
          ['mboxid', 'adobe_mc'].forEach((param) => url.searchParams.delete(param));
          a.href = url.toString();
        } catch (e) { /* keep original href */ }
      });
      contentEl.appendChild(clone);
    });
  } else {
    // Fallback: use text content directly
    const p = document.createElement('p');
    p.textContent = textContainer.textContent.trim();
    contentEl.appendChild(p);
  }

  const cells = [[contentEl]];
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Alert Banner',
    cells,
  });
  element.replaceWith(block);
}
