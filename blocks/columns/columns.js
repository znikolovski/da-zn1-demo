export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // remove duplicate consecutive images (same src appearing twice)
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const paragraphs = [...col.querySelectorAll('p')];
      for (let i = paragraphs.length - 1; i > 0; i -= 1) {
        const prevImg = paragraphs[i - 1].querySelector('img');
        const currImg = paragraphs[i].querySelector('img');
        if (prevImg && currImg && prevImg.src === currImg.src) {
          paragraphs[i].remove();
        }
      }
    });
  });

  // detect calculator grid pattern (column with a ul list)
  const ul = block.querySelector('ul');
  if (ul && ul.querySelectorAll('li').length >= 4) {
    block.classList.add('columns-calculator-grid');
  }

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
      // Also detect columns with only img tags (no picture wrapper)
      if (!pic) {
        const imgs = col.querySelectorAll('img');
        const nonImgContent = [...col.children].some((child) => {
          if (child.tagName === 'P' && child.children.length === 1 && child.querySelector('img')) return false;
          if (child.tagName === 'P' && child.textContent.trim() === '' && child.querySelector('img')) return false;
          return child.textContent.trim() !== '';
        });
        if (imgs.length > 0 && !nonImgContent) {
          col.classList.add('columns-img-col');
        }
      }
    });
  });
}
