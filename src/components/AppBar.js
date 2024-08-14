import * as React from 'react';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import MenuItem from '@mui/material/MenuItem';
import ApiRoundedIcon from '@mui/icons-material/ApiRounded';
import { BackendContext } from '../App'; // Ensure this path is correct
import { ThemeContext } from './ThemeContext'; // Import the ThemeContext
import { isValidUrl } from '../utils/isValidUrl';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import '../styles.css'; // Import the styles.css file


const pages = ['Movies', 'Shows', 'Settings', 'Debug'];

function ResponsiveAppBar() {
  const { backendUrl, setBackendUrl, backendStatus } = useContext(BackendContext);
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
  const [urlInput, setUrlInput] = useState(backendUrl);
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setUrlInput(url);
    if (isValidUrl(url)) {
      setBackendUrl(url);
    }
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };


  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" className="appbar-gradient">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
        <ApiRoundedIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />

        <div style={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Annie
          </Typography>
          <Typography variant="subtitle2" component="div">
            a riven frontend
          </Typography>
          </div>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} component={Link} to={"/" + page} onClick={handleCloseNavMenu} >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <ApiRoundedIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Annie
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                component={Link} to={"/" + page}
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <TextField
                label="Backend URL"
                size="small"
                placeholder="http://localhost:8000"
                value={urlInput}
                onChange={handleUrlChange}
                error={backendStatus ? false : true}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <CheckBoxRoundedIcon color={backendStatus ? "success" : "error"} />
                        </InputAdornment>
                    ),
                }}
            />
          </Box>
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {isDarkTheme ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;