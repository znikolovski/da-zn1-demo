var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/alert-banner.js
  function parse(element, { document }) {
    const textContainer = element.querySelector(".butter-bar__content") || element;
    const paragraphs = textContainer.querySelectorAll("p");
    const contentEl = document.createElement("div");
    if (paragraphs.length > 0) {
      paragraphs.forEach((p) => {
        const clone = p.cloneNode(true);
        clone.querySelectorAll("a").forEach((a) => {
          try {
            const url = new URL(a.href);
            ["mboxid", "adobe_mc"].forEach((param) => url.searchParams.delete(param));
            a.href = url.toString();
          } catch (e) {
          }
        });
        contentEl.appendChild(clone);
      });
    } else {
      const p = document.createElement("p");
      p.textContent = textContainer.textContent.trim();
      contentEl.appendChild(p);
    }
    const cells = [[contentEl]];
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Alert Banner",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero.js
  function parse2(element, { document }) {
    const bgImg = element.querySelector(".hero-frame img, .focuspoint img, .hero__image img");
    let imageEl = null;
    if (bgImg) {
      imageEl = bgImg.cloneNode(true);
    }
    const heroMain = element.querySelector(".hero__main") || element.querySelector(".hero__info");
    const contentEl = document.createElement("div");
    if (heroMain) {
      const h1 = heroMain.querySelector("h1");
      if (h1) {
        const heading = document.createElement("h1");
        heading.textContent = h1.textContent.trim();
        contentEl.appendChild(heading);
      }
      const paragraphs = heroMain.querySelectorAll(".text.parbase p");
      paragraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (!text) return;
        if (p.querySelector("a.btn") && !p.textContent.replace(p.querySelector("a.btn").textContent, "").trim()) return;
        const clone = p.cloneNode(true);
        clone.querySelectorAll("a.btn").forEach((btn) => btn.remove());
        if (clone.textContent.trim()) {
          const bodyP = document.createElement("p");
          bodyP.textContent = clone.textContent.trim();
          contentEl.appendChild(bodyP);
        }
      });
      const buttons = heroMain.querySelectorAll("a.btn");
      buttons.forEach((btn) => {
        const link = document.createElement("a");
        link.textContent = btn.textContent.trim();
        try {
          const url = new URL(btn.href, "https://www.anz.com.au");
          ["mboxid", "adobe_mc"].forEach((param) => url.searchParams.delete(param));
          link.href = url.pathname + url.search;
        } catch (e) {
          link.href = btn.getAttribute("href") || "#";
        }
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.appendChild(link);
        p.appendChild(strong);
        contentEl.appendChild(p);
      });
    }
    const cells = [];
    if (imageEl) {
      cells.push([imageEl]);
    }
    cells.push([contentEl]);
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Hero",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function cleanLinks(el) {
    el.querySelectorAll("a").forEach((a) => {
      try {
        const href = a.getAttribute("href");
        if (!href) return;
        const url = new URL(href, "https://www.anz.com.au");
        ["mboxid", "adobe_mc"].forEach((param) => url.searchParams.delete(param));
        if (url.hostname.includes("anz.com.au")) {
          a.href = url.pathname + url.search;
        } else {
          a.href = url.toString();
        }
      } catch (e) {
      }
    });
    el.querySelectorAll("span.icon").forEach((span) => {
      if (!span.textContent.trim()) span.remove();
    });
  }
  function extractColumnContent(item, document) {
    const col = document.createElement("div");
    const boxTop = item.querySelector(".box--top") || item;
    const textParts = boxTop.querySelectorAll(".text.parbase, .textimage.parbase, .text");
    if (textParts.length > 0) {
      textParts.forEach((part) => {
        const elements = part.querySelectorAll("h1, h2, h3, h4, p, ul, ol, img, a.btn");
        elements.forEach((el) => {
          const clone = el.cloneNode(true);
          cleanLinks(clone);
          clone.querySelectorAll(".pill--text--dark").forEach((pill) => {
            const em = document.createElement("em");
            em.textContent = pill.textContent.trim();
            pill.replaceWith(em);
          });
          clone.querySelectorAll("sup.active").forEach((sup) => {
            const text = sup.textContent.trim();
            const simpleSup = document.createElement("sup");
            simpleSup.textContent = text;
            sup.replaceWith(simpleSup);
          });
          if (!clone.textContent.trim() && !clone.querySelector("img")) return;
          if (clone.tagName === "A" && clone.classList.contains("btn")) {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            const link = document.createElement("a");
            link.textContent = clone.textContent.trim();
            link.href = clone.getAttribute("href") || "#";
            strong.appendChild(link);
            p.appendChild(strong);
            col.appendChild(p);
            return;
          }
          col.appendChild(clone);
        });
      });
    }
    if (!col.hasChildNodes()) {
      const headings = item.querySelectorAll("h1, h2, h3, h4");
      const paras = item.querySelectorAll("p");
      const lists = item.querySelectorAll("ul, ol");
      const images = item.querySelectorAll("img");
      const links = item.querySelectorAll("a");
      headings.forEach((h) => col.appendChild(h.cloneNode(true)));
      paras.forEach((p) => {
        const clone = p.cloneNode(true);
        cleanLinks(clone);
        if (clone.textContent.trim() || clone.querySelector("img")) {
          col.appendChild(clone);
        }
      });
      lists.forEach((l) => col.appendChild(l.cloneNode(true)));
      if (images.length > 0 && !col.querySelector("img")) {
        images.forEach((img) => col.appendChild(img.cloneNode(true)));
      }
      if (!col.hasChildNodes() && links.length > 0) {
        links.forEach((a) => {
          const clone = a.cloneNode(true);
          cleanLinks(clone);
          const p = document.createElement("p");
          p.appendChild(clone);
          col.appendChild(p);
        });
      }
    }
    return col;
  }
  function handleCalculatorGrid(element, document) {
    const inpagenav = element.querySelector(".inpagenav") || element;
    const items = inpagenav.querySelectorAll(".inpage-nav__link");
    const headingContainer = element.querySelector(".container__items.container__main");
    const heading = headingContainer ? headingContainer.querySelector("h2") : null;
    const headingCol = document.createElement("div");
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.trim();
      headingCol.appendChild(h2);
    }
    const gridCol = document.createElement("div");
    const ul = document.createElement("ul");
    items.forEach((item) => {
      const link = item.querySelector("a");
      if (!link) return;
      const icon = link.querySelector(".inpage-nav__svg-icon img");
      const text = link.querySelector(".inpage-nav__link-text");
      if (!text) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = text.textContent.trim();
      try {
        const url = new URL(link.href, "https://www.anz.com.au");
        a.href = url.pathname;
      } catch (e) {
        a.href = link.getAttribute("href") || "#";
      }
      li.appendChild(a);
      ul.appendChild(li);
    });
    gridCol.appendChild(ul);
    const seeAllLink = element.querySelector(".container__aside .text--html-blue-link");
    if (seeAllLink) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.textContent = seeAllLink.textContent.trim();
      try {
        const url = new URL(seeAllLink.href, "https://www.anz.com.au");
        a.href = url.pathname;
      } catch (e) {
        a.href = seeAllLink.getAttribute("href") || "#";
      }
      p.appendChild(a);
      gridCol.appendChild(p);
    }
    return [[headingCol, gridCol]];
  }
  function parse3(element, { document }) {
    if (element.querySelector(".inpagenav") || element.classList.contains("inpagenav")) {
      const cells = handleCalculatorGrid(element, document);
      if (cells.length > 0) {
        const block = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
        element.replaceWith(block);
        return;
      }
    }
    const mainContainer = element.querySelector(".container__items.container__main");
    const asideContainer = element.querySelector(".container__items.container__aside");
    if (mainContainer && asideContainer) {
      const mainItems = mainContainer.querySelectorAll(":scope > .aem__component > .container__item");
      const asideItems = asideContainer.querySelectorAll(":scope > .aem__component > .container__item");
      const mainCol = document.createElement("div");
      mainItems.forEach((item) => {
        const content = extractColumnContent(item, document);
        while (content.firstChild) mainCol.appendChild(content.firstChild);
      });
      const asideCol = document.createElement("div");
      asideItems.forEach((item) => {
        const content = extractColumnContent(item, document);
        while (content.firstChild) asideCol.appendChild(content.firstChild);
      });
      if (!mainCol.hasChildNodes() && !asideCol.hasChildNodes()) return;
      const cells = [[mainCol, asideCol]];
      const block = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
      element.replaceWith(block);
      return;
    }
    const items = element.querySelectorAll(".container__item.container__main__element");
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
        const block = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
        element.replaceWith(block);
        return;
      }
    }
    if (items.length === 1 || element.classList.contains("border")) {
      const col = extractColumnContent(items[0] || element, document);
      if (col.hasChildNodes()) {
        const cells = [[col]];
        const block = WebImporter.Blocks.createBlock(document, { name: "Columns", cells });
        element.replaceWith(block);
      }
    }
  }

  // tools/importer/parsers/accordion.js
  function parse4(element, { document }) {
    const cells = [];
    const trigger = element.querySelector(".accordion__trigger, .accordion__button");
    const heading = trigger ? trigger.querySelector(".accordion__span, .accordion__heading") : null;
    const titleEl = document.createElement("div");
    if (heading) {
      const h = document.createElement("h2");
      h.textContent = heading.textContent.trim();
      titleEl.appendChild(h);
    }
    const contentArea = element.querySelector(".accordion__content");
    const contentEl = document.createElement("div");
    if (contentArea) {
      const allContent = contentArea.querySelectorAll("p");
      allContent.forEach((p) => {
        const text = p.textContent.trim();
        if (!text) return;
        const clone = p.cloneNode(true);
        clone.querySelectorAll("a").forEach((a) => {
          if (a.classList.contains("back-to-origin")) {
            a.remove();
            return;
          }
          try {
            const href = a.getAttribute("href");
            if (!href || href === "#") return;
            const url = new URL(href, "https://www.anz.com.au");
            ["mboxid", "adobe_mc"].forEach((param) => url.searchParams.delete(param));
            if (url.hostname.includes("anz.com.au")) {
              a.href = url.pathname + url.search;
            } else {
              a.href = url.toString();
            }
          } catch (e) {
          }
        });
        clone.querySelectorAll(".text--grayscale-45, .text--grayscale-50").forEach((span) => {
          span.replaceWith(...span.childNodes);
        });
        clone.querySelectorAll(".dis-number").forEach((span) => {
          span.replaceWith(span.textContent);
        });
        clone.querySelectorAll(".screen-reader-only").forEach((span) => span.remove());
        if (!clone.textContent.trim()) return;
        contentEl.appendChild(clone);
      });
      contentArea.querySelectorAll("a.back-to-origin").forEach((a) => a.remove());
    }
    if (titleEl.hasChildNodes() && contentEl.hasChildNodes()) {
      cells.push([titleEl, contentEl]);
    }
    if (cells.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, {
        name: "Accordion",
        cells
      });
      element.replaceWith(block);
    }
  }

  // tools/importer/transformers/anz-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "noscript"
      ]);
      element.querySelectorAll(".invisibleMbox").forEach((mbox) => {
        while (mbox.firstChild) {
          mbox.parentNode.insertBefore(mbox.firstChild, mbox);
        }
        mbox.remove();
      });
      const nested = element.querySelectorAll("span > span:only-child");
      nested.forEach((span) => {
        if (span.children.length === 0) {
          span.parentElement.replaceWith(span.parentElement.textContent);
        }
      });
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        // Header/navigation (from captured DOM: .header--wrapper, header, .primary__nav)
        ".header--wrapper",
        "header",
        // Footer (from captured DOM: footer.footer, .footer_layout)
        "footer.footer",
        ".footer_layout",
        // Skip links (from captured DOM: #skiptocontent)
        "#skiptocontent",
        // Hero breadcrumb bar / utility links inside hero (from captured DOM)
        ".hero__breadcrumb",
        // Hero control aside (empty parsys, from captured DOM)
        ".hero--control__aside",
        // Back to top button
        ".scrollTop",
        // iframes and link elements
        "iframe",
        "link",
        // Empty containers / parsys inherited
        ".par.iparys_inherited",
        ".newpar.new.section",
        // Match height separators (layout-only)
        ".match-height--separator",
        // Empty divs from AEM structure
        ".end"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("data-analytics");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/anz-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function findElement(root, selector) {
    const doc = root.ownerDocument || root.getRootNode() || root;
    const searchRoots = [root, doc];
    const hasContainsMatch = selector.match(/^(.+?):has\((.+?):contains\(\s*'([^']+)'\s*\)\)$/);
    if (hasContainsMatch) {
      const [, baseSelector, innerSelector, text] = hasContainsMatch;
      for (const searchRoot of searchRoots) {
        try {
          const candidates = searchRoot.querySelectorAll(baseSelector);
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
            } catch (e) {
            }
          }
          if (lastMatch) return lastMatch;
        } catch (e) {
        }
      }
      return null;
    }
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
        } catch (e) {
        }
      }
      return null;
    }
    for (const searchRoot of searchRoots) {
      try {
        const el = searchRoot.querySelector(selector);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName === H2.before) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const document = element.ownerDocument || element.getRootNode();
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
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        const isFirst = sectionsOriginal.indexOf(section) === 0;
        if (!isFirst) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "alert-banner": parse,
    "hero": parse2,
    "columns": parse3,
    "accordion": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "ANZ personal banking homepage with hero banner, quick links, feature sections, calculators, app promo, and support sections",
    urls: [
      "https://www.anz.com.au/personal"
    ],
    blocks: [
      {
        name: "alert-banner",
        instances: [".butter-bar"]
      },
      {
        name: "hero",
        instances: [".hero.hero--fivefourthree-logon"]
      },
      {
        name: "columns",
        instances: [".container--four-columns", ".container--three-columns", ".border.box--pale-blue", ".container--eightfour", ".container--foureight"]
      },
      {
        name: "accordion",
        instances: [".accordion.accordion--open"]
      }
    ],
    sections: [
      {
        id: "section-1-alert-banner",
        name: "Alert Banner",
        selector: ".butter-bar",
        style: "light-grey",
        blocks: ["alert-banner"],
        defaultContent: []
      },
      {
        id: "section-2-hero",
        name: "Hero Banner",
        selector: ".hero--container",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-3-banking-with-anz",
        name: "Banking with ANZ",
        selector: ".container--four-columns",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-4-notice",
        name: "Federal Court Notice",
        selector: ".border.box--pale-blue",
        style: "light-grey",
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-5-your-money-matters",
        name: "Your Money Matters",
        selector: ".container--four.container--three-columns",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-6-cost-of-living",
        name: "Cost of Living Support",
        selector: ".columns:has(h2:contains('Cost of living'))",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-7-calculators",
        name: "Calculators and Tools",
        selector: ".inpagenav",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-8-anz-plus",
        name: "ANZ Plus App Promo",
        selector: ".container--matchheight.container--three-columns",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-9-need-help",
        name: "Need Help",
        selector: ".columns:has(h2:contains('Need help'))",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-10-important-info",
        name: "Important Information",
        selector: ".accordion.accordion--open",
        style: null,
        blocks: ["accordion"],
        defaultContent: []
      },
      {
        id: "section-11-footer",
        name: "Footer",
        selector: "footer.footer",
        style: "light-grey",
        blocks: [],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
              section: blockDef.section || null
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
