import express from 'express';
import bodyParser from 'body-parser';
const cors = require('cors');
import * as db from './queries';

const app = express();
const PORT = 7080;

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req,res) => {res.send('Ciao')});
app.get('/hello', (req,res) => {res.send('Wohoo! Server is running')});

app.get('/been/:user_id', db.getBeen);
app.post('/been', db.addBeen);
app.delete('/been', db.deleteBeen);
app.get('/places', db.getPlaces);
app.get('/place/:place_id', db.getPlace);
app.get('/users', db.getUsers);
app.post('/user', db.addUser);
app.delete('/user', db.deleteUser);


app.listen(PORT, () => {
  console.log(`Express server is running at http://localhost:${PORT}`);
});