import type { GlobalConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  admin: {
    group: 'Pages',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'videos',
      type: 'array',
      admin: {
        description: 'Paths to video files in /public/videos/',
      },
      fields: [
        {
          name: 'path',
          type: 'text',
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
      }),
    },
  ],
}