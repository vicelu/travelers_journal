const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgis_user',
    host: 'localhost',
    database: 'travelers_journal',
    password: 'password',
    port: 5432,
});

export class Queries {
    getPlaces = (request: any, response: any) => {
        pool.query('SELECT * FROM world_cities;', (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        });
    }

    getPlace = (request: any, response: any) => {
        const place_id = parseInt(request.params.place_id);
        pool.query('SELECT * FROM world_cities where gid = $1;', [place_id], (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows[0]);
        });
    }

    getCountryOfCity = (request: any, response: any) => { // TODO refine query to give back more info about country
        const place_id = parseInt(request.params.place_id)
        pool.query('SELECT country.gid, country.country FROM world_countries country, world_cities city WHERE st_intersects(country.geom, city.geom) AND city.gid = $1;',
            [place_id], (error: any, results: any) => {
                if (error) {
                    throw error
                }
                response.status(200).json(results.rows[0]);
            });
    }

    getCountryArea = (request: any, response: any) => {
        pool.query(`SELECT ST_Area(country.geom) FROM (SELECT * FROM world_countries WHERE gid = ${request.params.country}) as country;`, (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        });
    }

    getCitiesOfCountry = (request: any, response: any) => {
        pool.query(`SELECT gid, name FROM world_cities WHERE world_cities.country = '${request.params.country}';`, (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        });
    }

    getPlaceCoord = (request: any, response: any) => {
        const place_id = parseInt(request.params.place_id);
        pool.query('SELECT ST_X(geom), ST_Y(geom) FROM world_cities where gid = $1;', [place_id], (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows[0]);
        });
    }

    getBeen = (request: any, response: any) => {
        const user_id = parseInt(request.params.user_id);
        pool.query('SELECT place_id FROM been WHERE user_id = $1;', [user_id], (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        });
    }

    addBeen = (request: any, response: any) => {
        const {user_id, place_id} = request.body;
        pool.query('INSERT INTO been (user_id, place_id) VALUES ($1, $2);', [user_id, place_id], (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Added place ${place_id} into places the user ${user_id} has been to`);
        });
    }

    deleteBeen = (request: any, response: any) => {
        const {user_id, place_id} = request.body;
        pool.query('DELETE FROM been WHERE been.user_id = $1 AND been.place_id = $2;', [user_id, place_id], (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Deleted place ${place_id} from places the user ${user_id} has been to`);
        });
    }

    addUser = (request: any, response: any) => {
        const {name} = request.body;
        pool.query('INSERT INTO users (name) VALUES ($1);', [name], (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Added user with name ${name}`);
        });
    }

    getUser = (request: any, response: any) => {
        const user_id = parseInt(request.params.user_id);
        pool.query('SELECT * FROM users WHERE id = $1;', [user_id], (error: any, results: any) => {
            if (error) { throw error }
            response.status(200).json(results.rows[0]);
        });
    }

    deleteUser = (request: any, response: any) => {
        const {user_id} = request.body;
        pool.query('DELETE FROM users WHERE id = $1;', [user_id], (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Deleted user with id: ${user_id}`);
        });
    }

    getUsers = (request: any, response: any) => {
        pool.query('SELECT * FROM users;', (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        });
    }

    getDistance = (request: any, response: any) => {
        const {origin_place_point, destination_place_point} = request.body;
        pool.query(`SELECT ST_DistanceSphere(ST_GeomFromText('POINT(${origin_place_point.st_x} ${origin_place_point.st_y})',4326),
        ST_GeomFromText('POINT(${destination_place_point.st_x} ${destination_place_point.st_y})',4326));`, (error: any, results: any) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows[0]);
        });
    }
}
