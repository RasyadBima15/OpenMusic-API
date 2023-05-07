/* eslint-disable no-unused-vars */
const mapDBToModel = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapDBToModel2 = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const mapDBToModel3 = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
})

const mapDBToModel4 = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username
})

module.exports = { mapDBToModel, mapDBToModel2, mapDBToModel3, mapDBToModel4 };
