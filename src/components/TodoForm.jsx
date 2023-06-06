import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import axios from "axios";

export default function TodoForm({ todos, setTodos }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);

  const handleChangeName = (e) => {
    setName(e.target.value);
  };

  const handleChangeDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleChangePriority = (e) => {
    setPriority(parseInt(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !description || !priority) {
      alert("Please provide valid values for all fields");
      return;
    }

    axios
      .post("/api/todos/", {
        name: name,
        description: description,
        priority: priority,
      })
      .then((res) => {
        setName("");
        setDescription("");
        setPriority(0);
        const { data } = res;
        setTodos([...todos, data]);
      })
      .catch(() => {
        alert("Something went wrong");
      });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ marginBottom: "1rem" }}>
      <TextField
        label="Titulo da Tarefa"
        variant="outlined"
        onChange={handleChangeName}
        value={name}
        sx={{ marginRight: "0.5rem" }}
      />
      <TextField
        label="Descrição"
        variant="outlined"
        onChange={handleChangeDescription}
        value={description}
        sx={{ marginRight: "0.5rem" }}
      />
      <TextField
        label="Prioridade da Tarefa"
        type="number"
        variant="outlined"
        onChange={handleChangePriority}
        value={priority}
        sx={{ marginRight: "0.5rem" }}
      />
      <Button type="submit" variant="contained">
        Adcionar
      </Button>
    </Box>
  );
}
