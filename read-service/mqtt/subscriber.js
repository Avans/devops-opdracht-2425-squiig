const amqp = require('amqplib/callback_api')

async function subscribe(exchange, key, callback) {
    let queueName = exchange + '-' + key + '-readService';
    
    (async () => {
        try {
            amqp.connect(`${process.env.RABBITMQ_URL || 'amqp://localhost'}:${process.env.MQTTPORT || '5672'}`, async(error0, connection) => {
                if (error0) {
                    setTimeout(() => {
                        subscribe(exchange, key, callback)
                    }, 1);
                    return
                }
                connection.createChannel(async (err1, channel) => {
                    if (err1) {
                        setTimeout(() => {
                            subscribe(exchange, key, callback)
                        }, 1);
                        return
                    }
                    channel.assertExchange(exchange, 'direct', {
                        durable: false
                    });
                    channel.assertQueue(queueName, {
                        durable: true
                    }, async (err, q) => {
                        channel.bindQueue(q.queue, exchange, key);
                        channel.prefetch(1);
                        channel.consume(q.queue, async (msg) => {
                            callback(JSON.parse(msg.content))
                            console.log(" [%s] received %s", exchange, msg.fields.routingKey);
                            channel.ack(msg);
                        }, {
                            noAck: false
                        });
                    });
                });
            });
        } catch (err) {
            console.warn(err)
        }
    })()
}

module.exports.subscribe = subscribe