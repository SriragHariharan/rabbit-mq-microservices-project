import express from 'express'
import axios from 'axios';

const app = express();

//redis connection code
import redis from "./infra/redis.js"
import sendItemsToCart from './infra/rabbitmq.js';


//routes to get products
app.get("/", async(req, res) => {
    try {
        let productsCached = await redis.get("products");
        if(!productsCached){
            let resp = await axios.get("https://fakestoreapi.com/products");            
            //lazy caching with duration of 1 hr
            await redis.set("products", JSON.stringify(resp?.data), { EX: 1800 });
            return res.status(200).json(resp?.data);
        }else{
            return res.status(200).json(JSON.parse(productsCached));
        }
    } catch (error) {
        console.log(error)
    }
});

app.get("/:id", async(req, res) => {
    try {
        let productId = req.params.id;
        let prodCached = await redis.get(`product:${productId}`);
        if(prodCached){
            console.log("from cache")
            return res.status(200).json(JSON.parse(prodCached));
        }else{
            console.log("from db")
            let resp = await axios.get("https://fakestoreapi.com/products/" + productId);
            await redis.set(`product:${productId}`, JSON.stringify(resp?.data), { EX: 900 }); //expire after 15 minutes
            return res.status(200).json(resp?.data);
        }
    } catch (error) {
        console.error(error);
    }
    
})

//send the product to cart service
app.post("/:id/cart", async(req, res) => {
    try {
        let productId = req.params.id;
        let prodCached = JSON.parse(await redis.get(`product:${productId}`));
        if(prodCached){
            console.log("from cache", prodCached)
            sendItemsToCart(prodCached);  //send items to cart service
            return res.status(200).json("Item added to cart");
        }else{
            let resp = await axios.get("https://fakestoreapi.com/products/" + productId);
            await redis.set(`product:${productId}`, JSON.stringify(resp?.data), { EX: 900 }); //expire after 15 minutes
            console.log("from db", resp?.data)
            sendItemsToCart(resp?.data);
            return res.status(200).json("Item added to cart");
        }
    } catch (error) {
        console.error(error);
    }
    
})

app.listen(4000, () => console.log("Server running on port: 4000"))