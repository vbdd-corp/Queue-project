const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

class Visitor extends BaseModel {
  constructor() {
    super('Visitor', {
      id: Joi.number().required(),
    });
  }
}

module.exports = new Visitor();
