const { Router } = require('express');
const { QueueLate } = require('../../models');
const { Queue } = require('../../models');

const Logger = require('../../utils/logger');

function logThis(str) {
  Logger.log(str);
}
const router = new Router();

function getQueueSafely(qlId) {
  try {
    return Queue.getById(qlId);
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return null;
    }
    throw err;
  }
}

const attachQueue = (lateQueue) => {
  const resLateQueue = Object.assign({}, lateQueue, {
    queue: getQueueSafely(lateQueue.queueId),
  });
  delete resLateQueue.queueId;
  return resLateQueue;
};

router.get('/status', (req, res) => res.status(200).json('ok QueueLate'));
router.get('/', (req, res) => {
  const resArray = QueueLate.get().map(qlate => attachQueue(qlate));
  res.status(200).json(resArray);
});

router.get('/:queueLateId', (req, res) => {
  try {
    res.status(200).json(attachQueue(QueueLate.getById(req.params.queueLateId)));
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
    const newLateQueue = QueueLate.createWithNextId(req.body);
    if (!newLateQueue.lateVisitorsIds) newLateQueue.lateVisitorsIds = [];
    if (!newLateQueue.queueId) newLateQueue.queueId = -1;

    QueueLate.update(newLateQueue.id, newLateQueue);
    res.status(201).json(newLateQueue);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      logThis(err);
      res.status(500).json(err);
    }
  }
});

/*
* const newQueueLate = QueueLate.createWithNextId({
      lateVisitorsIds: [],
      indexOfLateVisitorsInMainQueue: [],
    });
    Queue.update(newQueue.id, {
      lateQueueId: newQueueLate.id,
    });
*
* */

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
