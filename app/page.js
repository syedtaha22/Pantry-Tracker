'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Modal,
  TextField,
  AppBar,
  Toolbar,
  Container,
  IconButton,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { collection, getDocs, setDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    const snapshot = collection(firestore, 'pantry-items');
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, count: doc.data().count });
    });
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(firestore, 'pantry-items', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }
    await updatePantry();
    handleClose();
  };

  const removeItem = async (item) => {
    const docRef = doc(firestore, 'pantry-items', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
    }
    await updatePantry();
  };

  const handleNewItemChange = (event) => setNewItem(event.target.value);

  const handleAddNewItem = async () => {
    if (newItem.trim()) {
      await addItem(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ bgcolor: '#f5f5f5' }}
    >
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pantry Manager
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 3 }}>
          Add Item
        </Button>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Pantry Items
          </Typography>
          <Stack spacing={2} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {pantry.length > 0 ? (
              pantry.map((item) => (
                <Box
                  key={item.name}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  bgcolor="white"
                  borderRadius="8px"
                  boxShadow="0 2px 5px rgba(0, 0, 0, 0.1)"
                >
                  <Typography variant="h6">{item.name}</Typography>
                  <Box display="flex" alignItems="center">
                    <IconButton
                      color="primary"
                      onClick={() => addItem(item.name)}
                      sx={{ mx: 1 }}
                    >
                      <AddIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ mx: 2 }}>
                      {item.count}
                    </Typography>
                    <IconButton
                      color="secondary"
                      onClick={() => removeItem(item.name)}
                      sx={{ mx: 1 }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary">
                No items in the pantry.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Container>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add New Item
          </Typography>
          <TextField
            label="Item Name"
            value={newItem}
            onChange={handleNewItemChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAddNewItem}
            sx={{ mt: 2 }}
            disabled={!newItem.trim()}
          >
            Add
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
