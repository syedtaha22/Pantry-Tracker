'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Card, CardHeader, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, createTheme, ThemeProvider, Menu, MenuItem, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AddShoppingCart, Edit, Delete, Logout, AccountCircle } from '@mui/icons-material';
import { collection, getDocs, getDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { firestore, auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Analytics } from "@vercel/analytics/react";
import withAuth from '../protectedRoute';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [pantryItems, setPantryItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemExpiration, setNewItemExpiration] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
  const [userEmail, setUserEmail] = useState(''); // State to hold user email
  const [userUid, setUserUid] = useState(''); // State to hold user UID
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const router = useRouter(); // Initialize router

  useEffect(() => {
    // Fetch the current user's email and UID
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserUid(user.uid);
      } else {
        setUserEmail('');
        setUserUid('');
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const updatePantry = async () => {
    if (userUid) {
      const snapshot = collection(firestore, `pantry-items-${userUid}`);
      const docs = await getDocs(snapshot);
      const pantryList = [];
      docs.forEach((doc) => {
        pantryList.push({ id: doc.id, ...doc.data() });
      });
      setPantryItems(pantryList);
    }
  };

  useEffect(() => {
    if (userUid) {
      updatePantry();
    }
  }, [userUid]);

  const addItem = async (name, quantity, expiration) => {
    if (userUid) {
      const docRef = doc(firestore, `pantry-items-${userUid}`, name);
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
    }
  };

  const deleteItem = async (id) => {
    if (userUid) {
      await deleteDoc(doc(firestore, `pantry-items-${userUid}`, id));
      await updatePantry();
    }
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemQuantity(item.quantity);
    setNewItemExpiration(item.expiration);
  };

  const editItem = async (id, name, quantity, expiration) => {
    if (userUid) {
      const docRef = doc(firestore, `pantry-items-${userUid}`, id);
      await setDoc(docRef, { name, quantity: Number(quantity) || 1, expiration }, { merge: true });
      await updatePantry();
      setEditingItem(null);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemExpiration('');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/'); // Redirect to the landing page after signing out
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getInventoryItems = async () => {
    const snapshot = collection(firestore, `pantry-items-${userUid}`);
    const docs = await getDocs(snapshot);
    const inventoryList = docs.docs.map(doc => doc.data().name);
    return inventoryList;
  };

  const handleGetRecipes = async () => {
    setLoading(true);
    const inventory = await getInventoryItems();
  
    const response = await fetch('/api/recipe-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: inventory }), // Changed from inventory to items
    });
  
    const data = await response.json();
    setSuggestions(data.recipe); // Adjusted based on the previous response structure
    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Header>
        <HeaderContent maxWidth="2000">
          <a href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <AddShoppingCart fontSize="medium" />
            <HeaderText variant="h6" component="span">Pantry Pal</HeaderText>
          </a>
          <IconButton
            onClick={handleMenuOpen}
            sx={{ marginLeft: 'auto' }}
            color="inherit"
          >
            <AccountCircle fontSize="large" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem>
              <Typography variant="body2">{userEmail}</Typography>
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <Logout fontSize="small" />
              <Typography variant="body2" sx={{ marginLeft: 1 }}>Sign Out</Typography>
            </MenuItem>
          </Menu>
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
                      <TableCell>Expiration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pantryItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.expiration}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => startEditing(item)}>
                            <Edit color="primary" />
                          </IconButton>
                          <IconButton onClick={() => deleteItem(item.id)}>
                            <Delete color="error" />
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

        <Button
          variant="contained"
          color="primary"
          onClick={handleGetRecipes}
          sx={{ marginTop: 4 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Get Recipe Suggestions'}
        </Button>

        {suggestions && (
          <Card sx={{ marginTop: 4, paddingLeft: 2 }}>
            {/* <CardHeader title="Recipe Suggestions" /> */}
            <CardContent>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {suggestions}
              </ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </Container>

      <Footer>
        <Typography variant="body2">© 2024 Pantry Pal</Typography>
      </Footer>

      <Analytics />
    </ThemeProvider>
  );
};

export default withAuth(Page);
