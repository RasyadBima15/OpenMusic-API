/* eslint-disable max-classes-per-file */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, likesService, validator) {
    this._albumsService = albumsService;
    this._likesService = likesService;
    this._validator = validator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._albumsService.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async postLikeAlbumHandler(request, h){
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    await this._likesService.addLike(credentialId, id);
    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan like pada album',
    });
    response.code(201);
    return response;
  }

  async getLikeAlbumHandler(request, h){
    const { id } = request.params;
    let likes
    try {
      likes = await this._likesService.getLikeFromCache(id);
      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.header('X-DATA-SOURCE', 'cache');
      response.code(200);
      return response;
    } catch (error) {
      likes = await this._likesService.getLikeFromDatabase(id);
      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.code(200);
      return response;
    }
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const cover = await this._albumsService.getCover(id);
    let album = await this._albumsService.getAlbumById(id, cover);
    const response = h.response({
      status: 'success',
      data: {
        album
      }
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._albumsService.editAlbumById(id, request.payload);
    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async deleteLikeAlbumHandler(request, h){
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    await this._likesService.deleteLike(credentialId, id);
    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus like album'
    });
    response.code(200);
    return response;
  }
}

module.exports = { AlbumsHandler };
