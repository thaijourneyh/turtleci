import { defineArrayMember, defineField } from "sanity";

export const portableTextField = defineField({
  name: "content",
  title: "Content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Heading 4", value: "h4" },
        { title: "Quote", value: "blockquote" }
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" }
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
          { title: "Code", value: "code" }
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (rule) => rule.required().uri({
                  allowRelative: false,
                  scheme: ["http", "https", "mailto", "tel"]
                })
              }),
              defineField({
                name: "blank",
                title: "Open in new tab",
                type: "boolean",
                initialValue: true
              })
            ]
          })
        ]
      }
    }),
    defineArrayMember({
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
    defineArrayMember({
      name: "externalImage",
      title: "External image",
      type: "object",
      fields: [
        defineField({
          name: "url",
          title: "Image URL",
          type: "url",
          validation: (rule) => rule.required().uri({
            allowRelative: false,
            scheme: ["http", "https"]
          })
        }),
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string"
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string"
        })
      ],
      preview: {
        select: {
          title: "alt",
          subtitle: "url"
        },
        prepare(selection) {
          return {
            title: selection.title || "External image",
            subtitle: selection.subtitle
          };
        }
      }
    })
  ],
  validation: (rule) => rule.required()
});
