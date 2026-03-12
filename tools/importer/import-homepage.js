/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import alertBannerParser from './parsers/alert-banner.js';
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import anzCleanupTransformer from './transformers/anz-cleanup.js';
import anzSectionsTransformer from './transformers/anz-sections.js';

// PARSER REGISTRY
const parsers = {
  'alert-banner': alertBannerParser,
  'hero': heroParser,
  'columns': columnsParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'ANZ personal banking homepage with hero banner, quick links, feature sections, calculators, app promo, and support sections',
  urls: [
    'https://www.anz.com.au/personal'
  ],
  blocks: [
    {
      name: 'alert-banner',
      instances: ['.butter-bar']
    },
    {
      name: 'hero',
      instances: ['.hero.hero--fivefourthree-logon']
    },
    {
      name: 'columns',
      instances: ['.container--four-columns', '.container--three-columns', '.border.box--pale-blue', '.container--eightfour', '.container--foureight']
    },
    {
      name: 'accordion',
      instances: ['.accordion.accordion--open']
    }
  ],
  sections: [
    {
      id: 'section-1-alert-banner',
      name: 'Alert Banner',
      selector: '.butter-bar',
      style: 'light-grey',
      blocks: ['alert-banner'],
      defaultContent: []
    },
    {
      id: 'section-2-hero',
      name: 'Hero Banner',
      selector: '.hero--container',
      style: null,
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-3-banking-with-anz',
      name: 'Banking with ANZ',
      selector: '.container--four-columns',
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-4-notice',
      name: 'Federal Court Notice',
      selector: '.border.box--pale-blue',
      style: 'light-grey',
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-5-your-money-matters',
      name: 'Your Money Matters',
      selector: '.container--four.container--three-columns',
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-6-cost-of-living',
      name: 'Cost of Living Support',
      selector: ".columns:has(h2:contains('Cost of living'))",
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-7-calculators',
      name: 'Calculators and Tools',
      selector: '.inpagenav',
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-8-anz-plus',
      name: 'ANZ Plus App Promo',
      selector: '.container--matchheight.container--three-columns',
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-9-need-help',
      name: 'Need Help',
      selector: ".columns:has(h2:contains('Need help'))",
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-10-important-info',
      name: 'Important Information',
      selector: '.accordion.accordion--open',
      style: null,
      blocks: ['accordion'],
      defaultContent: []
    },
    {
      id: 'section-11-footer',
      name: 'Footer',
      selector: 'footer.footer',
      style: 'light-grey',
      blocks: [],
      defaultContent: []
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  anzCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [anzSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      } catch (e) {
        console.warn(`Block "${blockDef.name}" selector error: ${selector}`, e);
      }
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (section breaks + metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
