import type { GlobalConfig } from 'payload'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'


export const FaqPage: GlobalConfig = {
    slug: 'faq-page',        // API endpoint: /api/globals/about-page
    admin: {
        group: "Pages"
    },
    access: {
        read: () => true,        // Public read access
        update: ({ req: { user } }) => Boolean(user),  // Only logged-in users can edit
    },
    fields: [
        {
            name: 'faqItems',
            type: 'array',
            fields: [
                {
                    name: "question",
                    type: "text",
                    required: true
                },
                {
                    name: "answer",
                    type: 'richText',
                    required: true,
                    editor: lexicalEditor({
                        features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
                    })
                },
            ]
        },
    ],
}