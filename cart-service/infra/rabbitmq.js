import amqp from "amqplib"
import { addToCart } from "../app.js";

async function createConnection(){
    //create a connection tcp
    const connection = await amqp.connect("amqp://rabbitmq-service.default.svc.cluster.local");
    
    //create a channel
    const channel = await connection.createChannel();

    return channel;
}

//get message of product from product service to add to cart
async function getCartMessage(){

    const channel = await createConnection();

    //create an exchange
    const cartExchange = "cartExchange";
    await channel.assertExchange(cartExchange, "direct", { durable: true });

    //define a routing key
    const cartRoutingKey = "cartRoutingKey";

    //define a queue
    const queue = "cartQueue"
    await channel.assertQueue(queue, { durable: false });

    //bind queue with exchange
    await channel.bindQueue(queue, cartExchange, cartRoutingKey)

    //send message to the exchange
    channel.consume(queue, (message) => {
        console.log("from prod svc: ",message.content)
        let cartItem = JSON.parse(message.content)
        addToCart(cartItem);
        channel.ack(message)
    })
}
getCartMessage();

//send the cart items to the orders service
async function sendCartItemsToOrderService(cart){
    try {
        const connection = await createConnection();

        //create an exchange
        const orderExchange = "orderExchange";
        await connection.assertExchange(orderExchange, "direct", { durable: false });

        //send message to the queue
        const orderRoutingKey = "orderKey";
        console.log("cart before parsing", cart)
        const bufferMessage = Buffer.from(JSON.stringify(cart));
        console.log(bufferMessage)
        connection.publish(orderExchange, orderRoutingKey, bufferMessage);

        await connection.close();

    } catch (error) {
        console.log(error);
    }
}

export { sendCartItemsToOrderService };