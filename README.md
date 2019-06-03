# Queue-project
one week ps project

## MODELS

### Queue
 - id : number
 - visitorsIds : Array<number>  -> list of all visitors ids (initialised at [])
 - currentIndex : number -> index of the next visitor (initialised at 0)
  
### Visitor
- id : number

## API

### Queues /api/queues

 - get '/' -> return the list of all queues
 - get '/:queueId' -> return the queue of id : queueId
 
 - put '/:queueId/next-visitor' -> return the next visitor and update the queue
 - put '/:queueId/previous-visitor' -> return the previous visitor and update the queue
 - put '/:queueId'
 - put '/:queueId/add/:visitorId' -> add the visitor of id visitorId to the end of the queue
 - put '/:queueId/remove/:visitorId' -> remove the visitor of id visitorId from queue
 
 - post '/' -> create a new queue, if requested with an empty body all the fields are initialised at their default values (no undefined)
 
### Visitors /api/visitors

 - get '/' -> return the list of all visitors
 - get '/:visitorId' -> return the visitor of id : visitorId
 
 - put '/:visitorId'
 
 - post '/' -> create a new visitor

 
 
