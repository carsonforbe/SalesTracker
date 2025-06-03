// salesController.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const dataPath = path.join(process.cwd(), 'data', 'sales.json');
const dataPath2 = path.join(process.cwd(),'data', 'salesStock.json');

//get router
router.get('/api/sales/', async (req, res) => {
    try {
        const rawdata = await fs.readFile(dataPath, 'utf-8');
        const data = JSON.parse(rawdata);
        res.status(200).json(data);
    } catch (error) {
        throw new Error('Failed to load Data')
    }
});

//helper function to read sales file
const readSalesData = async () => {
    const rawData = await fs.readFile(dataPath, 'utf-8');
    const sales = JSON.parse(rawData);
    return sales;
};

//helper function to read stock file
const readStock = async () => {
    const data = await fs.readFile(dataPath2, 'utf-8');
    const stock = JSON.parse(data);
    return stock;
}

//helper function to write sales data
const writeSalesData = async (sale) => {
    const data = await fs.writeFile(dataPath, JSON.stringify(sale, null, 2), 'utf-8');
};

//helper finvtion to write stock data
const writeStock = async (stock) => {
    const data = await fs.writeFile(dataPath2, JSON.stringify(stock, null, 2), 'utf-8');
}

router.post('/api/sales', async (req, res) => {
    //console.log("Incoming request body:", req.body);
    try {
        //extract data from request body
        const { productType, amountSold, wholesalePrice, retailPrice  } = req.body;
       // console.log("Parsed values:", { productType, amountSold, wholesalePrice, retailPrice });

        //check if data is available
        if(!productType || !amountSold || !wholesalePrice || !retailPrice){
            console.log("Empty Data Set");
            res.status(400).json({error: "Empty Data Set"});
        }

        //calculate profit
        const profit = (Number(wholesalePrice) - Number(retailPrice)) * Number(amountSold);
        //console.log("Calculated Profit:", profit);

        const newSale = {
            id: Date.now(),
            productType,
            amountSold: Number(amountSold),
            wholesalePrice: Number(wholesalePrice),
            retailPrice: Number(retailPrice),
            profit: Number(profit)
        };
        //console.log("new sale", newSale);

        //read current salesData
        const salesData = await readSalesData();
        //console.log(salesData);

        //add new sales to appropriate salesData
        if(!salesData[productType]){
            salesData[productType]=[];
        };


        salesData[productType].push(newSale);
        //console.log("updated salesData", salesData);

        //save updated data
        await writeSalesData(salesData);
       // console.log("New Sale Added");

        //return the newSale
        res.status(201).json({
            SALE: newSale
        });

    } catch (error) {
        console.error("Error Adding New Sale");
        //res.status(500).json({error: "error adding sale"});
    }
});

//router for deleting a sale
router.delete('/api/sales/:id', async (req, res) => {

    //extract the id from the requested url
    let id = req.params.id;
    id = parseInt(id);
    console.log(id);

    //read the data and save it to memory
    const data = await readSalesData();
    console.log(data.id);

    if(!data.id === id){
        throw new Error(`Product with id ${id} not found`);
    }

    //data.push(newData);
    //await writeSalesData(newData);
});

//router for fetching stocks
router.get('/api/sales/stock/', async (req, res)=> {
    const data = await readStock();
    res.status(200).json(data);
})


export default router;