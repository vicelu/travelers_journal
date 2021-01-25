const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'postgis_user',
  host: 'localhost',
  database: 'travelers_journal',
  password: 'password',
  port: 5432,
});

const getPlaces = (request, response) => {
  pool.query('SELECT * FROM world_cities;', (error, results) => {
    if (error) { throw error }
    response.status(200).json(results.rows);
  });
}

const getPlace = (request, response) => {
  const place_id = parseInt(request.params.place_id)
  pool.query('SELECT * FROM world_cities where gid = $1;', [place_id], (error, results) => {
    if (error) { throw error }
    response.status(200).json(results.rows[0]);
  });
}

const getCountryOfCity = (request, response) => { // TODO refine query to give back more info about country
  const place_id = parseInt(request.params.place_id)
  pool.query('SELECT country.gid, country.country FROM world_countries country, world_cities city WHERE st_intersects(country.geom, city.geom) AND city.gid = $1;',
  [place_id], (error, results) => {
    if (error) { throw error }
    response.status(200).json(results.rows[0]);
  });
}

const getCitiesOfCountry = (request, response) => {
  pool.query(`SELECT gid, name FROM world_cities WHERE world_cities.country = '${request.params.country}';`, (error, results) => {
    if (error) { throw error }
    response.status(200).json(results.rows);
  });
}

const getPlaceCoord = (request, response) => {
  const place_id = parseInt(request.params.place_id)
  pool.query('SELECT ST_X(geom), ST_Y(geom) FROM world_cities where gid = $1;', [place_id], (error, results) => {
    if (error) { throw error }
    response.status(200).json(results.rows[0]);
  });
}

const getBeen = (request, response) => {
  const user_id = parseInt(request.params.user_id)
  pool.query('SELECT place_id FROM been WHERE user_id = $1;', [user_id], (error, results) => {
    if (error) { throw error }
    response.status(200).json(results.rows);
  });
}

const addBeen = (request, response) => {
  const { user_id, place_id } = request.body;
  pool.query('INSERT INTO been (user_id, place_id) VALUES ($1, $2);', [user_id, place_id], (error, results) => {
    if (error) { throw error }
    response.status(200).send(`Added place ${place_id} into places the user ${user_id} has been to`);
  });
}

const deleteBeen = (request, response) => {
  const { user_id, place_id } = request.body;
  pool.query('DELETE FROM been WHERE been.user_id = $1 AND been.place_id = $2;', [user_id, place_id], (error, results) => {
    if (error) { throw error }
    response.status(200).send(`Deleted place ${place_id} from places the user ${user_id} has been to`);
  });
}

const addUser = (request, response) => {
  const { name } = request.body;
  pool.query('INSERT INTO users (name) VALUES ($1);', [name], (error, results) => {
    if (error) { throw error }
    response.status(200).send(`Added user with name ${name}`);
  });
}

const deleteUser = (request, response) => {
  const { user_id } = request.body;
  pool.query('DELETE FROM users WHERE id = $1;', [user_id], (error, results) => {
    if (error) { throw error }
    response.status(200).send(`Deleted user with id: ${user_id}`);
  });
}

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users;', (error, results) => {
    if (error) { throw error }
    response.status(200).json(results.rows);
  });
}

module.exports = {
  getPlaces, 
  getPlace, 
  getPlaceCoord, 
  getBeen, 
  deleteBeen, 
  addBeen, 
  getUsers, 
  addUser, 
  deleteUser,
  getCitiesOfCountry
};