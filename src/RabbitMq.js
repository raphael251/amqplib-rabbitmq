const amqp = require('amqplib/callback_api');

/**
 * @class
 */
class RabbitMq {
  /**
   * @param {string} rabbitMqHost - Link to connect in rabbitMq
   */
  constructor(rabbitMqHost, params) {
    this.rabbitMqHost = rabbitMqHost;

    this.routeKey = params.routeKey;
    this.exchange = params.exchange || 'defaultExchange';

    this.assertExchangeOptions = params.assertExchangeOptions || {
      durable: true,
    };

    this.assertQueueOptions = params.assertQueueOptions || {
      exclusive: true,
    };
  }

  /**
   * @param {string} type
   * @returns {Array} - Return the connection in rabbitMQ
   */
  assertExchangeArgs(type = 'topic') {
    return [this.exchange, type, this.assertExchangeOptions];
  }

  /**
   * @returns {Promise} - Return the connection in rabbitMQ
   */
  openConnection() {
    return new Promise((resolve, reject) => {
      amqp.connect(this.rabbitMqHost, (error, connection) => {
        if (error) reject(error);
        resolve(connection);
      });
    });
  }

  /**
   * @param {object} connection - Instance of connection in rabbitMQ
   * @param {integer} time - Time in seconds to close the instance of connection
   * @return {Promise} - Return the connection in rabbitMQ
   */
  closeConnection(connection, time = null) {
    if (!time) connection.close();
    setTimeout(() => connection.close(), time);
  }

  /**
   * @returns {Promise} - Return the connection with a channel in rabbitMQ
   */
  async createChannel() {
    const connection = await this.openConnection(this.rabbitMqHost);
    return new Promise((resolve, reject) => {
      connection.createChannel((error, channel) => {
        if (error) reject(error);
        resolve({ connection, channel });
      });
    });
  }

  /**
   * @param {any} param
   * @returns {String} - Return the payload to request in format string
   */
  convertToString(param) {
    if (!param) throw Error('This param not is valid.');
    if (typeof param === 'string') return Buffer.from(param);
    return Buffer.from(JSON.stringify(param));
  }
}

module.exports = RabbitMq;
