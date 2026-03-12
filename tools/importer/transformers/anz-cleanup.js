/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: ANZ cleanup. Selectors from captured DOM of https://www.anz.com.au/personal/
 * Removes non-authorable content: header, footer, nav, skip links, tracking, cookie/widgets.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove tracking-only elements (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      'noscript',
    ]);

    // Unwrap .invisibleMbox containers: keep their children, remove the wrapper.
    // These wrap significant content (e.g., the hero block) so we cannot delete them.
    element.querySelectorAll('.invisibleMbox').forEach((mbox) => {
      while (mbox.firstChild) {
        mbox.parentNode.insertBefore(mbox.firstChild, mbox);
      }
      mbox.remove();
    });

    // Unwrap nested spans that are common in ANZ source (e.g., span > span:only-child)
    const nested = element.querySelectorAll('span > span:only-child');
    nested.forEach((span) => {
      if (span.children.length === 0) {
        span.parentElement.replaceWith(span.parentElement.textContent);
      }
    });
  }

  if (hookName === H.after) {
    // Remove non-authorable site shell (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      // Header/navigation (from captured DOM: .header--wrapper, header, .primary__nav)
      '.header--wrapper',
      'header',
      // Footer (from captured DOM: footer.footer, .footer_layout)
      'footer.footer',
      '.footer_layout',
      // Skip links (from captured DOM: #skiptocontent)
      '#skiptocontent',
      // Hero breadcrumb bar / utility links inside hero (from captured DOM)
      '.hero__breadcrumb',
      // Hero control aside (empty parsys, from captured DOM)
      '.hero--control__aside',
      // Back to top button
      '.scrollTop',
      // iframes and link elements
      'iframe',
      'link',
      // Empty containers / parsys inherited
      '.par.iparys_inherited',
      '.newpar.new.section',
      // Match height separators (layout-only)
      '.match-height--separator',
      // Empty divs from AEM structure
      '.end',
    ]);

    // Remove tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('data-analytics');
      el.removeAttribute('onclick');
    });
  }
}
