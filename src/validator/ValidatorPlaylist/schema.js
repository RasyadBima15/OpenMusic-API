const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
    name: Joi.string().required(),
});

const PlaylistByIdPayloadSchema = Joi.object({
    songId: Joi.string().required(),
})

const SongByIdInPlaylistPayloadSchema = Joi.object({
    songId: Joi.string().required(),
})
module.exports = { PlaylistPayloadSchema, PlaylistByIdPayloadSchema, SongByIdInPlaylistPayloadSchema };