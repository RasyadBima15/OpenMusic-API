const { PlaylistPayloadSchema, PlaylistByIdPayloadSchema, SongByIdInPlaylistPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const PlaylistsValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = PlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validatePlaylistByIdPayload: (payload) => {
        const validationResult = PlaylistByIdPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateDeleteSongByIdInPlaylistPayload: (payload) => {
        const validationResult = SongByIdInPlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}
module.exports = PlaylistsValidator;