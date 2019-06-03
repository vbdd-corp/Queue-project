const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class Queue extends BaseModel {
  constructor() {
    super('Queue', {
      id: Joi.number().required(),
      visitorsIds: Joi.array().items(Joi.number()),
      currentIndex: Joi.number(),
      lateQueueId: Joi.number(),
    });
  }
}

module.exports = new Queue();
