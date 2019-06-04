const Joi = require('joi');
const BaseModel = require('../utils/base-model');

class QueueLate extends BaseModel {
  constructor() {
    super('QueueLate', {
      id: Joi.number().required(),
      lateVisitorsIds: Joi.array().items(Joi.number()),
      indexOfLateVisitorsInMainQueue: Joi.array().items(Joi.number()),
      queueId: Joi.number(),
    });
  }
}

module.exports = new QueueLate();
