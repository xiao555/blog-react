const sitemap = require('react-router-sitemap');
const fs = require('fs');

let articles
try {
  articles = require('./src/articles.json')
} catch (error) {
  articles = []
}

const routes = articles
  .filter(post => post.id !== 'about-me')
  .map(post => `/post/${post.slug}`)

fs.writeFileSync(
  './build/sitemap.xml',
  sitemap.sitemapBuilder('https://xiao555.github.io', ['/', ...routes, '/about']).toString()
)
