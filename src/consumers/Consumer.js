const RabbitMq = require('../RabbitMq');

class Consumer extends RabbitMq {
  constructor([rabbitMqHost, params]) {
    super(rabbitMqHost, params);
    this.queueName = params.queueName || null;
  }

  /**
   * @function
   * @param {function} callback - Callback to process the payload
   * @returns {Promise} - Return a Promise with connection
   */
  consumeByTopicOrDirect(callback, type) {
    return new Promise(async (resolve, reject) => {
      try {
        const { channel, connection } = await this.createChannel();
        channel.assertExchange(...this.assertExchangeArgs(type));

        channel.assertQueue(
          this.queueName,
          this.assertQueueOptions,
          (err, queue) => {
            if (err) reject(err);

            channel.bindQueue(queue.queue, this.exchange, this.routeKey);

            channel.consume(
              queue.queue,
              async msg => {
                await callback(msg);
                channel.ack(msg);
              },
              { noAck: false }
            );
          }
        );
        resolve(connection);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @function
   * @param {function} callback - Callback to process the payload
   * @returns {Promise} - Return a Promise with connection
   */
  consumeByTopicAndReturnResponse(callback) {
    return new Promise(async (resolve, reject) => {
      try {
        const { channel, connection } = await this.createChannel();

        channel.assertExchange(...this.assertExchangeArgs());

        channel.assertQueue(
          this.queueName,
          this.assertQueueOptions,
          (err, queue) => {
            if (err) reject(err);

            channel.bindQueue(queue.queue, this.exchange, this.routeKey);

            channel.consume(
              queue.queue,
              async msg => {
                const response = await callback(msg);

                const sendResponse = channel.sendToQueue(
                  msg.properties.replyTo,
                  this.convertToString(response),
                  { correlationId: msg.properties.correlationId }
                );

                if (!sendResponse) channel.nack(msg, { requeue: false });

                channel.ack(msg);
                resolve(connection);
              },
              { noAck: false }
            );
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Consumer;
