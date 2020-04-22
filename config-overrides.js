const PrerenderSPAPlugin = require('prerender-spa-plugin');
const path = require('path');

let articles
try {
  articles = require('./src/articles.json')
} catch (error) {
  articles = []
}

const routes = articles
  .filter(post => post.id !== 'about-me')
  .map(post => `/post/${post.slug}`)

module.exports = (config, env) => {
  if (env === 'production') {
    config.plugins = config.plugins.concat([
      new PrerenderSPAPlugin({
        routes: ['/', ...routes, '/about'],
        staticDir: path.join(__dirname, 'build'),
      }),
    ]);
  }

  return config;
};
