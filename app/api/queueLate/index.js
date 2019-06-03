const { Router } = require('express');
const { QueueLate } = require('../../models');
const Logger = require('../../utils/logger');

const router = new Router();

function logThis(str) {
  Logger.log(str);
}

router.get('/status', (req, res) => res.status(200).json('ok QueueLate'));
router.get('/', (req, res) => res.status(200).json(QueueLate.get()));


router.post('/', (req, res) => {
  try {
    const newLateQueue = QueueLate.createWithNextId(req.body);
    if (typeof newLateQueue.lateVisitorsIds === 'undefined'
      || !newLateQueue.lateVisitorsIds) {
      QueueLate.update(newLateQueue.id, {
        lateVisitorsIds: [],
      });
    }
    if (typeof newLateQueue.indexOfLateVisitorsInMainQueue === 'undefined'
      || !newLateQueue.indexOfLateVisitorsInMainQueue) {
      QueueLate.update(newLateQueue.id, {
        indexOfLateVisitorsInMainQueue: [],
      });
    }
    res.status(201).json(QueueLate.getById(newLateQueue.id));
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      logThis(err);
      res.status(500).json(err);
    }
  }
});

router.delete('/:queueLateId', (req, res) => {
  let queueLateId = req.params.queueLateId; // eslint-disable-line
  if (typeof queueLateId === 'string') queueLateId = parseInt(queueLateId, 10);
  try {
    QueueLate.delete(queueLateId);
    res.status(204).end();
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;