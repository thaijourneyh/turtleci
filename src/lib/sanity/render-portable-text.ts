import { toHTML } from "@portabletext/to-html";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}

export function renderPortableTextToHtml(value: unknown[] = []) {
  return toHTML(value, {
    components: {
      marks: {
        link: ({ children, value }) => {
          const href = value?.href ? escapeAttribute(String(value.href)) : "#";
          const target = value?.blank ? ' target="_blank" rel="noopener noreferrer"' : "";
          return `<a href="${href}"${target}>${children}</a>`;
        }
      },
      types: {
        image: ({ value }) => {
          const src = value?.url ? escapeAttribute(String(value.url)) : "";
          if (!src) {
            return "";
          }

          const alt = value?.alt ? escapeAttribute(String(value.alt)) : "";
          return `<figure><img src="${src}" alt="${alt}" loading="lazy" />${value?.caption ? `<figcaption>${escapeHtml(String(value.caption))}</figcaption>` : ""}</figure>`;
        },
        externalImage: ({ value }) => {
          const src = value?.url ? escapeAttribute(String(value.url)) : "";
          if (!src) {
            return "";
          }

          const alt = value?.alt ? escapeAttribute(String(value.alt)) : "";
          return `<figure><img src="${src}" alt="${alt}" loading="lazy" />${value?.caption ? `<figcaption>${escapeHtml(String(value.caption))}</figcaption>` : ""}</figure>`;
        }
      }
    }
  });
}
