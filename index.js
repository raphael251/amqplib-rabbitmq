const Exchange = require('./src/producers/exchange/Publish');
const Consumer = require('./src/consumers/Consumer');

class RabbitMQ {
  constructor(...args) {
    this.exchange = new Exchange(args);
    this.consumer = new Consumer(args);
  }

  /**
   * @function
   * @param {any} message
   * @param {object} options
   * @returns {Promise}
   */
  sendMsgAndReceiveResponse(message, options = {}) {
    return this.exchange.sendMessageByTopicAndGetResponse(message, options);
  }

  /**
   * @function
   * @param {any} message
   * @param {integer} time
   * @returns {Promise}
   */
  sendMessageByTopic(message, time = 500) {
    return this.exchange.sendMessageByTopicOrDirect(message, time, 'topic');
  }

  /**
   * @function
   * @param {any} message
   * @param {integer} time
   * @returns {Promise}
   */
  sendMessageByRoute(message, time = 500) {
    return this.exchange.sendMessageByTopicOrDirect(message, time, 'direct');
  }

  /**
   * @function
   * @param {function} callback
   * @returns {Promise}
   */
  consumeByRoute(callback) {
    return this.consumer.consumeByTopicOrDirect(callback, 'direct');
  }

  /**
   * @function
   * @param {function} callback
   * @returns {Promise}
   */
  consumeByTopic(callback) {
    return this.consumer.consumeByTopicOrDirect(callback, 'topic');
  }

  /**
   * @function
   * @param {function} callback
   * @returns {Promise}
   */
  consumeAndReturnResponse(callback) {
    return this.consumer.consumeByTopicAndReturnResponse(callback);
  }
}

module.exports = RabbitMQ;
