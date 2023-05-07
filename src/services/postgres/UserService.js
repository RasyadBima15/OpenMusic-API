const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const bcrypt = require('bcrypt');
const AuthenticationError = require('../../exceptions/AuthenticationsError');

class UsersService {
    constructor(){
        this._pool = new Pool();
    }

    async verifyNewUsername(username){
        const query = {
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        }
        const result = await this._pool.query(query);
        if (result.rows.length > 0) {
            throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
        }

    }

    async addUser({ username, password, fullname }){
        await this.verifyNewUsername(username);
        const id = `user-${nanoid(16)}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = {
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        }
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new InvariantError('User gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async verifyUserCredential(username, password){
        const query =  {
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }
        const { id, password: hashedPassword} = result.rows[0];
        const  match = await bcrypt.compare(password, hashedPassword);
        if (!match){
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }
        return id;
    }
}
module.exports = UsersService;