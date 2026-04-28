export const blogPostsQuery = `
  *[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    seoTitle,
    seoDescription,
    "thumbnailUrl": coalesce(thumbnail.asset->url, thumbnailUrl),
    content,
    contentHtml,
    publishedAt
  }
`;

export const blogPostBySlugQuery = `
  *[_type == "blogPost" && slug.current == $slug && defined(publishedAt)][0] {
    _id,
    title,
    "slug": slug.current,
    seoTitle,
    seoDescription,
    "thumbnailUrl": coalesce(thumbnail.asset->url, thumbnailUrl),
    content[]{
      ...,
      _type == "image" => {
        ...,
        "url": asset->url
      }
    },
    contentHtml,
    publishedAt
  }
`;

export const blogPostSlugsQuery = `
  *[_type == "blogPost" && defined(slug.current) && defined(publishedAt)]{
    "slug": slug.current
  }
`;

export const marqueeLogosQuery = `
  *[_type == "marqueeLogo"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "logoUrl": coalesce(logo.asset->url, logoUrl),
    altText
  }
`;
