/* eslint-disable no-unused-vars */
const autoBind = require('auto-bind');

class AuthenticationsHandler{
    constructor(authenticationsService, usersService, tokenManager, validator) {
        this._authenticationsService = authenticationsService,
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        autoBind(this);
    }

    async postAuthenticationHandler(request, h){
        this._validator.validatePostAuthenticationPayload(request.payload);
        const { username, password } =  request.payload;
        const id = await this._usersService.verifyUserCredential(username, password);
        const accessToken = this._tokenManager.generateAccessToken({id});
        const refreshToken = this._tokenManager.generateRefreshToken({id});
        await this._authenticationsService.addRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            message: 'Authentication berhasil ditambahkan',
            data: {
                accessToken,
                refreshToken,
            },
        });
        response.code(201);
        return response;
    }

    async putAuthenticationHandler(request, h) {
        this._validator.validatePutAuthenticationPayload(request.payload);
        const { refreshToken } = request.payload;
        const { id } = this._tokenManager.verifyRefreshToken(refreshToken);
        const token = await this._authenticationsService.verifyRefreshToken(refreshToken);
        if (token == 0) {
            const response = h.response({
                status: 'fail',
                message: 'Refresh token tidak valid',
            });
            response.code(400);
            return response;
        }
        const accessToken = this._tokenManager.generateAccessToken({id});
        return {
            status: 'success',
            message: 'Access Token berhasil diperbarui',
            data: {
                accessToken,
            },
        };
    }

    async deleteAuthenticationHandler(request, h) {
        this._validator.validateDeleteAuthenticationPayload(request.payload);
        const { refreshToken } = request.payload;
        this._tokenManager.verifyRefreshToken(refreshToken);
        await this._authenticationsService.verifyRefreshToken(refreshToken);
        await this._authenticationsService.deleteRefreshToken(refreshToken);
        return {
            status: 'success',
            message: 'Refresh token berhasil dihapus',
        };
    }

}
module.exports = AuthenticationsHandler;