'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AddShoppingCart, Edit, Delete } from '@mui/icons-material';
import { collection, getDocs, getDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestore, analytics } from '@/firebase'; // Adjust the import based on your file structure
import { logEvent } from 'firebase/analytics';
import { v4 as uuidv4 } from 'uuid';

// Define custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000', // Black
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e5e7eb', // Light grey
    },
    error: {
      main: '#dc2626',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          transition: 'background-color 0.3s, color 0.3s',
          '&:hover': {
            backgroundColor: '#333333',
            color: '#ffffff',
          },
          '&:active': {
            backgroundColor: '#555555',
            color: '#ffffff',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
  },
});

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(1, 2),
  position: 'relative',
  width: '100%',
  padding: 10,
}));

const HeaderContent = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 0,
  margin: 0,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

const HeaderText = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  fontSize: '1rem', // Smaller text
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem', // Smaller text on small screens
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  textAlign: 'center',
  position: 'fixed',
  bottom: 0,
  width: '100%',
}));

const Page = () => {
  // Generate or retrieve session ID
  const sessionId = sessionStorage.getItem('sessionId') || uuidv4();
  if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', sessionId);
  }

  // Firestore collection reference with session ID
  const collectionRef = collection(firestore, `pantry-items-${sessionId}`);

  const [pantryItems, setPantryItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemExpiration, setNewItemExpiration] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const updatePantry = async () => {
    const snapshot = await getDocs(collectionRef);
    const pantryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPantryItems(pantryList);
    // Log event
    if (analytics) {
      logEvent(analytics, 'update_pantry');
    }
  };

  useEffect(() => {
    updatePantry();
    // Clear session ID on component unmount (page unload)
    return () => {
      sessionStorage.removeItem('sessionId');
    };
  }, []);

  const addItem = async (name, quantity, expiration) => {
    const docRef = doc(collectionRef, name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + Number(quantity), expiration }, { merge: true });
    } else {
      await setDoc(docRef, { name, quantity: Number(quantity) || 1, expiration });
    }
    await updatePantry();
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemExpiration('');
    // Log event
    if (analytics) {
      logEvent(analytics, 'add_item', { itemName: name });
    }
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(collectionRef, id));
    await updatePantry();
    // Log event
    if (analytics) {
      logEvent(analytics, 'delete_item', { itemId: id });
    }
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemQuantity(item.quantity);
    setNewItemExpiration(item.expiration);
  };

  const editItem = async (id, name, quantity, expiration) => {
    const docRef = doc(collectionRef, id);
    await setDoc(docRef, { name, quantity: Number(quantity) || 1, expiration }, { merge: true });
    await updatePantry();
    setEditingItem(null);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemExpiration('');
    // Log event
    if (analytics) {
      logEvent(analytics, 'edit_item', { itemId: id, itemName: name });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Header>
        <HeaderContent maxWidth="2000">
          <a href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <AddShoppingCart fontSize="medium" />
            <HeaderText variant="h6" component="span">Pantry Pal</HeaderText>
          </a>
        </HeaderContent>
      </Header>

      <Container maxWidth="lg" sx={{ marginTop: 4, paddingBottom: 8 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          <Card sx={{ flex: 1 }}>
            <CardHeader title={editingItem ? "Edit Pantry Item" : "Add Pantry Item"} />
            <CardContent>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body1">Name</Typography>
                  <TextField
                    placeholder="Enter item name"
                    fullWidth
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </Box>
                <Box>
                  <Typography variant="body1">Quantity</Typography>
                  <TextField
                    type="number"
                    placeholder="Enter quantity"
                    fullWidth
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                  />
                </Box>
                <Box>
                  <Typography variant="body1">Expiration Date</Typography>
                  <TextField
                    type="date"
                    fullWidth
                    value={newItemExpiration}
                    onChange={(e) => setNewItemExpiration(e.target.value)}
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (editingItem) {
                      editItem(editingItem.id, newItemName, newItemQuantity, newItemExpiration);
                    } else {
                      addItem(newItemName, newItemQuantity, newItemExpiration);
                    }
                  }}
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 2 }}>
            <CardHeader title="Pantry Items" />
            <CardContent>
              <TableContainer sx={{ maxHeight: 350, overflowY: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Expiration Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pantryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.expiration || 'No expiry date'}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => startEditing(item)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => deleteItem(item.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Footer>
        <Typography variant="body2">© 2024 Pantry Pal. All rights reserved.</Typography>
      </Footer>
    </ThemeProvider>
  );
};

export default Page;
