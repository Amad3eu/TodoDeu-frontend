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
import { green, grey, pink } from "@mui/material/colors";
import {
  Bookmark,
  BookmarkBorder,
  Cancel,
  Check,
  Delete,
  Numbers,
  PriorityHigh,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { Box, Divider, Typography } from "@mui/material";

export default function TodoList({ todos = [], setTodos }) {
  const [show, setShow] = useState(false);
  const [record, setRecord] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPriority, setBulkPriority] = useState("");
  const [showPriorityDialog, setShowPriorityDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleClose = () => {
    setShow(false);
  };
  const handleBulkActionsOpen = () => {
    setShowBulkActions(true);
  };

  const handleClosePriorityDialog = () => {
    setShowPriorityDialog(false);
  };

  const handleBulkPriorityChange = (e) => {
    setBulkPriority(e.target.value);
  };

  const handleBulkPriorityUpdate = () => {
    const updatedTodos = todos.map((t) => {
      if (selectedIds.includes(t.id)) {
        return { ...t, priority: Number(bulkPriority) };
      }
      return t;
    });

    const updatePromises = selectedIds.map((id) => {
      return handleUpdate(id, { priority: Number(bulkPriority) });
    });

    Promise.all(updatePromises)
      .then(() => {
        setTodos(updatedTodos);
        setSelectedIds([]);
        setBulkPriority("");
        handleClosePriorityDialog(); // Fechar o diálogo após a atualização
      })
      .catch(() => {
        alert("Something went wrong");
      });
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

  const handleBulkDelete = () => {
    const deletePromises = selectedIds.map((id) => {
      return axios.delete(`/api/todos/${id}/`);
    });

    Promise.all(deletePromises)
      .then(() => {
        const newTodos = todos.filter((t) => !selectedIds.includes(t.id));
        setTodos(newTodos);
        setSelectedIds([]);
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

  const handleToggleTodo = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
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
      <ListItem className="d-flex justify-content-between align-items-center">
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Checkbox
              checked={selectedIds.includes(t.id)}
              onChange={() => {
                handleToggleTodo(t.id);
              }}
              icon={<RadioButtonUnchecked />}
              checkedIcon={<RadioButtonChecked />}
            />
          </Grid>
          <Grid item>
            <Divider orientation="vertical" flexItem />
          </Grid>
          <Grid item>
            <Checkbox
              icon={<BookmarkBorder />}
              checkedIcon={<Bookmark />}
              sx={{
                "& .MuiSvgIcon-root": { fontSize: 28 },
                color: green[800],
                "&.Mui-checked": {
                  color: green[600],
                },
              }}
              checked={t.completed}
              onChange={() => {
                handleUpdate(t.id, {
                  completed: !t.completed,
                });
              }}
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

  const handleSelectAll = () => {
    if (selectedIds.length === todos.length) {
      setSelectedIds([]);
    } else {
      const allIds = todos.map((t) => t.id);
      setSelectedIds(allIds);
    }
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

  const handleBulkComplete = (completed) => {
    const updatedTodos = todos.map((t) => {
      if (selectedIds.includes(t.id)) {
        return { ...t, completed: completed };
      }
      return t;
    });

    const updatePromises = selectedIds.map((id) => {
      return handleUpdate(id, { completed: completed });
    });

    Promise.all(updatePromises)
      .then(() => {
        setTodos(updatedTodos);
        setSelectedIds([]);
      })
      .catch(() => {
        alert("Something went wrong");
      });
  };

  return (
    <div>
      <div className="mb-2 mt-4">
        <Box display="flex" alignItems="center">
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            Selecionar todos:
          </Typography>
          <Checkbox
            checked={selectedIds.length === todos.length}
            indeterminate={
              selectedIds.length > 0 && selectedIds.length < todos.length
            }
            onChange={handleSelectAll}
            icon={<RadioButtonUnchecked />}
            checkedIcon={<RadioButtonChecked />}
          />
        </Box>
        <Button
          variant="contained"
          onClick={handleBulkActionsOpen}
          disabled={selectedIds.length === 0}
          color="primary"
          sx={{ bgcolor: grey[600] }}
          endIcon={<EditIcon />}
        >
          Editar em Massa
        </Button>

        <Dialog
          open={showBulkActions}
          onClose={() => setShowBulkActions(false)}
        >
          <DialogTitle>Ações em Massa</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() => handleBulkComplete(true)}
                  disabled={selectedIds.length === 0}
                  color="success"
                  endIcon={<Check />}
                  fullWidth
                >
                  Marcar selecionados como completos
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() => handleBulkComplete(false)}
                  disabled={selectedIds.length === 0}
                  color="secondary"
                  endIcon={<Cancel />}
                  fullWidth
                >
                  Marcar selecionados como incompletos
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  color="error"
                  endIcon={<Delete />}
                  fullWidth
                >
                  Excluir selecionados
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() => setShowPriorityDialog(true)}
                  disabled={selectedIds.length === 0}
                  color="warning"
                  endIcon={<PriorityHigh />}
                  fullWidth
                >
                  Editar prioridade
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </div>
      <Dialog open={showPriorityDialog} onClose={handleClosePriorityDialog}>
        <DialogTitle>Editar Prioridade em Massa</DialogTitle>
        <DialogContent>
          <TextField
            label="Nova Prioridade"
            type="number"
            value={bulkPriority}
            onChange={handleBulkPriorityChange}
            margin="dense"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePriorityDialog}>Cancelar</Button>
          <Button
            onClick={handleBulkPriorityUpdate}
            variant="contained"
            autoFocus
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

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
