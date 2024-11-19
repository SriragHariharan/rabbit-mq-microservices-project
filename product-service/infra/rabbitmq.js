import amqp from "amqplib"

async function sendItemsToCart(message){

    //create a connection tcp
    const connection = await amqp.connect("amqp://rabbitmq-service.default.svc.cluster.local");

    //create a channel
    const channel = await connection.createChannel();

    //create an exchange
    const cartExchange = "cartExchange";
    await channel.assertExchange(cartExchange, "direct", { durable: true });

    //define a routing key
    const cartRoutingKey = "cartRoutingKey";

    //send message to the exchange
    let bufferMessage = Buffer.from(JSON.stringify(message));
    channel.publish(cartExchange, cartRoutingKey, bufferMessage)

    await channel.close();
    await connection.close();
}

export default sendItemsToCart;