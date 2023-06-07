import express, { response } from "express";
import morgan from "morgan";
import cors from "cors";

const persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const app = new express();
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);
app.use(cors());
app.use(express.static("build"));

morgan.token("content", (request) =>
  request.method === "POST" && request.body.name
    ? JSON.stringify(request.body)
    : null
);

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => {
    return person.id === id;
  });
  if (person) {
    response.send(person);
  } else {
    response.status(404).send();
  }
});

app.get("/info", (request, response) => {
  const currentTime = new Date().toString();

  response.send(`
    <div>
      <p>Phonebook has info for ${persons.length} person</p>
      <p>${currentTime}</p>
    </div>
  `);
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "The name or number is missing",
    });
  } else if (persons.find((person) => person.name === request.body.name)) {
    return response.status(400).json({
      error: "The name already exists in the phonebook",
    });
  }

  const newPerson = {
    id: Math.random().toString().slice(3, 15),
    name: body.name,
    number: body.number,
  };
  persons.concat(newPerson);
  response.json(newPerson);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons.splice(id - 1, 1);
  response.status(204).send();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
