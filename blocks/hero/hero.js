export default function decorate(block) {
  // The hero block has two rows: [image] [text content]
  // We need the image to be an absolute-positioned background
  const rows = [...block.children];
  if (rows.length < 2) return;

  const imageRow = rows[0];
  const contentRow = rows[1];

  // Ensure the image row has the picture element for background display
  const pic = imageRow.querySelector('picture');
  if (pic) {
    imageRow.textContent = '';
    imageRow.append(pic);
  }

  // Mark content row for styling
  contentRow.classList.add('hero-content');
}
