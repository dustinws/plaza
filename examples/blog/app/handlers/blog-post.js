// Types
const { Task } = require('@dustinws/fantasy');
const { Handler } = require('../../../../lib/core');

// Helpers
const R = require('ramda');
const { ok } = require('../../../../lib/core');
const { MongoCollection } = require('../../../../lib/persist');
const { pipeHandlers, getBody, getParams } = require('../../../../lib/core');

// Services
const Query = require('../services/query');
const Guard = require('../services/guard');

const { ask, updateResponse } = Handler;

const withPosts = (...handlers) =>
  pipeHandlers(MongoCollection('posts'), ...handlers);

// Get a single blog post by it's id
//:: Handler(Env)
const getBlogPost = withPosts(
  Guard.Params({ id: R.is(String) }),
  Query('dbResult', e => e.posts.findOneById(getParams(e).id)),
  ask().chain(e => updateResponse(r => r.chain(ok(e.dbResult))))
);

// Get a list of all blog posts
//:: Handler(Env)
const getBlogPosts = withPosts(
  Query('dbResult', e => e.posts.find({})),
  ask().chain(e => updateResponse(r => r.chain(ok(e.dbResult))))
);

// Create a new blog post
//:: Handler(Env)
const postBlogPost = withPosts(
  Guard({
    title: R.is(String),
    body: R.is(String),
  }),
  Query('dbResult', e => e.posts.insert(getBody(e))),
  ask().chain(e => updateResponse(r => r.chain(ok(e.dbResult))))
);

// Update an existing post by it's id
//:: Handler(Env)
const putBlogPost = withPosts(
  Query('n/a', e => e.posts.updateById(getParams(e).id, getBody(e))),
  Query('dbResult', e => e.posts.findOneById(getParams(e).id)),
  ask().chain(e => updateResponse(r => r.chain(ok(e.dbResult))))
);

// Delete an existing post by it's id
//:: Handler(Env)
const deleteBlogPost = withPosts(
  Query('n/a', e => e.posts.removeById(getParams(e).id)),
  ask().chain(e => updateResponse(r => r.chain(ok({ ok: true }))))
);

module.exports = {
  getBlogPost,
  getBlogPosts,
  postBlogPost,
  putBlogPost,
  deleteBlogPost,
};
