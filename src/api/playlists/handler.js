/* eslint-disable no-unused-vars */
const autoBind = require('auto-bind');

class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h){
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._service.addPlaylist({name, owner: credentialId});
        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response
    }

    async getPlaylistHandler(request, h){
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(credentialId);
        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request, h){
        const {id} = request.params;
        const { id: credentialId } = request.auth.credentials;
        await this._service.verifyPlaylistOwner(id, credentialId);
        await this._service.deletePlaylistById(id);
        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }

    async postSongByPlaylistIdHandler(request, h){
        this._validator.validatePlaylistByIdPayload(request.payload);
        const { songId } = request.payload;
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;
        await this._service.verifyPlaylistAccess(id, credentialId);
        await this._service.addSongToPlaylist(id, songId);
        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambah ke playlist'
        });
        response.code(201);
        return response;
    }

    async getPlaylistByIdHandler(request, h){
        this._validator.validatePlaylistByIdPayload(request.payload);
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;
        await this._service.verifyPlaylistAccess(id, credentialId);
        const playlist = await this._service.getPlaylistById(id);
        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deleteSongByPlaylistIdHandler(request, h){
        this._validator.validateDeleteSongByIdInPlaylistPayload(request.payload);
        const { songId } = request.payload;
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;
        await this._service.verifyPlaylistOwner(id, credentialId);
        await this._service.deleteSongInPlaylist(id, songId)
        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }
}
module.exports = PlaylistsHandler;