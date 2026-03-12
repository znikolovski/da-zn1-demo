/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Source: .hero.hero--fivefourthree-logon element
 * Output: Row 1 = background image, Row 2 = content (heading, body, CTA).
 */
export default function parse(element, { document }) {
  // Extract background image
  const bgImg = element.querySelector('.hero-frame img, .focuspoint img, .hero__image img');
  let imageEl = null;
  if (bgImg) {
    imageEl = bgImg.cloneNode(true);
  }

  // Extract content from hero main area
  const heroMain = element.querySelector('.hero__main') || element.querySelector('.hero__info');
  const contentEl = document.createElement('div');

  if (heroMain) {
    // Get heading
    const h1 = heroMain.querySelector('h1');
    if (h1) {
      const heading = document.createElement('h1');
      heading.textContent = h1.textContent.trim();
      contentEl.appendChild(heading);
    }

    // Get body text paragraphs (not button containers)
    const paragraphs = heroMain.querySelectorAll('.text.parbase p');
    paragraphs.forEach((p) => {
      // Skip empty paragraphs and button-only paragraphs
      const text = p.textContent.trim();
      if (!text) return;
      if (p.querySelector('a.btn') && !p.textContent.replace(p.querySelector('a.btn').textContent, '').trim()) return;

      const clone = p.cloneNode(true);
      // Remove any nested buttons from body paragraphs
      clone.querySelectorAll('a.btn').forEach((btn) => btn.remove());
      if (clone.textContent.trim()) {
        const bodyP = document.createElement('p');
        bodyP.textContent = clone.textContent.trim();
        contentEl.appendChild(bodyP);
      }
    });

    // Get CTA buttons
    const buttons = heroMain.querySelectorAll('a.btn');
    buttons.forEach((btn) => {
      const link = document.createElement('a');
      link.textContent = btn.textContent.trim();
      try {
        const url = new URL(btn.href, 'https://www.anz.com.au');
        ['mboxid', 'adobe_mc'].forEach((param) => url.searchParams.delete(param));
        link.href = url.pathname + url.search;
      } catch (e) {
        link.href = btn.getAttribute('href') || '#';
      }
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.appendChild(link);
      p.appendChild(strong);
      contentEl.appendChild(p);
    });
  }

  // Build cells: Row 1 = image, Row 2 = content
  const cells = [];
  if (imageEl) {
    cells.push([imageEl]);
  }
  cells.push([contentEl]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Hero',
    cells,
  });
  element.replaceWith(block);
}
