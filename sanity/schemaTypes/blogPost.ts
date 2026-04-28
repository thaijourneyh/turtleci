import { defineField, defineType } from "sanity";
import { portableTextField } from "./portableText";

export const blogPostType = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 200
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string"
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 4
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      options: {
        hotspot: true
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string"
        })
      ]
    }),
    defineField({
      name: "thumbnailUrl",
      title: "Legacy Thumbnail URL",
      type: "url",
      description: "Used by migrated posts. New posts should prefer the uploaded thumbnail image."
    }),
    portableTextField,
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "contentHtml",
      title: "Legacy HTML Content",
      type: "text",
      hidden: true,
      rows: 12
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      hidden: true,
      readOnly: true
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      hidden: true,
      readOnly: true
    }),
    defineField({
      name: "legacyItemId",
      title: "Legacy Item ID",
      type: "string",
      hidden: true,
      readOnly: true
    }),
    defineField({
      name: "legacyCollectionId",
      title: "Legacy Collection ID",
      type: "string",
      hidden: true,
      readOnly: true
    })
  ],
  orderings: [
    {
      title: "Published date, newest",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }]
    }
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "thumbnail"
    },
    prepare(selection) {
      const date = selection.subtitle ? new Date(selection.subtitle).toLocaleDateString("en-US") : "Unscheduled";
      return {
        title: selection.title,
        subtitle: date,
        media: selection.media
      };
    }
  }
});
