/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
const hapi = require('@hapi/hapi');

const songs = require('./api/songs');
const SongService = require('./services/postgres/SongService');
const songsValidator = require('./validator/ValidatorSong');

const albums = require('./api/albums');
const AlbumService = require('./services/postgres/AlbumService');
const albumsValidator = require('./validator/ValidatorAlbum');

const ClientError = require('./exceptions/ClientError');
const Jwt = require('@hapi/jwt');

const users = require('./api/users');
const UserService = require('./services/postgres/UserService');
const UsersValidator = require('./validator/ValidatorUser');

const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/ValidatorAuthentication')

const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistService');
const PlaylistsValidator = require('./validator/ValidatorPlaylist')

require('dotenv').config();

const init = async () => {
  const albumService = new AlbumService();
  const songService = new SongService();
  const usersService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const server = hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  //registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    }
  ]);
  //mendefinisikan strategi autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
  await server.register(
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      }
    }
  );
  await server.register(
    {
      plugin: authentications,
      options: {
        authenticationsService: authenticationsService,
        usersService: usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      }
    }
  );
  await server.register(
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      }
    }
  )
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
