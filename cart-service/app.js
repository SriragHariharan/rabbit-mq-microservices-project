import express from 'express';

import "./infra/rabbitmq.js"
import { sendCartItemsToOrderService } from './infra/rabbitmq.js';

const app = express();

let cart = [];

//get cart items
app.get("/", (req, res) => {
    try {
        return res.status(200).json(cart);
    } catch (error) {   
        console.log(error);
    }
})

//place order
app.post("/place-order", (req, res) => {
    try {
        console.log("cart ::: ",cart)
        if(cart.length){
            sendCartItemsToOrderService(cart)
            return res.send("Order placed successfully");
        }else{
            return res.send("No items to place order");
        }
    } catch (error) {
        console.log(error)
    }
})


//add a new product to the cart
function addToCart(item){
    console.log("cart item ::::", item);
    if(item){
        cart.push(item);
        console.log(cart)
    }
};
export { addToCart };

app.listen(4001, ()=> console.log("App listening on 4001"))