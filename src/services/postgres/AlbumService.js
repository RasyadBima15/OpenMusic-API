/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const { process } = require('process');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const myNanoId = nanoid(16);
    const id = 'album-' + myNanoId;
    const cover = null;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, year, cover],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async addCover(id, fileLocation){
    const queryInsert = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [fileLocation, id],
    };
    const resultInsert = await this._pool.query(queryInsert);
    if (!resultInsert.rows[0].id) {
      throw new NotFoundError('Cover Url gagal ditambahkan. Album id tidak ditemukan');
    }
  }

  async getAlbumById(id, filename = null) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const query2 = {
      text: 'SELECT * FROM songs WHERE "albumid" = $1',
      values: [id],
    };
    const [albumResult, songsResult] = await Promise.all([
      this._pool.query(query),
      this._pool.query(query2),
    ]);
    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    const album = mapDBToModel(albumResult.rows[0]);
    if (album.coverUrl !== null && filename !== null){
      album.coverUrl = `http://localhost:5000/albums/${id}/${filename}`
    }
    const songs = songsResult.rows;
    album.songs = songs

    return album;
  }

  async getCover(id){
    const query = {
      text: 'SELECT cover from albums WHERE id = $1',
      values: [id],
    }
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new NotFoundError('Id album tidak ditemukan');
    }
    return result.rows[0].cover;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan');
    }
  }
}
module.exports = AlbumService;
