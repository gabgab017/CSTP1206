const apiKey = '30d6e6181e02f426df1cb8910eeddf36';
const trendingApiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`;

// get a reference to the search form, search input, and movie container
const searchForm = document.getElementById('search-container');
const searchInput = document.getElementById('search-input');
const movieContainer = document.getElementById('movies-container');

// create a template for the movie tile
const movieTileTemplate = ({ title, release_date: releaseDate, overview: description, genre_ids: genreIds, poster_path: posterPath }) => {
  const imageUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
  const genres = genreIds.join(', ');

  return `
    <div class="movie-tile">
      <img src="${imageUrl}" alt="${title}">
      <h3>${title}</h3>
      <p>Released: ${releaseDate.substring(0, 4)}</p>
      <p>Genres: ${genres}</p>
      <p>${description}</p>
    </div>
  `;
};


const fetchMovies = (url) => {
  console.log('Fetching movies from URL:', url);
  Promise.all([
    fetch(url),
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`)
  ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
      const movies = data[0].results;
      const genres = data[1].genres.reduce((map, genre) => {
        map[genre.id] = genre.name;
        return map;
      }, {});

      // clear the previous movie tiles
      movieContainer.innerHTML = '';

      movies.forEach(movie => {
        // create a new movie tile and fill in the data
        const movieTile = document.createElement('div');
        movieTile.classList.add('movie-tile');

        const genreNames = movie.genre_ids.map(id => genres[id]);

        movieTile.innerHTML = movieTileTemplate({
          title: movie.title,
          release_date: movie.release_date,
          overview: movie.overview,
          poster_path: movie.poster_path,
          genre_ids: genreNames
        });

        // add the movie tile to the container
        movieContainer.appendChild(movieTile);
      });
    })
    .catch(error => {
      console.error('Error fetching movies:', error);
    });
};

// fetch the initial list of movies (trending movies of the week)
fetchMovies(trendingApiUrl);

// listen for search form submissions
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const searchQuery = searchInput.value.trim();

  if (searchQuery.length >= 3) {
    const searchApiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${searchQuery}`;
    fetchMovies(searchApiUrl);
  }
});
