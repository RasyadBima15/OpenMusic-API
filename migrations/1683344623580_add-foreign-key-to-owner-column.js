/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old notes')");
    pgm.sql("UPDATE playlists SET owner = 'old_notes' WHERE owner IS NULL");
    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = pgm => {
    pgm.dropConstraint('playlists', 'fk_playlists.owner_users.id');
    pgm.sql("UPDATE playlists SET OWNER = NULL WHERE owner = 'old_notes'");
    pgm.sql("DELETE FROM playlists WHERE id = 'old_notes'");
};
