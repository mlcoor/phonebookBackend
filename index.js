import express, { response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import Person from './models/persons.js';
import dotenv from 'dotenv';

dotenv.config();
const app = new express();
app.use(express.json());
// app.use(express.static('build'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'));
app.use(cors());
morgan.token('content', request =>
  request.method === 'POST' && request.body.name ? JSON.stringify(request.body) : null,
);

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error });
  }
  next(error);
};

app.use(errorHandler);

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => response.json(result));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.get('/info', (request, response) => {
  const currentTime = new Date().toString();

  Person.find({}).then(persons => {
    response.send(
      `<div>
        <p>Phonebook has info for ${persons.length} people</p>
      </div>
      <div>
        <p>${currentTime}</p>
      </div>`,
    );
  });
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'The name or number is missing',
    });
  }
  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });
  newPerson
    .save()
    .then(result => response.json(result))
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
