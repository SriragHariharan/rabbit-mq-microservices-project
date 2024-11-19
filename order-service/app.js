import express from 'express';
const app = express();

import './infra/rabbitmq.js'

let orders = [];

function generateOrderID() {
  const min = 10000000; // Minimum 8-digit number
  const max = 99999999; // Maximum 8-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



app.get("/", (req, res) => {
    if(orders.length){
        return res.status(200).json(orders);
    }else{
        return res.send("No orders placed")
    }
})

export function placeOrder(order){
    const orderID = generateOrderID();
    if(order.length){
        orders.push({orderID, order})
    }else{
        console.log("Nothing to place as order")
    }
}


app.listen(4002, ()=> console.log("server listening on 4002"));