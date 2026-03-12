/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion block.
 * Source: .accordion.accordion--open element
 * Output: Each row = [title, content body]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract accordion trigger (title)
  const trigger = element.querySelector('.accordion__trigger, .accordion__button');
  const heading = trigger ? trigger.querySelector('.accordion__span, .accordion__heading') : null;

  const titleEl = document.createElement('div');
  if (heading) {
    const h = document.createElement('h2');
    h.textContent = heading.textContent.trim();
    titleEl.appendChild(h);
  }

  // Extract accordion content
  const contentArea = element.querySelector('.accordion__content');
  const contentEl = document.createElement('div');

  if (contentArea) {
    // Get all paragraphs including disclaimer sections
    const allContent = contentArea.querySelectorAll('p');
    allContent.forEach((p) => {
      const text = p.textContent.trim();
      if (!text) return;

      const clone = p.cloneNode(true);

      // Clean up tracking parameters from links
      clone.querySelectorAll('a').forEach((a) => {
        // Remove "Return" back-to-origin links
        if (a.classList.contains('back-to-origin')) {
          a.remove();
          return;
        }
        try {
          const href = a.getAttribute('href');
          if (!href || href === '#') return;
          const url = new URL(href, 'https://www.anz.com.au');
          ['mboxid', 'adobe_mc'].forEach((param) => url.searchParams.delete(param));
          if (url.hostname.includes('anz.com.au')) {
            a.href = url.pathname + url.search;
          } else {
            a.href = url.toString();
          }
        } catch (e) { /* keep original */ }
      });

      // Unwrap grayscale spans - keep content
      clone.querySelectorAll('.text--grayscale-45, .text--grayscale-50').forEach((span) => {
        span.replaceWith(...span.childNodes);
      });

      // Remove disclaimer number spans
      clone.querySelectorAll('.dis-number').forEach((span) => {
        span.replaceWith(span.textContent);
      });

      // Remove screen reader only spans
      clone.querySelectorAll('.screen-reader-only').forEach((span) => span.remove());

      // Skip if only whitespace after cleanup
      if (!clone.textContent.trim()) return;

      contentEl.appendChild(clone);
    });

    // Also capture "Return" links at disclaimer section level
    contentArea.querySelectorAll('a.back-to-origin').forEach((a) => a.remove());
  }

  if (titleEl.hasChildNodes() && contentEl.hasChildNodes()) {
    cells.push([titleEl, contentEl]);
  }

  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'Accordion',
      cells,
    });
    element.replaceWith(block);
  }
}
