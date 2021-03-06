const { Router } = require('express');
const { Queue } = require('../../models');
const { QueueLate } = require('../../models');
const { Visitor } = require('../../models');

const Logger = require('../../utils/logger');

// eslint-disable-next-line no-unused-vars
function logThis(str) {
  Logger.log(str);
}

const router = new Router();

router.get('/', (req, res) => {
  res.status(200).json(Queue.get());
});

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

router.get('/:queueId/number-left', (req, res) => {
  try {
    const queue = Queue.getById(req.params.queueId);
    let left = queue.visitorsIds.length - queue.currentIndex;

    const possibleQueueLate = QueueLate.get().filter(q => q.queueId === queue.id);

    if (possibleQueueLate.length > 0) {
      left += possibleQueueLate[0].lateVisitorsIds.length;
    }

    if (left < 0) left = 0;

    res.status(200).json(left);
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

    QueueLate.createWithNextId({
      lateVisitorsIds: [],
      queueId: newQueue.id,
      myBool: 0,
    });
    Queue.update(newQueue.id, newQueue);
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

router.put('/:queueId/next-visitor', (req, res) => {
  try {
    const queue = Queue.getById(req.params.queueId);

    if (queue.visitorsIds.length === 0) {
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

router.put('/:queueId/previous-visitor', (req, res) => {
  try {
    /* WIP */
    const queue = Queue.getById(req.params.queueId);
    const queueLate = QueueLate.get().filter(ql => ql.queueId === queue.id)[0];

    queue.currentIndex -= 1;
    if (queue.currentIndex < 0) queue.currentIndex = 0;
    Queue.update(queue.id, queue);

    if (queue.visitorsIds.length <= 1 || queue.currentIndex < 1) {
      logThis('OOOOH 1');
      res.status(404).end();
      return;
    }

    const visitorId = queue.visitorsIds[queue.currentIndex - 1];
    logThis(visitorId);
    if (queueLate.lateVisitorsIds.length > 0 && queueLate.lateVisitorsIds.includes(visitorId)) {
      logThis(visitorId);
      remove(queueLate.lateVisitorsIds, visitorId);
    }
    QueueLate.update(queueLate.id, queueLate);
    res.status(200).json(Visitor.getById(visitorId));
  } catch (err) {
    logThis(err);
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

router.put('/:queueId/next-visitor/strategy/1', (req, res) => {
  try {
    const queue = Queue.getById(req.params.queueId);
    const queueLate = QueueLate.get().filter(ql => ql.queueId === queue.id)[0];

    if (queue.visitorsIds.length === 0 && queueLate.lateVisitorsIds.length === 0) {
      res.status(404).end();
      return;
    }
    let visitorId;
    if (queue.currentIndex === queue.visitorsIds.length
      && queueLate.lateVisitorsIds.length > 0) {
      visitorId = queueLate.lateVisitorsIds.shift();
    } else {
      visitorId = queue.visitorsIds[queue.currentIndex];
      queue.currentIndex += 1;
    }

    QueueLate.update(queueLate.id, queueLate);
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

router.put('/:queueId/next-visitor/strategy/2', (req, res) => {
  try {
    const queue = Queue.getById(req.params.queueId);
    const queueLate = QueueLate.get().filter(ql => ql.queueId === queue.id)[0];

    if (queue.visitorsIds.length === 0 && queueLate.lateVisitorsIds.length === 0) {
      res.status(404).end();
      return;
    }

    let visitorId;
    if (queue.currentIndex === queue.visitorsIds.length
      && queueLate.lateVisitorsIds.length > 0) {
      visitorId = queueLate.lateVisitorsIds.shift();
    } else if (queueLate.lateVisitorsIds.length > 0 && queueLate.myBool === 1) {
      visitorId = queueLate.lateVisitorsIds.shift();
      queueLate.myBool = 0;
    } else {
      visitorId = queue.visitorsIds[queue.currentIndex];
      queue.currentIndex += 1;

      queueLate.myBool = 1;
    }

    QueueLate.update(queueLate.id, queueLate);
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

router.put('/:queueId/absent-visitor', (req, res) => {
  try {
    const queue = Queue.getById(req.params.queueId);

    if (queue.visitorsIds.length === 0) {
      res.status(404).end();
      return;
    }

    const visitorMissingId = queue.visitorsIds[queue.currentIndex - 1];
    const queueLate = QueueLate.get().filter(ql => ql.queueId === queue.id)[0];
    queueLate.lateVisitorsIds.push(visitorMissingId);

    queue.currentIndex += 1;
    Queue.update(queue.id, queue);
    QueueLate.update(queueLate.id, queueLate);

    // -1, the current id is already on the next visitor
    res.status(200).json(Visitor.getById(queue.visitorsIds[queue.currentIndex - 1]));
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

router.delete('/:queueId', (req, res) => {
  let queueId = req.params.queueId; // eslint-disable-line
  if (typeof queueId === 'string') queueId = parseInt(queueId, 10);
  try {
    const queue = Queue.getById(queueId);
    const queueLateToDeleteList = QueueLate.get()
      .filter(queueLate => queueLate.queueId === queueId);
    queueLateToDeleteList.forEach(
      queueLateToDelete => QueueLate.delete(queueLateToDelete.id),
    );
    Queue.delete(queue.id);
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
