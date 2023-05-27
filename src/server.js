/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
const hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const path = require('path');


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

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/ValidatorExport');

const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/ValidatorUploads');

const LikeService = require('./services/postgres/LikeService');

const CacheService = require('./services/redis/CacheService');

require('dotenv').config();

const init = async () => {
  const cacheService = new CacheService();
  const albumService = new AlbumService();
  const songService = new SongService();
  const usersService = new UserService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const likeService = new LikeService(cacheService);
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
    },
    {
      plugin: Inert,
    },
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
        albumsService: albumService,
        likesService: likeService,
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
  await server.register(
    {
      plugin: _exports,
      options: {
        producerService: ProducerService,
        playlistService: playlistsService,
        validator: ExportsValidator,
      }
    }
  )
  await server.register(
    {
      plugin: uploads,
      options: {
        uploadsService: storageService,
        albumsService: albumService,
        validator: UploadsValidator,
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
