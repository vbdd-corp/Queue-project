const { Router } = require('express');
const { Queue } = require('../../models');
const { Visitor } = require('../../models');

const router = new Router();

router.get('/', (req, res) => res.status(200).json(Queue.get()));

router.get('/:queueId', (req, res) => {
  try {
    res.status(200).json(Queue.getById(req.params.queueId));
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
    const newQueue = Queue.createWithNextId(req.body);
    if (!newQueue.visitorsIds) newQueue.visitorsIds = [];
    if (!newQueue.currentIndex) newQueue.currentIndex = 0;
    res.status(201).json(newQueue);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

router.put('/:queueId', (req, res) => {
  try {
    res.status(200).json(Queue.update(req.params.queueId, req.body));
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

router.put('/:queueId/add/:visitorId', (req, res) => {
  try {
    // check if visitor exists in base
    Visitor.getById(req.params.visitorId);

    const queue = Queue.getById(req.params.queueId);
    queue.visitorsIds.push(parseInt(req.params.visitorId, 10));

    res.status(200).json(Queue.update(req.params.queueId, queue));
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

function remove(array, element) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}

router.put('/:queueId/remove/:visitorId', (req, res) => {
  try {
    // check if visitor exists in base
    Visitor.getById(req.params.visitorId);

    const queue = Queue.getById(req.params.queueId);
    remove(queue.visitorsIds, parseInt(req.params.visitorId, 10));

    res.status(200).json(Queue.update(req.params.queueId, queue));
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

router.get('/:queueId/next-visitor', (req, res) => {
  try {

    const queue = Queue.getById(req.params.queueId);

    if(queue.visitorsIds.length === 0){
      res.status(404).end();
      return;
    }

    const visitorId = queue.visitorsIds[queue.currentIndex];
    queue.currentIndex += 1;
    Queue.update(queue.id, queue);

    res.status(200).json(Visitor.getById(visitorId));
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

router.get('/:queueId/previous-visitor', (req, res) => {
  try {

    const queue = Queue.getById(req.params.queueId);

    if(queue.visitorsIds.length <= 1 || queue.currentIndex <= 1){
      res.status(404).end();
      return;
    }

    // -2 , because the index is actually on the next visitor
    const visitorId = queue.visitorsIds[queue.currentIndex - 2];
    queue.currentIndex -= 1;
    Queue.update(queue.id, queue);

    res.status(200).json(Visitor.getById(visitorId));
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
