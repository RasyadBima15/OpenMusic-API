const routes = (handler) => [
    {
        method: 'POST',
        path: '/export/playlists/{id}',
        handler: handler.postExportPlaylistHandler,
        options: {
            auth: 'openmusic_jwt',
        },
    },
];
module.exports = routes;