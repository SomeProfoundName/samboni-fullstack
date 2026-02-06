import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Articles } from './collections/Articles'
import { Navigation } from './globals/Navigation'

import { shopifyEndpoints } from './endpoints/shopify'
import { shopifyCartEndpoints } from './endpoints/shopifyCart'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Articles],
  globals: [Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // cors: [
  //   'http://localhost:4321',
  //   'http://localhost:4322',
  //   'http://localhost:4323',
  //   process.env.FRONTEND_URL || '',
  // ].filter(Boolean),
  // csrf: [
  //   'http://localhost:4321',
  //   'http://localhost:4322',
  //   'http://localhost:4323',
  //   process.env.FRONTEND_URL || '',
  // ].filter(Boolean),
  endpoints: [
    ...shopifyEndpoints,
    ...shopifyCartEndpoints,
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [],
})
