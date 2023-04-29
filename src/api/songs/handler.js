/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title, year, genre, performer, duration = null, albumId = null,
    } = request.payload;
    const songId = await this._service.addSong({
      title, year, genre, performer, duration, albumId,
    });
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request,h) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs();
    if (title && performer){
      const filterTitle = songs.filter((song) => song.title.toLowerCase().includes(title.toLowerCase()));
      const filterTitleAndPerformer = filterTitle.filter((song) => song.performer.toLowerCase().includes(performer.toLowerCase()));
      if (filterTitleAndPerformer.length > 0){
        const response = h.response({
          status: 'success',
          data: {
            songs: filterTitleAndPerformer,
          }
        });
        return response;
      } else if (filterTitleAndPerformer){
        const response = h.response({
          status: 'fail',
          message: 'Title dan Performer pada query tidak terdapat di database',
        });
        return response;
      }
    } else if (title) {
      const filterTitle = songs.filter((song) => song.title.toLowerCase().includes(title.toLowerCase()));
      if (filterTitle.length > 0){
        const response = h.response({
          status: 'success',
          data: {
            songs: filterTitle,
          }
        });
        return response;
      } else if (filterTitle) {
        const response = h.response({
          status: 'fail',
          message: 'Title song pada query tidak terdapat di database',
        });
        return response;
      }
    } else if (performer){
      const filterPerformer = songs.filter((song) => song.performer.toLowerCase().includes(performer.toLowerCase()));
      if (filterPerformer.length > 0){
        const response = h.response({
          status: 'success',
          data: {
            songs: filterPerformer,
          }
        });
        return response;
      } else if (filterPerformer){
        const response = h.response({
          status: 'fail',
          message: 'Performer song pada query tidak terdapat di database'
        });
        return response;
      }
    }
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    await this._service.editSongById(id, request.payload);
    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}
module.exports = { SongsHandler };
