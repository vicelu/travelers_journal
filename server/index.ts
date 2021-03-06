import express from 'express';
import bodyParser from 'body-parser';
const cors = require('cors');
import { Queries } from './queries';

const app = express();
const PORT = 7080;

const db = new Queries();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req,res) => {res.send('Ciao')});
app.get('/hello', (req,res) => {res.send('Wohoo! Server is running')});

app.get('/been/:user_id', db.getBeen);
app.post('/been', db.addBeen);
app.delete('/been', db.deleteBeen);
app.get('/places', db.getPlaces);
app.get('/coord/:place_id', db.getPlaceCoord);
app.get('/place/:place_id', db.getPlace);
app.get('/cities/:country', db.getCitiesOfCountry);
app.get('/country/:place_id', db.getCountryOfCity);
app.get('/users', db.getUsers);
app.get('/user/:user_id', db.getUser);
app.post('/distance', db.getDistance);
app.post('/user', db.addUser);
app.delete('/user', db.deleteUser);


app.listen(PORT, () => {
  console.log(`Express server is running at http://localhost:${PORT}`);
});
