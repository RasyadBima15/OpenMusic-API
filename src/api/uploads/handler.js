const process = require('process');
const path = require('path');

class UploadsHandler {
    constructor(uploadsService, albumsService, validator) {
        this._uploadsService = uploadsService;
        this._albumsService = albumsService;
        this._validator = validator;
     
        this.postUploadMimHandler = this.postUploadMimHandler.bind(this);
        this.getCoverAlbum = this.getCoverAlbum.bind(this);
    }

    async postUploadMimHandler(request, h){
        const { cover } = this._validator.validateMimHeaders(request.payload);
        const { hapi: meta } = cover;
        const { id } = request.params;
        const filename = await this._uploadsService.writeFile(cover, meta);
        await this._albumsService.addCover(id, filename);
        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
          });
        response.code(201);
        return response;
    }

    async getCoverAlbum(request, h){
        const { id } = request.params;
        const cover = await this._albumsService.getCover(id);
        return h.file(path.join(process.cwd(), 'src', 'api', 'uploads', 'file', 'images', cover))
    }
}
module.exports = UploadsHandler;