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

module.exports = { mapDBToModel, mapDBToModel2, mapDBToModel3 };
