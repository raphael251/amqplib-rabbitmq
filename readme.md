# RabbitMQ

The package use ampqlib for nodeJs to controll the RabbitMq.

## Install
To install with npm or yarn
```bash
$ npm install amqplib-rabbitmq
```
or
```bash
yarn add amqplib-rabbitmq
```

## How to use

### Consumer
To consume data you need a instance of RabbitMQ. The consumer need always to be listening for the messages, so you have to instantiate and let it working. For example, in expressJs lib, you could initialize the consumer when start the server.

You will need a callback function to any methods (this function receive the message object of rabbit as parameter) to handle the request.

To create a new instance of RabbitMq and have access to consumer you can do this:

```javascript
const RabbitMq = require('amqplib-rabbitmq')

const consumer = new RabbitMq('amqp://user:pass@localhost:5672', {
  queueName: 'QUEUE_NAME',
  routeKey: 'channel.category',
  exchange: 'exchange', // default value is defaultExchange
  assertExchangeOptions: {}, // default value is { durable: true }
  assertQueueOptions: // default value is { exclusive: true }
});
```

With instance of Rabbit you can use the methods.

```javascript
  const callback = msg => 'something'

  consumer.consumeAndReturnResponse(callback)

  consumer.consumeByTopic(callback)

  consumer.consumeByRoute(callback)
```

- The callback function to `consumeAndReturnResponse` need a response.
- `consumeByTopic` and `consumeByRoute` don't need a response.

### Publisher / Producer

To create a new instance of RabbitMq and have access to publisher you can do this.

```javascript
const RabbitMq = require('amqplib-rabbitmq')

const publisher = new RabbitMq('amqp://user:pass@localhost:5672', {
  queueName: 'QUEUE_NAME',
  routeKey: 'channel.category',
  exchange: 'exchange', // default value is defaultExchange
  assertExchangeOptions: {}, // default value is { durable: true }
  assertQueueOptions: // default value is { exclusive: true }
});
```

With instance of Rabbit you can use the methods.

`sendMsgAndReceiveResponse` if you are waiting a response.
- The object options is not required.

- `sendMsgAndReceiveResponse` return a Promise with a response.

```javascript
// optional object options
const options = {
  priority: 1 ~ 255 // default value is 10
  headers: {} // default is empty object
  messageId: 1234567 // Default value is null
}

const response = await publisher.sendMsgAndReceiveResponse(message, options)
```


```javascript
const time = 1000 // default time is 500 milliseconds
publisher.sendMessageByTopic(message, time)

publisher.sendMessageByRoute(message, time)
```
