class ExportsHandler {
    constructor(producerService, playlistService, validator) {
        this._producerService = producerService;
        this._playlistService = playlistService;
        this._validator = validator;

        this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }

    async postExportPlaylistHandler(request, h){
        this._validator.validateExportPlaylistPayload(request.payload);
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;
        await this._playlistService.verifyPlaylistAccess(id, credentialId);
        const playlistId = await this._playlistService.verifyPlaylist(id, credentialId);
        const message = {
            playlistId: playlistId,
            targetEmail: request.payload.targetEmail,
        };
        await this._producerService.sendMessage('export:playlist', JSON.stringify(message));
        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda dalam antrean',
        })
        response.code(201);
        return response;
    }
}
module.exports = ExportsHandler;