import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this for ALL user/DB-sourced HTML before rendering via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    // Allow common HTML tags from WYSIWYG editors
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark',
      'ul', 'ol', 'li',
      'a', 'img', 'video', 'source', 'iframe',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
      'blockquote', 'pre', 'code',
      'div', 'span', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
      'figure', 'figcaption',
      'sup', 'sub', 'small',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height',
      'class', 'id', 'style',
      'colspan', 'rowspan', 'scope',
      'controls', 'autoplay', 'muted', 'loop', 'poster', 'type',
      'frameborder', 'allowfullscreen', 'allow',
    ],
    // Force all links to open safely
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'form', 'input', 'textarea', 'select', 'button', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  })
}
