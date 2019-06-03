const { Router } = require('express');
const QueuesRouter = require('./queues');
const VisitorsRouter = require('./visitors');
const QueueLateRouter = require('./queueLate');

const router = new Router();
router.get('/status', (req, res) => res.status(200).json('ok'));
router.use('/queues', QueuesRouter);
router.use('/visitors', VisitorsRouter);
router.use('/queue-late', QueueLateRouter);

module.exports = router;
