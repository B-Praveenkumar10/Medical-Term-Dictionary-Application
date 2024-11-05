import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Box,
  Tooltip,
  Paper,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

function MedicalDictionary() {
  const [term, setTerm] = useState("");
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [relatedTerms, setRelatedTerms] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiKey = "d16c48a4-51f0-418c-9d47-61c3cd79acdf"; // Replace with your Merriam-Webster API key

  useEffect(() => {
    const fetchAutocompleteSuggestions = async () => {
      if (term.length < 3) {
        setAutocompleteSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(
          `https://www.dictionaryapi.com/api/v3/references/medical/json/${term}?key=${apiKey}&limit=5`
        );
        const data = response.data;
        const suggestions = data.filter((item) => typeof item === "string").slice(0, 5);
        setAutocompleteSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
      }
    };

    fetchAutocompleteSuggestions();
  }, [term, apiKey]);

  const handleSearch = async (searchTerm = term) => {
    setDefinitions([]);
    setRelatedTerms([]);
    setError(null);
    setLoading(true);

    try {
      const response = await axios.get(
        `https://www.dictionaryapi.com/api/v3/references/medical/json/${searchTerm}?key=${apiKey}`
      );
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        if (typeof data[0] === "object" && data[0].shortdef) {
          setDefinitions(data[0].shortdef);
        } else {
          setRelatedTerms(data);
        }
      } else {
        setError("No definition found.");
      }
    } catch (error) {
      setError("Error fetching data. Please try again.");
    }
    setLoading(false);
  };

  const handleRelatedTermClick = (relatedTerm) => {
    setTerm(relatedTerm);
    handleSearch(relatedTerm);
  };

  const handleAutocompleteSelect = (suggestion) => {
    setTerm(suggestion);
    handleSearch(suggestion);
    setAutocompleteSuggestions([]); // Clear suggestions on selection
  };

  const handleInputChange = (e) => {
    const newTerm = e.target.value;
    setTerm(newTerm);
  };

  const addToFavorites = (term) => {
    if (!favorites.includes(term)) {
      setFavorites([...favorites, term]);
    } else {
      removeFromFavorites(term);
    }
  };

  const removeFromFavorites = (term) => {
    setFavorites(favorites.filter((fav) => fav !== term));
  };

  return (
    <Container maxWidth="lg" style={{ padding: "40px 0" }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8} style={{ paddingRight: "20px", position: "relative" }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            Medical Term Dictionary
          </Typography>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <TextField
                variant="outlined"
                label="Enter a medical term"
                value={term}
                onChange={handleInputChange}
                fullWidth
                autoFocus
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Search">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<SearchIcon />}
                        style={{ minWidth: "50px" }}
                        disabled={loading || term === ""}
                      />
                    </Tooltip>
                  ),
                }}
              />
            </form>

            {autocompleteSuggestions.length > 0 && (
              <Paper
                elevation={3}
                style={{
                  position: "absolute",
                  top: "145px",
                  left: 40,
                  right: 0,
                  zIndex: 10,
                  maxHeight: "150px",
                  overflowY: "auto",
                  width: "90%",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <List dense>
                  {autocompleteSuggestions.map((suggestion, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => handleAutocompleteSelect(suggestion)}
                      style={{ padding: "8px" }}
                    >
                      <ListItemText primary={suggestion} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}
          </div>

          {loading && <CircularProgress style={{ marginTop: "20px" }} />}

          {error && (
            <Typography color="error" variant="body1" style={{ marginTop: "20px" }}>
              {error}
            </Typography>
          )}

          {definitions.length > 0 && (
            <Card style={{ marginTop: "20px", position: "relative" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Definitions for "{term}":
                </Typography>
                <Box component="ul" style={{ textAlign: "left", paddingLeft: "20px" }}>
                  {definitions.map((definition, index) => (
                    <li key={index} style={{ marginBottom: "10px" }}>
                      <Typography variant="body1">{definition}</Typography>
                    </li>
                  ))}
                </Box>

                <IconButton
                  onClick={() => addToFavorites(term)}
                  color="error"
                  style={{ position: "absolute", top: 10, right: 10 }}
                >
                  {favorites.includes(term) ? (
                    <FavoriteIcon style={{ color: "red" }} />
                  ) : (
                    <FavoriteBorderIcon style={{ color: "black" }} />
                  )}
                </IconButton>
              </CardContent>
            </Card>
          )}

          {relatedTerms.length > 0 && (
            <Card style={{ marginTop: "20px" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Related terms for "{term}":
                </Typography>
                <Box
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    justifyContent: "center",
                    marginTop: "10px",
                  }}
                >
                  {relatedTerms.map((relatedTerm, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleRelatedTermClick(relatedTerm)}
                    >
                      {relatedTerm}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Divider orientation="vertical" flexItem style={{ backgroundColor: "#ccc", margin: "20px 0" }} />

        <Grid item xs={12} md={3} style={{ paddingLeft: "20px" }}>
          <Typography variant="h5" gutterBottom>
            Favorites
          </Typography>
          {favorites.length > 0 ? (
            favorites.map((favorite, index) => (
              <Paper key={index} elevation={2} style={{ padding: "10px", marginBottom: "10px" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">{favorite}</Typography>
                  <IconButton onClick={() => removeFromFavorites(favorite)} color="error">
                    <FavoriteIcon style={{ color: "red" }} />
                  </IconButton>
                </Box>
              </Paper>
            ))
          ) : (
            <Typography color="textSecondary">No favorites added yet.</Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default MedicalDictionary;
