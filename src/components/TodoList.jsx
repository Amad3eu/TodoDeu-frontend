import axios from "axios";
import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

export default function TodoList({ todos = [], setTodos }) {
  const [show, setShow] = useState(false);
  const [record, setRecord] = useState(null);

  const handleClose = () => {
    setShow(false);
  };

  const handleDelete = (id) => {
    axios
      .delete(`/api/todos/${id}/`)
      .then(() => {
        const newTodos = todos.filter((t) => {
          return t.id !== id;
        });
        setTodos(newTodos);
      })
      .catch(() => {
        alert("Something went wrong");
      });
  };

  const handleUpdate = async (id, values) => {
    return axios
      .patch(`/api/todos/${id}/`, values)
      .then((res) => {
        const { data } = res;
        const newTodos = todos.map((t) => {
          if (t.id === id) {
            return data;
          }
          return t;
        });
        setTodos(newTodos);
      })
      .catch(() => {
        alert("Something went wrong");
      });
  };

  const renderListItem = (t) => {
    let priorityLabel = "";
    let chipColor = "";

    if (t.priority >= 0 && t.priority <= 4) {
      priorityLabel = "Baixa";
      chipColor = "success";
    } else if (t.priority >= 5 && t.priority <= 7) {
      priorityLabel = "Média";
      chipColor = "warning";
    } else {
      priorityLabel = "Alta";
      chipColor = "error";
    }

    return (
      <ListItem
        key={t.id}
        className="d-flex justify-content-between align-items-center"
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Checkbox
              checked={t.completed}
              onChange={() => {
                handleUpdate(t.id, {
                  completed: !t.completed,
                });
              }}
              icon={<MdCheckBoxOutlineBlank />}
              checkedIcon={<MdCheckBox />}
            />
          </Grid>
          <Grid item>
            <ListItemText
              primary={`Titulo: ${t.name}`}
              secondary={`Descrição: ${t.description}`}
            />
          </Grid>
          <Grid item>
            <Chip label={priorityLabel} color={chipColor} size="small" />
          </Grid>
        </Grid>
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => {
              setRecord(t);
              setShow(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => {
              handleDelete(t.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  const handleChange = (e) => {
    setRecord({
      ...record,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    await handleUpdate(record.id, {
      name: record.name,
      description: record.description,
      priority: record.priority,
    });
    handleClose();
  };

  const sortedIncompleteTodos = [...todos]
    .filter((t) => !t.completed)
    .sort((a, b) => b.priority - a.priority);

  const sortedCompletedTodos = [...todos]
    .filter((t) => t.completed)
    .sort((a, b) => b.priority - a.priority);

  return (
    <div>
      <div className="mb-2 mt-4">
        Tarefas incompletas ({sortedIncompleteTodos.length})
      </div>
      <List>{sortedIncompleteTodos.map(renderListItem)}</List>
      <div className="mb-2 mt-4">
        Tarefas Completas ({sortedCompletedTodos.length})
      </div>
      <List>{sortedCompletedTodos.map(renderListItem)}</List>
      <Dialog open={show} onClose={handleClose}>
        <DialogTitle>Edit Todo</DialogTitle>
        <DialogContent>
          <TextField
            label="Titulo da Tarefa"
            name="name"
            value={record ? record.name : ""}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Descrição"
            name="description"
            value={record ? record.description : ""}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Prioridade da Tarefa"
            name="priority"
            type="number"
            value={record ? record.priority : ""}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleSaveChanges} variant="contained" autoFocus>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
