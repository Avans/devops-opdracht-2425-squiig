const amqp = require('amqplib/callback_api');

const publishDirectExchange = (message, exchange, routingKey) => {
    
    amqp.connect(`${process.env.RABBITMQ_URL || 'amqp://localhost'}:${process.env.MQTTPORT || '5672'}`, function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
        throw error1;
        }
    
        channel.assertExchange(exchange, 'direct', {
          durable: false
        });

        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
        console.log(" [x] Sent %s with key:" , message, routingKey);
    });

    setTimeout(function() {
        connection.close();
    }, 500);
    });
  }

module.exports.publishDirectExchange = publishDirectExchange
