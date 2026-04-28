import { defineField, defineType } from "sanity";

export const marqueeLogoType = defineType({
  name: "marqueeLogo",
  title: "Marquee Logo",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name"
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "logo",
      title: "Logo Image",
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
      name: "logoUrl",
      title: "Legacy Logo URL",
      type: "url",
      description: "Used by migrated content. New entries can upload a logo image instead."
    }),
    defineField({
      name: "altText",
      title: "Alt Text",
      type: "string"
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
      title: "name",
      subtitle: "slug.current",
      media: "logo"
    }
  }
});
