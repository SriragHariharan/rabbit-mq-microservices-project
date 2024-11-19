import amqp from 'amqplib';
import { placeOrder } from '../app.js';

async function getOrders(){
    
    //create a tcp connection
    const connection = await amqp.connect("amqp://rabbitmq-service:5672");

    //create a communication channel
    const channel = await connection.createChannel();

    //create an exchange
    const orderExchange = "orderExchange";
    await channel.assertExchange(orderExchange, "direct", { durable: false });

    //send message to the queue
    const orderBindingKey = "orderKey";
    const queue = "orderQueue"
    await channel.assertQueue(queue, { durable: false });

    //bind queue and exchang
    await channel.bindQueue(queue, orderExchange, orderBindingKey);

    //listen for messages
    channel.consume(queue, (message) => {
        try {
            const messageContent = JSON.parse(message.content.toString());
            console.log("Received message:", messageContent, message.content);

            if (Array.isArray(messageContent)) {
                placeOrder(messageContent);
                channel.ack(message);
            } else {
                console.error("Received message is not an array:", messageContent);
            }
        } catch (error) {
            console.error("Error parsing message:", error);
        }
    });
}

getOrders();