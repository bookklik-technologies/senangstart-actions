import { defineConfig } from 'vitepress'
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

const require = createRequire(import.meta.url)
const pkg = require('../../package.json')

// Shared sidebar items
const directivesEN = [
  { text: 'Overview', link: '/directives/' },
  { text: 'ss-data', link: '/directives/ss-data' },
  { text: 'ss-text', link: '/directives/ss-text' },
  { text: 'ss-html', link: '/directives/ss-html' },
  { text: 'ss-show', link: '/directives/ss-show' },
  { text: 'ss-if', link: '/directives/ss-if' },
  { text: 'ss-for', link: '/directives/ss-for' },
  { text: 'ss-model', link: '/directives/ss-model' },
  { text: 'ss-bind', link: '/directives/ss-bind' },
  { text: 'ss-on', link: '/directives/ss-on' },
  { text: 'ss-ref', link: '/directives/ss-ref' },
  { text: 'ss-init', link: '/directives/ss-init' },
  { text: 'ss-effect', link: '/directives/ss-effect' },
  { text: 'ss-transition', link: '/directives/ss-transition' },
  { text: 'ss-cloak', link: '/directives/ss-cloak' },
  { text: 'ss-id', link: '/directives/ss-id' },
  { text: 'ss-teleport', link: '/directives/ss-teleport' }
]

const directivesMS = [
  { text: 'Gambaran', link: '/ms/directives/' },
  { text: 'ss-data', link: '/ms/directives/ss-data' },
  { text: 'ss-text', link: '/ms/directives/ss-text' },
  { text: 'ss-html', link: '/ms/directives/ss-html' },
  { text: 'ss-show', link: '/ms/directives/ss-show' },
  { text: 'ss-if', link: '/ms/directives/ss-if' },
  { text: 'ss-for', link: '/ms/directives/ss-for' },
  { text: 'ss-model', link: '/ms/directives/ss-model' },
  { text: 'ss-bind', link: '/ms/directives/ss-bind' },
  { text: 'ss-on', link: '/ms/directives/ss-on' },
  { text: 'ss-ref', link: '/ms/directives/ss-ref' },
  { text: 'ss-init', link: '/ms/directives/ss-init' },
  { text: 'ss-effect', link: '/ms/directives/ss-effect' },
  { text: 'ss-transition', link: '/ms/directives/ss-transition' },
  { text: 'ss-cloak', link: '/ms/directives/ss-cloak' },
  { text: 'ss-id', link: '/ms/directives/ss-id' },
  { text: 'ss-teleport', link: '/ms/directives/ss-teleport' }
]

const apiEN = [
  { text: 'Overview', link: '/api/' },
  { text: 'data()', link: '/api/data' },
  { text: 'store()', link: '/api/store' },
  { text: 'init()', link: '/api/init' },
  { text: 'start()', link: '/api/start' }
]

const apiMS = [
  { text: 'Gambaran', link: '/ms/api/' },
  { text: 'data()', link: '/ms/api/data' },
  { text: 'store()', link: '/ms/api/store' },
  { text: 'init()', link: '/ms/api/init' },
  { text: 'start()', link: '/ms/api/start' }
]

const propertiesEN = [
  { text: 'Overview', link: '/properties/' },
  { text: '$refs', link: '/properties/refs' },
  { text: '$store', link: '/properties/store' },
  { text: '$el', link: '/properties/el' },
  { text: '$event', link: '/properties/event' },
  { text: '$dispatch', link: '/properties/dispatch' },
  { text: '$id', link: '/properties/id' }
]

const propertiesMS = [
  { text: 'Gambaran', link: '/ms/properties/' },
  { text: '$refs', link: '/ms/properties/refs' },
  { text: '$store', link: '/ms/properties/store' },
  { text: '$el', link: '/ms/properties/el' },
  { text: '$event', link: '/ms/properties/event' },
  { text: '$dispatch', link: '/ms/properties/dispatch' },
  { text: '$id', link: '/ms/properties/id' }
]

export default defineConfig({
  title: 'SenangStart Actions',
  description: 'A lightweight, AI-friendly, declarative JavaScript framework',
  base: '/senangstart-actions/',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: 'https://senangstart.com/img/ss_icon_accent.svg' }],
    ['script', { src: '/senangstart-actions/assets/senangstart-actions.min.js', defer: true }]
  ],
  
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    ms: {
      label: 'Bahasa Melayu',
      lang: 'ms',
      link: '/ms/',
      themeConfig: {
        nav: [
          { text: 'Utama', link: '/ms/' },
          { text: 'Panduan', link: '/ms/guide/getting-started' },
          { text: 'API', link: '/ms/api/' },
          { text: 'Arahan', link: '/ms/directives/' },
          { text: 'Sifat', link: '/ms/properties/' },
          {
            text: `v${pkg.version}`,
            items: [
              { text: 'Changelog', link: '/changelog' },
              { text: 'GitHub', link: 'https://github.com/bookklik-technologies/senangstart-actions' }
            ]
          }
        ],
        sidebar: [
          {
            text: 'Pengenalan',
            items: [
              { text: 'Mula Menggunakan', link: '/ms/guide/getting-started' }
            ]
          },
          {
            text: 'Rujukan API',
            collapsed: false,
            items: apiMS
          },
          {
            text: 'Arahan',
            collapsed: false,
            items: directivesMS
          },
          {
            text: 'Sifat',
            collapsed: false,
            items: propertiesMS
          }
        ]
      }
    }
  },
  
  themeConfig: {
    logo: '/assets/ss-logo.svg',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Directives', link: '/directives/' },
      { text: 'Properties', link: '/properties/' },
      {
        text: `v${pkg.version}`,
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'GitHub', link: 'https://github.com/bookklik-technologies/senangstart-actions' }
        ]
      }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' }
        ]
      },
      {
        text: 'API Reference',
        collapsed: false,
        items: apiEN
      },
      {
        text: 'Directives',
        collapsed: false,
        items: directivesEN
      },
      {
        text: 'Properties',
        collapsed: false,
        items: propertiesEN
      }
    ],

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bookklik-technologies/senangstart-actions' }
    ],

    footer: {
      message: 'SenangStart Actions v' + pkg.version + ' is part of the <a href="https://senangstart.com/" target="_blank" style="color: var(--vp-c-brand)">SenangStart</a> ecosystem.',
      copyright: `Copyright © ${new Date().getFullYear()} <a href="https://bookklik.com/" target="_blank" style="color: #ff6600">Bookklik Technologies</a>. Released under the MIT License.`
    }
  }
})
