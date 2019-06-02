const { Router } = require('express');
const QueuesRouter = require('./queues');
const VisitorsRouter = require('./visitors');

const router = new Router();
router.get('/status', (req, res) => res.status(200).json('ok'));
router.use('/queues', QueuesRouter);
router.use('/visitors', VisitorsRouter);

module.exports = router;
