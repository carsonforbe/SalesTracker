import express from 'express';
import url from 'url';
import path from 'path';
import cors from 'cors';
import router from './salesController/saleController.js';

//creation of filepath
const __filename = url.fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'data', 'sales.json');

//create an express instanse
const app = express();

//allow the acception of raw json
app.use(express.json());

//allows the req and res to localhost
app.use(cors())

//logger for router requests
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next()
}
app.use(logger);

//post request defined in ./salesController/salecontroller
app.use(router);

//the node server listening on port 5000
app.listen(5000, () => {console.log('Server running on port 5000')});