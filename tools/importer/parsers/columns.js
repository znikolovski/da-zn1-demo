/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Handles multiple ANZ column layout patterns:
 * - 4-column (.container--four-columns)
 * - 3-column (.container--three-columns)
 * - 2-column main/aside (.container--eightfour, .container--foureight)
 * - Notice card (.border.box--pale-blue)
 * - Calculator grid (.inpagenav inside container)
 */

function cleanLinks(el) {
  el.querySelectorAll('a').forEach((a) => {
    try {
      const href = a.getAttribute('href');
      if (!href) return;
      const url = new URL(href, 'https://www.anz.com.au');
      ['mboxid', 'adobe_mc'].forEach((param) => url.searchParams.delete(param));
      // Convert absolute ANZ URLs to relative
      if (url.hostname.includes('anz.com.au')) {
        a.href = url.pathname + url.search;
      } else {
        a.href = url.toString();
      }
    } catch (e) { /* keep original */ }
  });
  // Remove empty icon spans
  el.querySelectorAll('span.icon').forEach((span) => {
    if (!span.textContent.trim()) span.remove();
  });
}

function extractColumnContent(item, document) {
  const col = document.createElement('div');
  // Look for meaningful content inside the column item
  const boxTop = item.querySelector('.box--top') || item;
  const textParts = boxTop.querySelectorAll('.text.parbase, .textimage.parbase, .text');

  if (textParts.length > 0) {
    textParts.forEach((part) => {
      // Clone headings, paragraphs, lists, links, images
      const elements = part.querySelectorAll('h1, h2, h3, h4, p, ul, ol, img, a.btn');
      elements.forEach((el) => {
        const clone = el.cloneNode(true);
        cleanLinks(clone);

        // Handle pill/badge spans
        clone.querySelectorAll('.pill--text--dark').forEach((pill) => {
          const em = document.createElement('em');
          em.textContent = pill.textContent.trim();
          pill.replaceWith(em);
        });

        // Handle superscript footnotes - simplify
        clone.querySelectorAll('sup.active').forEach((sup) => {
          const text = sup.textContent.trim();
          const simpleSup = document.createElement('sup');
          simpleSup.textContent = text;
          sup.replaceWith(simpleSup);
        });

        // Skip empty elements
        if (!clone.textContent.trim() && !clone.querySelector('img')) return;

        // Handle CTA buttons - wrap in strong for EDS
        if (clone.tagName === 'A' && clone.classList.contains('btn')) {
          const p = document.createElement('p');
          const strong = document.createElement('strong');
          const link = document.createElement('a');
          link.textContent = clone.textContent.trim();
          link.href = clone.getAttribute('href') || '#';
          strong.appendChild(link);
          p.appendChild(strong);
          col.appendChild(p);
          return;
        }

        col.appendChild(clone);
      });
    });
  }

  // Fallback: extract direct content from item if no text.parbase found
  if (!col.hasChildNodes()) {
    const headings = item.querySelectorAll('h1, h2, h3, h4');
    const paras = item.querySelectorAll('p');
    const lists = item.querySelectorAll('ul, ol');
    const images = item.querySelectorAll('img');
    const links = item.querySelectorAll('a');

    headings.forEach((h) => col.appendChild(h.cloneNode(true)));
    paras.forEach((p) => {
      const clone = p.cloneNode(true);
      cleanLinks(clone);
      if (clone.textContent.trim() || clone.querySelector('img')) {
        col.appendChild(clone);
      }
    });
    lists.forEach((l) => col.appendChild(l.cloneNode(true)));
    if (images.length > 0 && !col.querySelector('img')) {
      images.forEach((img) => col.appendChild(img.cloneNode(true)));
    }
    if (!col.hasChildNodes() && links.length > 0) {
      links.forEach((a) => {
        const clone = a.cloneNode(true);
        cleanLinks(clone);
        const p = document.createElement('p');
        p.appendChild(clone);
        col.appendChild(p);
      });
    }
  }

  return col;
}

function handleCalculatorGrid(element, document) {
  // Special handler for .inpagenav calculator grid
  const inpagenav = element.querySelector('.inpagenav') || element;
  const items = inpagenav.querySelectorAll('.inpage-nav__link');

  // Extract heading from the section (it's in .container__main)
  const headingContainer = element.querySelector('.container__items.container__main');
  const heading = headingContainer ? headingContainer.querySelector('h2') : null;
  const headingCol = document.createElement('div');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    headingCol.appendChild(h2);
  }

  // Build grid content for the aside column
  const gridCol = document.createElement('div');
  const ul = document.createElement('ul');

  items.forEach((item) => {
    const link = item.querySelector('a');
    if (!link) return;
    const icon = link.querySelector('.inpage-nav__svg-icon img');
    const text = link.querySelector('.inpage-nav__link-text');
    if (!text) return;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = text.textContent.trim();
    try {
      const url = new URL(link.href, 'https://www.anz.com.au');
      a.href = url.pathname;
    } catch (e) {
      a.href = link.getAttribute('href') || '#';
    }
    li.appendChild(a);
    ul.appendChild(li);
  });
  gridCol.appendChild(ul);

  // Also check for "See all" link below the grid
  const seeAllLink = element.querySelector('.container__aside .text--html-blue-link');
  if (seeAllLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.textContent = seeAllLink.textContent.trim();
    try {
      const url = new URL(seeAllLink.href, 'https://www.anz.com.au');
      a.href = url.pathname;
    } catch (e) {
      a.href = seeAllLink.getAttribute('href') || '#';
    }
    p.appendChild(a);
    gridCol.appendChild(p);
  }

  return [[headingCol, gridCol]];
}

export default function parse(element, { document }) {
  // Check for calculator grid (.inpagenav)
  if (element.querySelector('.inpagenav') || element.classList.contains('inpagenav')) {
    const cells = handleCalculatorGrid(element, document);
    if (cells.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
      element.replaceWith(block);
      return;
    }
  }

  // Detect layout type
  const mainContainer = element.querySelector('.container__items.container__main');
  const asideContainer = element.querySelector('.container__items.container__aside');

  if (mainContainer && asideContainer) {
    // 2-column layout (main + aside)
    const mainItems = mainContainer.querySelectorAll(':scope > .aem__component > .container__item');
    const asideItems = asideContainer.querySelectorAll(':scope > .aem__component > .container__item');

    const mainCol = document.createElement('div');
    mainItems.forEach((item) => {
      const content = extractColumnContent(item, document);
      while (content.firstChild) mainCol.appendChild(content.firstChild);
    });

    const asideCol = document.createElement('div');
    asideItems.forEach((item) => {
      const content = extractColumnContent(item, document);
      while (content.firstChild) asideCol.appendChild(content.firstChild);
    });

    // Skip if both columns are empty
    if (!mainCol.hasChildNodes() && !asideCol.hasChildNodes()) return;

    const cells = [[mainCol, asideCol]];
    const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
    element.replaceWith(block);
    return;
  }

  // Multi-column layout (3 or 4 columns)
  const items = element.querySelectorAll('.container__item.container__main__element');

  if (items.length > 1) {
    const columns = [];
    items.forEach((item) => {
      const col = extractColumnContent(item, document);
      if (col.hasChildNodes()) {
        columns.push(col);
      }
    });

    if (columns.length > 0) {
      const cells = [columns];
      const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
      element.replaceWith(block);
      return;
    }
  }

  // Single-column / notice card fallback
  if (items.length === 1 || element.classList.contains('border')) {
    const col = extractColumnContent(items[0] || element, document);
    if (col.hasChildNodes()) {
      const cells = [[col]];
      const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells });
      element.replaceWith(block);
    }
  }
}
