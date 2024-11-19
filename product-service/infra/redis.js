import { createClient } from "redis";

const client = createClient({
    url: 'redis://redis-service:6379' // Use the service name defined in Kubernetes
});
  
client.connect();

client.on('connect', ()=> console.log("Client connected to redis !"))
client.on('ready', ()=> console.log("Redis ready to use"))
client.on('error', (err)=> console.log(err.message))
client.on('end', ()=> console.log("Client disconnected from redis"))

process.on('SIGINT', () => {
    client.quit()
})

export default client;