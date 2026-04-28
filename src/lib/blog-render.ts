import { loadExportedPage, replaceInBody, replaceInHead, type ExportedPage } from "@/lib/webflow-export";
import { renderPortableTextToHtml } from "@/lib/sanity/render-portable-text";

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  thumbnailUrl?: string;
  content?: unknown[];
  contentHtml: string;
  publishedAt?: string;
}

export interface MarqueeLogo {
  _id: string;
  name: string;
  slug: string;
  logoUrl: string;
  altText?: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function renderBlogIndexPage(posts: BlogPost[]) {
  const page = loadExportedPage("blogs.html");
  const items = posts
    .filter((post) => Boolean(post.publishedAt))
    .map((post) => {
      const dateLabel = formatDate(post.publishedAt);
      const description = escapeHtml(post.seoDescription || "");
      const title = escapeHtml(post.title);
      const thumbnail = post.thumbnailUrl || "https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg";

      return `
        <div role="listitem" class="collection-item w-dyn-item">
          <a aria-label="Read More" href="/blogs/${post.slug}" class="blog-card w-inline-block">
            <div class="blog-img-wrapper"><img src="${thumbnail}" loading="lazy" alt="${title}" /></div>
            <div class="blog_item_content">
              <div class="spacer-16px"></div>
              <div class="text-block">${dateLabel}</div>
              <h2 class="blog-heading">${title}</h2>
              <p class="max-width-full text-style-3lines">${description}</p>
            </div>
          </a>
        </div>
      `;
    })
    .join("");

  return replaceInBody(
    page,
    /<div class="collection-list-wrapper w-dyn-list">[\s\S]*?<\/div>\s*<div class="button-center">/,
    `<div class="collection-list-wrapper w-dyn-list"><div role="list" class="collection-list w-dyn-items">${items}</div></div><div class="button-center">`
  );
}

export function renderMarqueeLogoCollection(page: ExportedPage, logos: MarqueeLogo[]) {
  const items = logos
    .map((logo) => {
      const alt = escapeHtml(logo.altText || logo.name);
      return `<div role="listitem" class="marquee-logo_item w-dyn-item"><img alt="${alt}" loading="lazy" src="${logo.logoUrl}" class="image"></div>`;
    })
    .join("");

  return replaceInBody(
    page,
    /<div class="marquee-logo_collection w-dyn-list">[\s\S]*?<\/div>\s*<div class="marquee-logo_code w-embed w-script">/,
    `<div class="marquee-logo_collection w-dyn-list"><div role="list" class="marquee-logo_list w-dyn-items">${items}</div></div><div class="marquee-logo_code w-embed w-script">`
  );
}

export function renderBlogDetailPage(post: BlogPost): ExportedPage {
  let page = loadExportedPage("detail_blogs.html");
  const title = escapeHtml(post.seoTitle || post.title);
  const description = escapeHtml(post.seoDescription || "");
  const canonical = `https://www.turtleci.io/blogs/${post.slug}`;
  const dateLabel = formatDate(post.publishedAt);
  const contentHtml = Array.isArray(post.content) && post.content.length > 0
    ? renderPortableTextToHtml(post.content)
    : post.contentHtml;

  page = replaceInHead(page, /<title><\/title>/, `<title>${title}</title>`);
  page = replaceInHead(page, /<meta content="" name="description">/, `<meta content="${description}" name="description">`);
  page = replaceInHead(page, /<meta content="" property="og:title">/, `<meta content="${title}" property="og:title">`);
  page = replaceInHead(page, /<meta content="" property="og:description">/, `<meta content="${description}" property="og:description">`);
  page = replaceInHead(page, /<meta content="" property="twitter:title">/, `<meta content="${title}" property="twitter:title">`);
  page = replaceInHead(page, /<meta content="" property="twitter:description">/, `<meta content="${description}" property="twitter:description">`);
  page = replaceInHead(page, /<meta content="" property="og:image">/, `<meta content="${post.thumbnailUrl || ""}" property="og:image">`);
  page = replaceInHead(page, /<meta content="" property="twitter:image">/, `<meta content="${post.thumbnailUrl || ""}" property="twitter:image">`);
  page = replaceInHead(page, /<link href="https:\/\/www\.turtleci\.io\/detail_blogs" rel="canonical">/, `<link href="${canonical}" rel="canonical">`);

  page = replaceInBody(
    page,
    /<h1 class="text-color-brand heading-style-h2 w-dyn-bind-empty"><\/h1>/,
    `<h1 class="text-color-brand heading-style-h2">${escapeHtml(post.title)}</h1>`
  );
  page = replaceInBody(
    page,
    /<p class="w-dyn-bind-empty"><\/p>/,
    `<p>${dateLabel ? `${dateLabel}${description ? " | " : ""}` : ""}${description}</p>`
  );
  page = replaceInBody(
    page,
    /<div class="text-rich-text w-dyn-bind-empty w-richtext"><\/div>/,
    `<div class="text-rich-text w-richtext">${contentHtml}</div>`
  );

  return page;
}
