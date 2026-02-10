import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
    update: ({ req: { user } }) => {
    return Boolean(user)
  },
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
      defaultValue: 'Samboni',
    },
    {
      name: 'brandLink',
      type: 'text',
      required: true,
      defaultValue: '/',
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'showOnSite',
          type: 'checkbox',
          defaultValue: false,
        }
      ],
    },
  ],
}