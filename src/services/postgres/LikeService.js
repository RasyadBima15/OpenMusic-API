const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikeService {
    constructor(cacheService){
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addLike(userId, albumId){
        const queryForCheckingLike = {
            text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
            values: [userId, albumId],
        }
        const result1 = await this._pool.query(queryForCheckingLike);
        if (result1.rows.length) {
            throw new InvariantError('Anda hanya bisa menyukai album sebanyak 1 kali');
        }

        const queryForCheckingAlbum = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [albumId],
        }
        const result2 = await this._pool.query(queryForCheckingAlbum);
        if(!result2.rows.length){
            throw new NotFoundError('Id album tidak ditemukan. Like gagal ditambahkan');
        }

        const id = nanoid(16);
        const queryForInsert = {
            text: 'INSERT INTO user_album_likes VALUES ($1,$2,$3) RETURNING id',
            values: [id, userId, albumId],
        };
        const result3 = await this._pool.query(queryForInsert);
        if(!result3.rows[0].id) {
            throw new InvariantError('Like gagal ditambahkan');
        }
        await this._cacheService.delete(`albumLikes:${albumId}`);
        return result3.rows[0].id;
    }

    async getLikeFromDatabase(albumId){
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
            values: [albumId]
        };
        const result = await this._pool.query(query);
        const likes = result.rows.length;
        await this._cacheService.set(`albumLikes:${albumId}`, JSON.stringify(likes));
        return likes;
    }

    async getLikeFromCache(albumId){
        const result = await this._cacheService.get(`albumLikes:${albumId}`);
        return JSON.parse(result);
    }

    async deleteLike(userId, albumId){
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length){
            throw new InvariantError('Gagal membatalkan menyukai album');
        }
        await this._cacheService.delete(`albumLikes:${albumId}`);
    }
}
module.exports = LikeService;