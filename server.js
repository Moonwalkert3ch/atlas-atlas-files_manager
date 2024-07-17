import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse application/json content-type
app.use(bodyParser.json());

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});