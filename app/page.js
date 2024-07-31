'use client';

import { useState } from 'react';
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
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AddShoppingCart, Logout, Edit, Delete, Menu as MenuIcon } from '@mui/icons-material';

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

const DrawerListItem = styled(ListItem)(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
  },
}));

const SignOutLink = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  color: theme.palette.primary.contrastText,
  textAlign: 'center',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const Page = () => {
  const [pantryItems, setPantryItems] = useState([
    { name: 'Apples', quantity: 10, expiration: '2023-06-30' },
    { name: 'Eggs', quantity: 12, expiration: '2023-07-15' },
    { name: 'Flour', quantity: '5 lbs', expiration: '2024-01-01' },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Header>
        <HeaderContent maxWidth="2000">
          <a href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
            <AddShoppingCart fontSize="medium" />
            <HeaderText variant="h6" component="span">Pantry Tracker</HeaderText>
          </a>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Pantry</a>
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Profile</a>
            <SignOutLink component="a" href="/" variant="body1">Sign Out</SignOutLink>
          </Box>
          <IconButton
            sx={{ display: { xs: 'flex', sm: 'none' }, color: theme.palette.primary.contrastText }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </HeaderContent>
      </Header>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ sx: { backgroundColor: '#000000', color: '#ffffff' } }}
      >
        <List>
          <DrawerListItem button component="a" href="/" onClick={handleDrawerToggle}>
            <ListItemText primary="Pantry" />
          </DrawerListItem>
          <DrawerListItem button component="a" href="/" onClick={handleDrawerToggle}>
            <ListItemText primary="Profile" />
          </DrawerListItem>
          <DrawerListItem button onClick={handleDrawerToggle}>
            <SignOutLink component="a" href="/" variant="body1">Sign Out</SignOutLink>
          </DrawerListItem>
        </List>
      </Drawer>

      <Container maxWidth="lg" sx={{ marginTop: 4, paddingBottom: 8 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          <Card sx={{ flex: 1 }}>
            <CardHeader title="Add Pantry Item" />
            <CardContent>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body1">Name</Typography>
                  <TextField placeholder="Enter item name" fullWidth />
                </Box>
                <Box>
                  <Typography variant="body1">Quantity</Typography>
                  <TextField type="number" placeholder="Enter quantity" fullWidth />
                </Box>
                <Box>
                  <Typography variant="body1">Expiration Date</Typography>
                  <TextField type="date" fullWidth />
                </Box>
                <Button variant="contained" sx={{ alignSelf: 'flex-end' }}>Add Item</Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: 2 }}>
            <CardHeader title="Pantry Items" />
            <CardContent>
              <TableContainer sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Expiration</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pantryItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.expiration}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete fontSize="small" />
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
        <Typography variant="body2">&copy; 2024 Pantry Tracker</Typography>
      </Footer>
    </ThemeProvider>
  );
};

export default Page;
