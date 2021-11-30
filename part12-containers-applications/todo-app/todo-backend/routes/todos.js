const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const redis = require('../redis')

const todoCounter = async () => {
  const counter = await redis.getAsync('count') || 0;
  await redis.setAsync('count', parseInt(counter)+1);
}

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  todoCounter();
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.send(req.todo)
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  if(!req.body) return res.status(404).json({});

  updatedTodo = await Todo.updateOne(req.body);

  res.json(updatedTodo);
});

router.use('/:id', findByIdMiddleware, singleRouter)




module.exports = router;
