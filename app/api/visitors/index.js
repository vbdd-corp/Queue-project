const { Router } = require('express');
const { Visitor } = require('../../models');

const router = new Router();

router.get('/', (req, res) => res.status(200).json(Visitor.get()));

router.get('/:visitorId', (req, res) => {
  try {
    res.status(200).json(Visitor.getById(req.params.visitorId));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

router.post('/', (req, res) => {
  try {
    const newVisitor = Visitor.createWithNextId(req.body);
    res.status(201).json(newVisitor);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

router.put('/:visitorId', (req, res) => {
  try {
    res.status(200).json(Visitor.update(req.params.visitorId, req.body));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
