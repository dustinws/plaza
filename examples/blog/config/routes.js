const { Route } = require('../../../lib/core');

// Handlers
const {
  getBlogPosts,
  getBlogPost,
  postBlogPost,
  putBlogPost,
  deleteBlogPost,
} = require('../app/handlers/blog-post');

module.exports = [
  // Blog Post Routes
  Route({ method: 'GET', path: '/api/posts', handler: getBlogPosts }),
  Route({ method: 'POST', path: '/api/posts', handler: postBlogPost }),
  Route({ method: 'PUT', path: '/api/posts/:id', handler: putBlogPost }),
  Route({ method: 'GET', path: '/api/posts/:id', handler: getBlogPost }),
  Route({ method: 'DELETE', path: '/api/posts/:id', handler: deleteBlogPost }),
];
