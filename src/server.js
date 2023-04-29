/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
const hapi = require('@hapi/hapi');
const AlbumService = require('./services/postgres/AlbumService');
const SongService = require('./services/postgres/SongService');
const albumsValidator = require('./validator/ValidatorAlbum');
const songsValidator = require('./validator/ValidatorSong');
const albums = require('./api/albums');
const songs = require('./api/songs');
const ClientError = require('./exceptions/ClientError');
require('dotenv').config();

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const server = hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register(
    {
      plugin: albums,
      options: {
        service: albumService,
        validator: albumsValidator,
      },
    },
  );
  await server.register(
    {
      plugin: songs,
      options: {
        service: songService,
        validator: songsValidator,
      },
    },
  );
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      console.log(response);
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
init();
