import express from 'express';
const app = express();
const PORT = 8000;
app.get('/hello', (req,res) => res.send('Wohoo! Server is running'));
app.listen(PORT, () => {
  console.log(`Express server is running at https://localhost:${PORT}`);
});