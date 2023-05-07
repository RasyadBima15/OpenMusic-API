const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: handler.postPlaylistHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: handler.getPlaylistHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}',
        handler: handler.deletePlaylistByIdHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
    {
        method: 'POST',
        path: '/playlists/{id}/songs',
        handler: handler.postSongByPlaylistIdHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
    {
        method: 'GET',
        path: '/playlists/{id}/songs',
        handler: handler.getPlaylistByIdHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}/songs',
        handler: handler.deleteSongByPlaylistIdHandler,
        options: {
            auth: 'openmusic_jwt',
        }
    },
];
module.exports = routes;