const Joi = require('joi');

const mimHeaderSchema = Joi.object({
    cover: Joi.object({
        pipe: Joi.func().required(),
        hapi: Joi.object({
          filename: Joi.string().required(),
          headers: Joi.object({
            'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').required(),
          }).unknown(),
        }).required(),
      }).unknown(),
}).unknown();
module.exports = { mimHeaderSchema };