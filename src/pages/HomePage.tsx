import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Popcorn, Star, Clock } from 'lucide-react';
import { movies } from '../data/mockData';

const HomePage: React.FC = () => {
  // Get featured movies (first 3)
  const featuredMovies = movies.slice(0, 3);
  
  // Get now playing movies (first 6)
  const nowPlayingMovies = movies.slice(0, 6);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[70vh] bg-gradient-to-r from-secondary-950 to-secondary-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={featuredMovies[0].bannerUrl} 
            alt={featuredMovies[0].title} 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-950 via-secondary-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 flex items-center h-full">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{featuredMovies[0].title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-accent-500 mr-1" />
                <span>{featuredMovies[0].imdbRating}/10</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-accent-500 mr-1" />
                <span>{featuredMovies[0].duration} min</span>
              </div>
              <span className="px-2 py-1 bg-secondary-800 rounded-md text-xs">{featuredMovies[0].rating}</span>
              {featuredMovies[0].genre.slice(0, 2).map((genre, index) => (
                <span key={index} className="px-2 py-1 bg-secondary-800 rounded-md text-xs">{genre}</span>
              ))}
            </div>
            <p className="text-secondary-300 mb-6 text-base md:text-lg">{featuredMovies[0].description}</p>
            <div className="flex flex-wrap gap-4">
              <Link to={`/movies/${featuredMovies[0].id}`} className="btn btn-primary">
                Get Tickets
              </Link>
              <a href={featuredMovies[0].trailerUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Watch Trailer
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Now Playing */}
      <section className="section">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Now Playing</h2>
          <Link to="/movies" className="flex items-center text-primary-500 hover:text-primary-400 transition-colors">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {nowPlayingMovies.map(movie => (
            <Link to={`/movies/${movie.id}`} key={movie.id} className="movie-card group">
              <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-semibold line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-accent-500 mr-1" />
                    <span className="text-white text-sm">{movie.imdbRating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary-950 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">Experience the Best Cinema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-700 p-4 rounded-full mb-4">
                <Popcorn className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Experience</h3>
              <p className="text-secondary-300">Enjoy movies in our state-of-the-art theatres with the latest sound and projection technology.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-700 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Easy Online Booking</h3>
              <p className="text-secondary-300">Book your tickets online, select your seats, and enjoy a hassle-free movie experience.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-700 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Latest Releases</h3>
              <p className="text-secondary-300">Watch the latest blockbusters as soon as they hit the big screen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="section">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Coming Soon</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredMovies.slice(1, 3).map(movie => (
            <div key={movie.id} className="relative rounded-lg overflow-hidden group">
              <img 
                src={movie.bannerUrl} 
                alt={movie.title} 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{movie.title}</h3>
                <p className="text-secondary-300 mb-4 line-clamp-2">{movie.description}</p>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-primary-500">Release: {new Date(movie.releaseDate).toLocaleDateString()}</span>
                  <span className="text-accent-500">{movie.duration} min</span>
                </div>
                <Link to={`/movies/${movie.id}`} className="btn btn-outline">
                  More Info
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 bg-gradient-to-r from-primary-900 to-secondary-900">
        <div className="absolute inset-0 bg-secondary-950 opacity-60"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Cinema Club</h2>
          <p className="text-secondary-200 max-w-xl mx-auto mb-8">Get exclusive discounts, early access to ticket sales, and special screening invitations.</p>
          <Link to="/register" className="btn btn-primary">
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;