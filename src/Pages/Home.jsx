import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

const Home = () => {

  const featuredMovies = [
    { id: 1, title: 'DUNE: PART TWO', genre: 'Sci-Fi/Adventure', rating: 4.8, image: 'https://beam-images.warnermediacdn.com/2024-05/scrid-1926466218111380_wb_duneparttwo_3000x3000_2024_lan-en-us_pur-tileburnedin.jpg?host=wbd-dotcom-drupal-prd-us-east-1.s3.amazonaws.com' },
    { id: 2, title: 'OPPENHEIMER', genre: 'Biography/Drama', rating: 4.7, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8FFJNBaIXvhEwqXXw40rYYDci8jPlYxWfy9082flliYoZ-SqqZjy0az-G5rIWuSJp2pn7xQ&s=10' },
    { id: 3, title: 'SPIDER-MAN: NO WAY HOME', genre: 'Action/Adventure', rating: 4.9, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoBbV1cm1zPYG83x9vhcuLqS7zoD8Al52Bu-lGNIBk_q2r2yD3sOxV_oZwerMbBwZXVfse8Q&s=10' },
    { id: 4, title: 'THE BATMAN', genre: 'Action/Crime', rating: 4.5, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIMCpS3OjmxGAhuR99vetHATrUSMK2Cih6TB10Dnk9op5yB-y4DEVQsw9h3814Z8MirrCe&s=10' },
  ];

  const nowShowing = [
    { id: 5, title: 'AVATAR: THE WAY OF WATER', genre: 'Sci-Fi', rating: 4.6, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxTA7S2fDMhUDVcZnuxuie2xE_ayntCdkCKme3EK3ObKXFuhdaLhYYTpzUHZ45-IQzQt6T&s=10' },
    { id: 6, title: 'TOP GUN: MAVERICK', genre: 'Action/Drama', rating: 4.8, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEWEKrGjS-mQ_YGDUvlPjZQoLhZ084Cf-o2nBU7BkvZVUjJf8poO5BL0510QhJhhUxF9qK&s=10' },
    { id: 7, title: 'BLACK PANTHER: WAKANDA FOREVER', genre: 'Action', rating: 4.4, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlYz674WFWJZT1uPziFxijT7SvQ9Ir4TnIUNB524gyCCagwWlkkCX6pJdpI-LJzDaoCqiu&s=10' },
    { id: 8, title: 'JOHN WICK: CHAPTER 4', genre: 'Action/Thriller', rating: 4.7, image: 'https://m.media-amazon.com/images/S/pv-target-images/6d3d1461d50778271845ce7ec81ba2c5d76a20f7f84e5061cd099aabaedc77f9.jpg' },
  ];

  const cinemas = [
    { id: 1, name: 'PVR Cinemas', location: 'Ahmedabad', shows: 12 },
    { id: 2, name: 'INOX', location: 'Vadodara', shows: 8 },
    { id: 3, name: 'Cinepolis', location: 'Surat', shows: 10 },
    { id: 4, name: 'City Gold', location: 'Rajkot', shows: 6 },
  ];

  const news = [
    { id: 1, title: 'Oscar Nominations 2024 Announced', date: 'Jan 23, 2024', excerpt: 'Check out the full list of nominees for the 96th Academy Awards.' },
    { id: 2, title: 'New IMAX Theater Opening in Gujarat', date: 'Jan 20, 2024', excerpt: 'State-of-the-art IMAX theater coming to Ahmedabad next month.' },
    { id: 3, title: 'Film Festival 2024 Registration Open', date: 'Jan 18, 2024', excerpt: 'Submit your films for the annual Gujarat International Film Festival.' },
  ];

  return (
    <div className="home-page">

      <section className="hero">
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            Experience Cinema <span className="highlight">Like Never Before</span>
          </h1>
          
          <p className="hero-subtitle">
            Discover The Latest Blockbusters, Exclusive Trailers, And Book Tickets Instantly — 
            All In One Electrifying Place.
          </p>

          <div className="hero-cta-group">
            <Link to="/Movies" className="btn-primary">
              Explore Movies
            </Link>
            
        
            <Link to="/Movies" className="btn-outline">
              Watch Trailer
            </Link>
          </div>
        </div>

        <div className="hero-glow"></div>
      </section>

      <section className="section featured-movies">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured This Week</h2>
            <Link to="/Movies" className="section-link">View All →</Link>
          </div>
          
          <div className="movies-grid">
            {featuredMovies.map(movie => (
              <div className="movie-card" key={movie.id}>
                <div className="movie-poster">
                  <img src={movie.image} alt={movie.title} />
                  <div className="movie-rating">
                    <span className="rating-star">★</span> {movie.rating}
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-genre">{movie.genre}</p>
                  <Link to={`/Movies`} className="btn-book">Book Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section now-showing">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Now Showing in Theaters</h2>
            <Link to="/Movies" className="section-link">All Showtimes →</Link>
          </div>
          
          <div className="movies-grid">
            {nowShowing.map(movie => (
              <div className="movie-card" key={movie.id}>
                <div className="movie-poster">
                  <img src={movie.image} alt={movie.title} />
                  <div className="movie-rating">
                    <span className="rating-star">★</span> {movie.rating}
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-genre">{movie.genre}</p>
                  <div className="showtime-buttons">
                    <Link to="/Movies" className="btn-time">2:30 PM</Link>
                    <Link to="/Movies" className="btn-time">5:45 PM</Link>
                    <Link to="/Movies" className="btn-time">9:15 PM</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="section cinemas">
        <div className="container">
          <h2 className="section-title">Our Cinema Partners</h2>
          <div className="cinemas-grid">
            {cinemas.map(cinema => (
              <div className="cinema-card" key={cinema.id}>
                <div className="cinema-icon">🎬</div>
                <h3 className="cinema-name">{cinema.name}</h3>
                <p className="cinema-location">{cinema.location}</p>
                <div className="cinema-shows">{cinema.shows} shows today</div>
                <Link to="/Movies" className="btn-cinema">View Details</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section news">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest News & Updates</h2>
            <Link to="/Movies" className="section-link">All News →</Link>
          </div>
          
          <div className="news-grid">
            {news.map(item => (
              <div className="news-card" key={item.id}>
                <div className="news-date">{item.date}</div>
                <h3 className="news-title">{item.title}</h3>
                <p className="news-excerpt">{item.excerpt}</p>
                <Link to="/Movies" className="news-link">Read More</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="section cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready for an Unforgettable Movie Night?</h2>
            <p className="cta-subtitle">Book tickets in advance and get 20% off on snacks!</p>
            <div className="cta-buttons">
              <Link to="/Movies" className="btn-primary">Book Tickets Now</Link>
              <Link to="/Movies" className="btn-outline">Join Membership</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;