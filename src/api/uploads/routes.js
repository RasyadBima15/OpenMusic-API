const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums/{id}/covers',
        handler: handler.postUploadMimHandler,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                output: 'stream',
                maxBytes: 512000,
            },
        },
    },
    {
        method: 'GET',
        path: '/albums/{id}/{params*}',
        handler: handler.getCoverAlbum,
    },
];
module.exports = routes;