/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ANZ sections. Adds section breaks (<hr>) and section-metadata
 * blocks from template sections. Runs in afterTransform only.
 * Selectors from captured DOM of https://www.anz.com.au/personal/
 *
 * DOM notes: .butter-bar and footer.footer are outside <main>;
 * searched via document fallback. The .columns elements are deeply nested
 * (not siblings) due to unclosed tags in the source HTML, so we always
 * add <hr> for non-first sections without requiring previousElementSibling.
 * For :has(:contains()) selectors, we return the innermost match to avoid
 * ancestor .columns elements matching descendant text.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

/**
 * Find element by selector with :has(:contains()) JS fallback.
 * Searches root first, then document.
 * For :has(:contains()) patterns, returns the innermost (deepest) match
 * to handle nested structures where ancestor elements also match.
 */
function findElement(root, selector) {
  const doc = root.ownerDocument || root.getRootNode() || root;
  const searchRoots = [root, doc];

  // Handle :has(...:contains('text')) pattern
  const hasContainsMatch = selector.match(/^(.+?):has\((.+?):contains\(\s*'([^']+)'\s*\)\)$/);
  if (hasContainsMatch) {
    const [, baseSelector, innerSelector, text] = hasContainsMatch;
    for (const searchRoot of searchRoots) {
      try {
        const candidates = searchRoot.querySelectorAll(baseSelector);
        // Return the LAST (innermost/deepest) match, since querySelectorAll
        // returns in document order and nested elements come after ancestors
        let lastMatch = null;
        for (const candidate of candidates) {
          try {
            const inners = candidate.querySelectorAll(innerSelector);
            for (const inner of inners) {
              if (inner.textContent && inner.textContent.includes(text)) {
                lastMatch = candidate;
                break;
              }
            }
          } catch (e) { /* skip */ }
        }
        if (lastMatch) return lastMatch;
      } catch (e) { /* skip */ }
    }
    return null;
  }

  // Handle :contains('text') pattern (no :has)
  const containsMatch = selector.match(/^(.+?):contains\(\s*'([^']+)'\s*\)$/);
  if (containsMatch) {
    const [, baseSelector, text] = containsMatch;
    for (const searchRoot of searchRoots) {
      try {
        const candidates = searchRoot.querySelectorAll(baseSelector);
        let lastMatch = null;
        for (const candidate of candidates) {
          if (candidate.textContent && candidate.textContent.includes(text)) {
            lastMatch = candidate;
          }
        }
        if (lastMatch) return lastMatch;
      } catch (e) { /* skip */ }
    }
    return null;
  }

  // Standard CSS selector
  for (const searchRoot of searchRoots) {
    try {
      const el = searchRoot.querySelector(selector);
      if (el) return el;
    } catch (e) { /* skip */ }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const document = element.ownerDocument || element.getRootNode();

    // Process sections in reverse order to avoid index shifts
    const sectionsOriginal = template.sections;
    const sectionsReversed = [...sectionsOriginal].reverse();

    for (const section of sectionsReversed) {
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = findElement(element, sel);
        if (sectionEl) break;
      }

      if (!sectionEl) continue;

      // Add section-metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add section break (<hr>) before this section if it's not the first.
      // Note: We do NOT check previousElementSibling because the ANZ DOM has
      // deeply nested .columns elements (due to unclosed tags in source HTML).
      // Many section elements are the sole child of their parent, making
      // previousElementSibling null even though there is prior content.
      const isFirst = sectionsOriginal.indexOf(section) === 0;
      if (!isFirst) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
