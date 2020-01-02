const uuid = require('uuid/v1');
const RabbitMq = require('../../RabbitMq');

class Publish extends RabbitMq {
  constructor([rabbitMqHost, params]) {
    super(rabbitMqHost, params);
    this.queueToResponse = params.queueToResponse || null;
    this.correlationId = uuid();
  }

  /**
   * @function
   * @param {string} message - Payload
   * @param {string} type - type of publisher(topic or direct)
   * @param {integer} time - time to close connection
   * @returns {Promise} - Return a Promise with connection
   */
  sendMessageByTopicOrDirect(message, time, type) {
    return new Promise(async (resolve, reject) => {
      try {
        const messageContent = this.convertToString(message);
        const { channel, connection } = await this.createChannel();

        channel.assertExchange(...this.assertExchangeArgs(type));

        channel.publish(this.exchange, this.routeKey, messageContent);

        resolve(connection);
      } catch (error) {
        reject(error);
      }
    }).then(connection => this.closeConnection(connection, time));
  }

  /**
   * @function
   * @param {string} message - Payload
   * @param {Object} publishOptions - Params to publish the message
   * @returns {Promise} - Return a Promise with connection
   */
  sendMessageByTopicAndGetResponse(message, publishOptions) {
    return new Promise(async (resolve, reject) => {
      try {
        const messageContent = this.convertToString(message);
        const { channel, connection } = await this.createChannel();

        channel.assertExchange(...this.assertExchangeArgs());

        channel.assertQueue(
          this.queueToResponse,
          this.assertQueueOptions,
          (err, { queue }) => {
            if (err) throw err;

            channel.consume(
              queue,
              msg => {
                if (msg.properties.correlationId === this.correlationId) {
                  resolve(msg);
                  channel.ack(msg);
                }
                connection.close();
              },
              { noAck: false }
            );

            channel.publish(this.exchange, this.routeKey, messageContent, {
              correlationId: this.correlationId,
              replyTo: queue,
              priority: publishOptions.priority || 10,
              headers: publishOptions.headers || {},
              messageId: publishOptions.messageId || null,
              timestamp: new Date().getTime(),
              contentType: 'application/json',
            });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Publish;
