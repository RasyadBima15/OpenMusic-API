const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel4 } = require('../../utils')
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
    constructor(){
        this._pool = new Pool();
    }

    async addPlaylist({name, owner}) {
        const id = `playlist-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };
        const result = await this._pool.query(query);
        if(!result.rows[0].id){
            throw new InvariantError('Playlist gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getPlaylists(owner){
        const query = {
            text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON playlists.owner = users.id WHERE playlists.owner = $1',
            values: [owner],
        };
        const result = await this._pool.query(query);
        return result.rows.map(mapDBToModel4);
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        }
        const result = await this._pool.query(query);
        if(!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        const playlist = result.rows[0];
        if(playlist.owner !== owner){
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }   
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this.verifyPlaylist(playlistId, userId)
            } catch {
                throw error;
            }
        }
    }

    async verifyPlaylist(playlistId, userId) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1 AND owner = $2',
            values: [playlistId, userId],
        }
        const result = await this._pool.query(query);
        if (!result.rows.length){
            throw new InvariantError('Playlist gagal diverifikasi');
        }
        const playlistIdResult = result.rows[0].id;
        return playlistIdResult;
    }

    async addSongToPlaylist(playlistId, songId){
        const songQuery = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [songId],
        }
        const songResult = await this._pool.query(songQuery);
        if (!songResult.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }

        const playlistSongQuery = {
            text: 'INSERT INTO playlistsongs (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING id',
            values: [nanoid(16),playlistId, songId],
        }
        const playlistSongResult = await this._pool.query(playlistSongQuery);
        if (!playlistSongResult.rows.length){
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }
    }

    async getPlaylistById(playlistId){
        const query = {
            text: `
                SELECT
                    playlists.id,
                    playlists.name,
                    users.username
                FROM playlists
                LEFT JOIN users
                    ON playlists.owner = users.id
                WHERE playlists.id = $1
            `,
            values: [playlistId],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }
        const playlist = result.rows[0];
        const songsQuery = {
            text: `
                SELECT
                    songs.id,
                    songs.title,
                    songs.performer
                FROM playlistsongs
                LEFT JOIN songs
                    ON playlistsongs.song_id = songs.id
                WHERE playlistsongs.playlist_id = $1
            `,
            values: [playlistId],
        };
        const songsResult = await this._pool.query(songsQuery);
        const songs = songsResult.rows;
        playlist.songs = songs;
        return playlist;
    }

    async deleteSongInPlaylist(playlistId, songId){
        const songPlaylistQuery = {
            text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
          };
          const songPlaylistResult = await this._pool.query(songPlaylistQuery);
          if (!songPlaylistResult.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus dari playlist. Id lagu tidak ditemukan');
        }
    }

}
module.exports = PlaylistsService;