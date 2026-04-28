import { defineField, defineType } from "sanity";

export const carouselItemType = defineType({
  name: "carouselItem",
  title: "Carousel Item",
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
        source: "title"
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "description",
      title: "Description",
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
      type: "url"
    }),
    defineField({
      name: "legacyItemId",
      title: "Legacy Item ID",
      type: "string",
      hidden: true,
      readOnly: true
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "thumbnail"
    }
  }
});
