import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './MovieDetails.css';
import { clearMovieReservations, getBookedSeatCount } from '../utils/seatReservations';
import {
  MOVIE_CAPACITY,
  RESET_NOTIFY_WINDOW_MS,
  clearMovieAvailability,
  getMovieAvailability,
  getMovieResetCountdown,
  markMovieSoldOut,
  patchMovieAvailability,
} from '../utils/movieAvailability';
import { getShowEndAt } from '../utils/bookingExpiry';
import { searchMovieByTitle, getMovieCredits, tmdbImage, hasApiKey } from '../utils/tmdb';
import { unslugify } from '../utils/slugify';

const REVIEW_STORAGE_KEY = 'levelbookup-movie-reviews';
const SELECTED_MOVIE_KEY = 'levelbookup-selected-movie';
const MOVIE_DETAILS_STORAGE_KEY = 'levelbookup-movie-details';
const RATING_OPTIONS = [5, 4, 3, 2, 1, 0];

const loadJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getMovieKey = (movie) => movie?.id || movie?.title || 'movie';
const parseList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

const MOVIE_PROFILE_HINTS = {
  1: { cast: ['Amy Poehler', 'Maya Hawke', 'Kensington Tallman', 'Liza Lapira', 'Tony Hale', 'Lewis Black'], showTimes: ['10:30 AM', '1:45 PM', '5:00 PM', '8:15 PM'], screens: ['Screen 1', 'Screen 2'], trailerUrl: 'https://www.youtube.com/results?search_query=Inside+Out+2+trailer', language: 'English', runtime: '1h 36m', certification: 'U' },
  2: { cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Morena Baccarin', 'Matthew Macfadyen', 'Leslie Uggams'], showTimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'], screens: ['Screen 1', 'Screen 3'], trailerUrl: 'https://www.youtube.com/results?search_query=Deadpool+and+Wolverine+trailer', language: 'English', runtime: '2h 7m', certification: 'A' },
  3: { cast: ['Cynthia Erivo', 'Ariana Grande', 'Jonathan Bailey', 'Michelle Yeoh', 'Jeff Goldblum', 'Ethan Slater'], showTimes: ['10:15 AM', '1:30 PM', '4:45 PM', '8:00 PM'], screens: ['Screen 2', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=Wicked+trailer', language: 'English', runtime: '2h 40m', certification: 'U' },
  4: { cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler', 'Florence Pugh', 'Josh Brolin'], showTimes: ['11:30 AM', '3:00 PM', '6:30 PM', '10:00 PM'], screens: ['Screen 1', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=Dune+Part+Two+trailer', language: 'English', runtime: '2h 46m', certification: 'U/A' },
  5: { cast: ['Bill Skarsgård', 'Lily-Rose Depp', 'Nicholas Hoult', 'Aaron Taylor-Johnson', 'Emma Corrin', 'Willem Dafoe'], showTimes: ['10:00 AM', '1:15 PM', '4:30 PM', '7:45 PM'], screens: ['Screen 3', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=Nosferatu+2024+trailer', language: 'English', runtime: '2h 12m', certification: 'A' },
  6: { cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil', 'Jagapathi Babu', 'Sunil', 'Rao Ramesh'], showTimes: ['10:30 AM', '2:00 PM', '5:30 PM', '9:00 PM'], screens: ['Screen 1', 'Screen 2', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=Pushpa+2+The+Rule+trailer', language: 'Telugu', runtime: '2h 40m', certification: 'A' },
  7: { cast: ['Adrien Brody', 'Felicity Jones', 'Guy Pearce', 'Joe Alwyn', 'Raffey Cassidy', 'Stacy Martin'], showTimes: ['11:00 AM', '3:15 PM', '7:30 PM'], screens: ['Screen 2', 'Screen 3'], trailerUrl: 'https://www.youtube.com/results?search_query=The+Brutalist+trailer', language: 'English', runtime: '3h 35m', certification: 'A' },
  8: { cast: ['Auliʻi Cravalho', 'Dwayne Johnson', 'Hualālai Chung', 'Rose Matafeo', 'David Fane', 'Awhimai Fraser'], showTimes: ['9:45 AM', '1:00 PM', '4:15 PM', '7:15 PM'], screens: ['Screen 1', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=Moana+2+trailer', language: 'English', runtime: '1h 40m', certification: 'U' },
  9: { cast: ['Steve Carell', 'Kristen Wiig', 'Will Ferrell', 'Joey King', 'Stephen Colbert', 'Pierre Coffin'], showTimes: ['10:00 AM', '12:45 PM', '4:00 PM', '6:45 PM'], screens: ['Screen 2', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=Despicable+Me+4+trailer', language: 'English', runtime: '1h 34m', certification: 'U' },
  10: { cast: ['Michael Keaton', 'Winona Ryder', 'Jenna Ortega', 'Catherine O\'Hara', 'Justin Theroux', 'Monica Bellucci'], showTimes: ['11:15 AM', '2:45 PM', '6:15 PM', '9:15 PM'], screens: ['Screen 1', 'Screen 3'], trailerUrl: 'https://www.youtube.com/results?search_query=Beetlejuice+Beetlejuice+trailer', language: 'English', runtime: '1h 44m', certification: 'U/A' },
  11: { cast: ['Vicky Kaushal', 'Rashmika Mandanna', 'Akshaye Khanna', 'Diana Penty', 'Ashutosh Rana', 'Divya Dutta'], showTimes: ['10:45 AM', '2:15 PM', '5:45 PM', '9:15 PM'], screens: ['Screen 1', 'Screen 2', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=Chhaava+trailer', language: 'Hindi', runtime: '2h 41m', certification: 'U/A' },
  12: { cast: ['Akshay Kumar', 'Veer Pahariya', 'Nimrat Kaur', 'Sara Ali Khan', 'Sharad Kelkar', 'Mohan Agashe'], showTimes: ['10:00 AM', '1:15 PM', '4:30 PM', '8:00 PM'], screens: ['Screen 1', 'Screen 3'], trailerUrl: 'https://www.youtube.com/results?search_query=Sky+Force+trailer', language: 'Hindi', runtime: '2h 05m', certification: 'U/A' },
  13: { cast: ['Akshay Kumar', 'Riteish Deshmukh', 'Abhishek Bachchan', 'Jacqueline Fernandez', 'Nargis Fakhri', 'Pooja Hegde'], showTimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'], screens: ['Screen 2', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=Housefull+5+trailer', language: 'Hindi', runtime: '2h 35m', certification: 'U/A' },
  14: { cast: ['Robert Pattinson', 'Naomi Ackie', 'Steven Yeun', 'Toni Collette', 'Mark Ruffalo', 'Michael Monroe'], showTimes: ['10:30 AM', '2:00 PM', '5:30 PM', '9:00 PM'], screens: ['Screen 3', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=Mickey+17+trailer', language: 'English', runtime: '2h 17m', certification: 'U/A' },
  15: { cast: ['David Corenswet', 'Rachel Brosnahan', 'Nicholas Hoult', 'Isabela Merced', 'Nathan Fillion', 'Edi Gathegi'], showTimes: ['10:15 AM', '1:45 PM', '5:15 PM', '8:45 PM'], screens: ['Screen 1', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=Superman+2025+trailer', language: 'English', runtime: '2h 10m', certification: 'U/A' },
  16: { cast: ['Pedro Pascal', 'Vanessa Kirby', 'Joseph Quinn', 'Ebon Moss-Bachrach', 'Julia Garner', 'Paul Walter Hauser'], showTimes: ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'], screens: ['Screen 2', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=Fantastic+Four+First+Steps+trailer', language: 'English', runtime: '2h 5m', certification: 'U' },
  21: { cast: ['Kirsten Dunst', 'Wagner Moura', 'Cailee Spaeny', 'Stephen McKinley Henderson', 'Nick Offerman', 'Jesse Plemons'], showTimes: ['10:45 AM', '2:15 PM', '6:00 PM'], screens: ['Screen 3', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=Civil+War+2024+trailer', language: 'English', runtime: '1h 49m', certification: 'A' },
  24: { cast: ['Hrithik Roshan', 'Jr NTR', 'Kiara Advani', 'Ashutosh Rana', 'Anil Kapoor', 'Sanjay Dutt'], showTimes: ['10:30 AM', '2:00 PM', '5:30 PM', '9:00 PM'], screens: ['Screen 1', 'Screen 2', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=War+2+trailer', language: 'Hindi', runtime: '2h 45m', certification: 'U/A' },
  27: { cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver', 'Stephen Lang', 'Kate Winslet', 'Cliff Curtis'], showTimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'], screens: ['Screen 1', 'Screen 3', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=Avatar+Fire+and+Ash+trailer', language: 'English', runtime: '2h 50m', certification: 'U' },
  28: { cast: ['Glen Powell', 'Josh Brolin', 'Katy O\'Brian', 'Colman Domingo', 'Lee Pace', 'Michael Cera'], showTimes: ['10:15 AM', '1:45 PM', '5:15 PM', '8:45 PM'], screens: ['Screen 2', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=The+Running+Man+2025+trailer', language: 'English', runtime: '2h 15m', certification: 'U/A' },
  29: { cast: ['Dakota Johnson', 'Pedro Pascal', 'Chris Evans', 'Zoë Winters', 'Marin Ireland', 'Louisa Jacobson'], showTimes: ['11:15 AM', '2:45 PM', '6:15 PM'], screens: ['Screen 1', 'Screen 3'], trailerUrl: 'https://www.youtube.com/results?search_query=Materialists+trailer', language: 'English', runtime: '1h 57m', certification: 'U' },
  30: { cast: ['Jason Statham', 'David Harbour', 'Michael Peña', 'Arianna Rivas', 'Jason Flemyng', 'Emmett J. Scanlan'], showTimes: ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'], screens: ['Screen 2', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=A+Working+Man+trailer', language: 'English', runtime: '1h 56m', certification: 'A' },
  31: { cast: ['Rajinikanth', 'Ramya Krishnan', 'Shiva Rajkumar', 'Yogi Babu', 'Mirnaa', 'Mohanlal'], showTimes: ['10:30 AM', '2:00 PM', '5:30 PM', '9:00 PM'], screens: ['Screen 1', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=Jailer+2+trailer', language: 'Tamil', runtime: '2h 30m', certification: 'U/A' },
  32: { cast: ['Ajay Devgn', 'Tabu', 'Shriya Saran', 'Ishita Dutta', 'Rajat Kapoor', 'Mrunal Jadhav'], showTimes: ['10:15 AM', '1:45 PM', '5:15 PM', '8:45 PM'], screens: ['Screen 2', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=Drishyam+3+trailer', language: 'Hindi', runtime: '2h 35m', certification: 'U/A' },
  35: { cast: ['Lupita Nyong\'o', 'Pedro Pascal', 'Kit Connor', 'Bill Nighy', 'Stephanie Hsu', 'Catherine O\'Hara'], showTimes: ['9:45 AM', '1:00 PM', '4:15 PM', '7:15 PM'], screens: ['Screen 1', 'Screen 4'], trailerUrl: 'https://www.youtube.com/results?search_query=The+Wild+Robot+trailer', language: 'English', runtime: '1h 42m', certification: 'U' },
  36: { cast: ['Mikey Madison', 'Mark Eydelshteyn', 'Yura Borisov', 'Karren Karagulian', 'Vache Tovmasyan', 'Darya Ekamasova'], showTimes: ['10:30 AM', '2:00 PM', '5:30 PM', '9:00 PM'], screens: ['Screen 2', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=Anora+trailer', language: 'English', runtime: '2h 19m', certification: 'A' },
  38: { cast: ['Demi Moore', 'Margaret Qualley', 'Dennis Quaid', 'Hugo Diego Garcia', 'Edward Hamilton-Clark', 'Gore Abrams'], showTimes: ['11:15 AM', '2:45 PM', '6:15 PM'], screens: ['Screen 3', 'Screen 5'], trailerUrl: 'https://www.youtube.com/results?search_query=The+Substance+trailer', language: 'English', runtime: '2h 21m', certification: 'A' },
  40: { cast: ['Florence Pugh', 'Andrew Garfield', 'Grace Delaney', 'Aoife Hinds', 'Marama Corlett', 'Adam James'], showTimes: ['10:15 AM', '1:45 PM', '5:15 PM', '8:45 PM'], screens: ['Screen 1', 'Screen 3'], trailerUrl: 'https://www.youtube.com/results?search_query=We+Live+in+Time+trailer', language: 'English', runtime: '1h 48m', certification: 'U/A' },
};

const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '').trim();

const getBaseMovieDetails = (movie) => {
  // If the incoming movie object already contains cast/credits, prefer that
  try {
    const incomingCast = movie?.credits?.cast || movie?.cast || movie?.actors || null;
    if (Array.isArray(incomingCast) && incomingCast.length > 0) {
      const castNames = incomingCast.map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean).slice(0, 6);
      const castPhotos = incomingCast.map((c) => (typeof c === 'string' ? '' : (c.profile_path ? tmdbImage(c.profile_path, 'w185') : c.profileImage || ''))).slice(0, 6);
      return {
        cast: castNames,
        castPhotos,
        showTimes: movie?.showTimes || [],
        screens: movie?.screens || [],
        trailerUrl: movie?.trailerUrl || '',
        language: movie?.language || '',
        runtime: movie?.runtime || '',
        certification: movie?.certification || '',
        synopsis: movie?.description || movie?.overview || '',
      };
    }
  } catch (e) {
    // ignore and continue to other fallbacks
  }
  // Attempt by numeric id first (handle string IDs like '1')
  const idKey = Number(movie?.id);
  const byId = !Number.isNaN(idKey) && MOVIE_PROFILE_HINTS[idKey]
    ? MOVIE_PROFILE_HINTS[idKey]
    : MOVIE_PROFILE_HINTS[String(movie?.id)];
  if (byId) return {
    cast: byId.cast || [],
    castPhotos: byId.castPhotos || [],
    showTimes: byId.showTimes || [],
    screens: byId.screens || [],
    trailerUrl: byId.trailerUrl || '',
    language: byId.language || '',
    runtime: byId.runtime || '',
    certification: byId.certification || '',
    synopsis: movie?.description || '',
  };

  // Try matching by normalized title on hints
  const titleKey = normalize(movie?.title);
  const found = Object.values(MOVIE_PROFILE_HINTS).find((p) => normalize(p.title) === titleKey || normalize(p.name) === titleKey);
  if (found) return {
    cast: found.cast || [],
    castPhotos: found.castPhotos || [],
    showTimes: found.showTimes || [],
    screens: found.screens || [],
    trailerUrl: found.trailerUrl || '',
    language: found.language || '',
    runtime: found.runtime || '',
    certification: found.certification || '',
    synopsis: movie?.description || '',
  };

  // Final fallback: sensible defaults so the page is never empty
  const defaultShowTimes = ['10:00 AM', '1:00 PM', '6:00 PM', '9:00 PM'];
  const defaultScreens = ['Screen 1', 'Screen 2'];
  const trailerQuery = encodeURIComponent(String(movie?.title || '').trim());

  const generateCastFromTitle = (t) => {
    // Avoid generating repeated placeholder actor names from the title.
    // If we don't have real cast data, prefer returning an empty array
    // so the UI shows the "No cast added yet" hint.
    return [];
  };

  return {
    cast: generateCastFromTitle(movie?.title),
    castPhotos: [],
    showTimes: defaultShowTimes,
    screens: defaultScreens,
    trailerUrl: movie?.title ? `https://www.youtube.com/results?search_query=${trailerQuery}+trailer` : '',
    language: 'English',
    runtime: '—',
    certification: '—',
    synopsis: movie?.description || '',
  };
};

const MovieDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movieSlug } = useParams();

  const storedMovie = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SELECTED_MOVIE_KEY) || 'null');
    } catch {
      return null;
    }
  }, []);

  const slugMovie = movieSlug ? { title: unslugify(movieSlug), id: unslugify(movieSlug) } : null;
  const movie = location.state?.movie || storedMovie || slugMovie || null;
  const movieKey = useMemo(() => getMovieKey(movie), [movie]);
  const baseDetails = useMemo(() => getBaseMovieDetails(movie), [movie]);

  const [movieDetails, setMovieDetails] = useState(() => loadJson(MOVIE_DETAILS_STORAGE_KEY, {})[movieKey] || baseDetails);
  const [detailsForm, setDetailsForm] = useState(() => {
    const storedDetails = loadJson(MOVIE_DETAILS_STORAGE_KEY, {})[movieKey] || null;

    return {
      cast: (storedDetails?.cast || baseDetails.cast).join(', '),
      castPhotos: (storedDetails?.castPhotos || baseDetails.castPhotos).join(', '),
      showTimes: (storedDetails?.showTimes || baseDetails.showTimes).join(', '),
      screens: (storedDetails?.screens || baseDetails.screens).join(', '),
      trailerUrl: storedDetails?.trailerUrl || baseDetails.trailerUrl,
      language: storedDetails?.language || baseDetails.language,
      runtime: storedDetails?.runtime || baseDetails.runtime,
      certification: storedDetails?.certification || baseDetails.certification,
      synopsis: storedDetails?.synopsis || baseDetails.synopsis,
    };
  });
  const [selectedShowTime, setSelectedShowTime] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [availability, setAvailability] = useState(() => getMovieAvailability(movieKey));
  const [reviews, setReviews] = useState(() => loadJson(REVIEW_STORAGE_KEY, {})[movieKey] || []);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });
  const [notice, setNotice] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  const meta = movie ? { ...baseDetails, ...(movieDetails || {}) } : null;
  const soldOut = getBookedSeatCount(movie?.id) >= MOVIE_CAPACITY;
  const soldOutCountdown = getMovieResetCountdown(movieKey);

  useEffect(() => {
    if (!movie) navigate('/movies', { replace: true });
  }, [movie, navigate]);

  useEffect(() => {
    const storedDetails = loadJson(MOVIE_DETAILS_STORAGE_KEY, {})[movieKey] || null;

    setMovieDetails(storedDetails || baseDetails);
    setDetailsForm({
      cast: (storedDetails?.cast || baseDetails.cast).join(', '),
      castPhotos: (storedDetails?.castPhotos || baseDetails.castPhotos).join(', '),
      showTimes: (storedDetails?.showTimes || baseDetails.showTimes).join(', '),
      screens: (storedDetails?.screens || baseDetails.screens).join(', '),
      trailerUrl: storedDetails?.trailerUrl || baseDetails.trailerUrl,
      language: storedDetails?.language || baseDetails.language,
      runtime: storedDetails?.runtime || baseDetails.runtime,
      certification: storedDetails?.certification || baseDetails.certification,
      synopsis: storedDetails?.synopsis || baseDetails.synopsis,
    });
    setSelectedShowTime(storedDetails?.showTimes?.[0] || baseDetails.showTimes[0] || '');
    setSelectedScreen(storedDetails?.screens?.[0] || baseDetails.screens[0] || '');
  }, [movieKey, baseDetails]);

  useEffect(() => {
    // If cast is placeholder or missing, try to fetch real cast from TMDB and cache it.
    const fetchCastFromTmdb = async () => {
      try {
        if (!movie || !hasApiKey()) return;
        const currentStored = loadJson(MOVIE_DETAILS_STORAGE_KEY, {})[movieKey] || {};
        const existingCast = currentStored.cast || baseDetails.cast || [];
        if (existingCast.length > 0 && !(existingCast.length === 1 && existingCast[0] === 'TBD')) return;

        const found = await searchMovieByTitle(movie.title || movie.name || '');
        if (!found) return;
        const credits = await getMovieCredits(found.id);
        if (!credits || !credits.cast) return;

        const top = credits.cast.slice(0, 6);
        const castNames = top.map((c) => c.name).filter(Boolean);
        const castPhotos = top.map((c) => tmdbImage(c.profile_path, 'w185')).map((u) => u || '');

        if (castNames.length) {
          const stored = loadJson(MOVIE_DETAILS_STORAGE_KEY, {});
          stored[movieKey] = { ...(stored[movieKey] || {}), cast: castNames, castPhotos };
          saveJson(MOVIE_DETAILS_STORAGE_KEY, stored);
          setMovieDetails((prev) => ({ ...prev, cast: castNames, castPhotos }));
          setDetailsForm((prev) => ({ ...prev, cast: castNames.join(', '), castPhotos: castPhotos.join(', ') }));
          setNotice('Fetched cast from TMDB. Saved locally.');
        }
      } catch (e) {
        // silent
      }
    };

    fetchCastFromTmdb();

    const syncAvailability = () => {
      if (!movie) return;

      const booked = getBookedSeatCount(movie.id);
      const currentAvailability = getMovieAvailability(movieKey);

      if (booked >= MOVIE_CAPACITY) {
        const next = currentAvailability?.status === 'sold-out' ? currentAvailability : markMovieSoldOut(movieKey);
        setAvailability(next);
        if (notifyEnabled && !next.notified) {
          setNotice('Tickets sold out. We will notify you when seats reopen.');
          patchMovieAvailability(movieKey, (current) => (current ? { ...current, notified: true } : current));
        }
        return;
      }

      if (currentAvailability?.status === 'sold-out' && currentAvailability.resetAt <= Date.now()) {
        clearMovieAvailability(movieKey);
        clearMovieReservations(movie.id);
        setAvailability(null);
        setNotice('Seats refreshed. Booking is open again.');
        return;
      }

      setAvailability(currentAvailability);
    };

    syncAvailability();
    const intervalId = window.setInterval(syncAvailability, 3000);
    const onStorage = (event) => {
      if (!event.key || event.key === MOVIE_DETAILS_STORAGE_KEY || event.key === REVIEW_STORAGE_KEY || event.key === 'levelbookup-movie-availability') {
        syncAvailability();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', onStorage);
    };
  }, [movie, movieKey, notifyEnabled]);

  useEffect(() => {
    setReviews(loadJson(REVIEW_STORAGE_KEY, {})[movieKey] || []);
    const onStorage = (event) => {
      if (event.key === REVIEW_STORAGE_KEY) setReviews(loadJson(REVIEW_STORAGE_KEY, {})[movieKey] || []);
      if (event.key === MOVIE_DETAILS_STORAGE_KEY) setMovieDetails(loadJson(MOVIE_DETAILS_STORAGE_KEY, {})[movieKey] || baseDetails);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [movieKey, baseDetails]);

  const fetchCastForMovie = async () => {
    if (!movie) return;
    if (!hasApiKey()) {
      setNotice('TMDB API key not configured. Set VITE_TMDB_API_KEY to enable fetch.');
      return;
    }

    setNotice(`Fetching cast for ${movie.title}...`);
    try {
      const found = await searchMovieByTitle(movie.title || movie.name || '');
      if (!found) {
        setNotice('No match found on TMDB.');
        return;
      }

      const credits = await getMovieCredits(found.id);
      const top = (credits?.cast || []).slice(0, 6);
      const castNames = top.map((c) => c.name).filter(Boolean);
      const castPhotos = top.map((c) => tmdbImage(c.profile_path, 'w185') || '').map((u) => u || '');

      const stored = loadJson(MOVIE_DETAILS_STORAGE_KEY, {});
      const key = movie?.id || movie?.title;
      stored[key] = { ...(stored[key] || {}), cast: castNames, castPhotos };
      saveJson(MOVIE_DETAILS_STORAGE_KEY, stored);
      setMovieDetails((prev) => ({ ...prev, cast: castNames, castPhotos }));
      setDetailsForm((prev) => ({ ...prev, cast: castNames.join(', '), castPhotos: castPhotos.join(', ') }));
      setNotice('Fetched cast and saved locally.');
    } catch (e) {
      setNotice('Failed to fetch cast from TMDB.');
    }
  };

  useEffect(() => {
    if (availability?.status === 'sold-out' && notifyEnabled && soldOutCountdown <= RESET_NOTIFY_WINDOW_MS && !availability.notified) {
      setNotice('Almost back! Booking will reopen shortly.');
      patchMovieAvailability(movieKey, (current) => (current ? { ...current, notified: true } : current));
    }
  }, [availability, movieKey, notifyEnabled, soldOutCountdown]);

  const handleDetailsSave = (event) => {
    event.preventDefault();

    const nextDetails = {
      cast: parseList(detailsForm.cast),
      castPhotos: parseList(detailsForm.castPhotos),
      showTimes: parseList(detailsForm.showTimes),
      screens: parseList(detailsForm.screens),
      trailerUrl: detailsForm.trailerUrl.trim(),
      language: detailsForm.language.trim(),
      runtime: detailsForm.runtime.trim(),
      certification: detailsForm.certification.trim(),
      synopsis: detailsForm.synopsis.trim(),
    };

    const stored = loadJson(MOVIE_DETAILS_STORAGE_KEY, {});
    stored[movieKey] = nextDetails;
    saveJson(MOVIE_DETAILS_STORAGE_KEY, stored);
    setMovieDetails({ ...baseDetails, ...nextDetails });
    setSelectedShowTime(nextDetails.showTimes[0] || '');
    setSelectedScreen(nextDetails.screens[0] || '');
    setNotice('Movie details saved locally.');
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();

    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      setNotice('Add your name and review first.');
      return;
    }

    const nextReview = { id: Date.now(), name: reviewForm.name.trim(), rating: Number(reviewForm.rating), text: reviewForm.text.trim() };
    const stored = loadJson(REVIEW_STORAGE_KEY, {});
    const currentReviews = stored[movieKey] || [];
    stored[movieKey] = [nextReview, ...currentReviews].slice(0, 12);
    saveJson(REVIEW_STORAGE_KEY, stored);
    setReviews(stored[movieKey]);
    setReviewForm({ name: '', rating: 5, text: '' });
    setNotice('Review saved.');
  };

  const handleBookNow = () => {
    if (!movie || soldOut) return;
    const showEndAt = getShowEndAt({ showTime: selectedShowTime, runtime: meta?.runtime });

    navigate('/seat-selection', {
      state: {
        movie: { ...movie, showTime: selectedShowTime, screen: selectedScreen, runtime: meta?.runtime },
        showTime: selectedShowTime,
        screen: selectedScreen,
        showEndAt,
      },
    });
  };

  const handleTrailer = () => {
    if (!meta?.trailerUrl) {
      setNotice('Trailer link is not set yet.');
      return;
    }
    window.open(meta.trailerUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePermission = () => {
    setNotifyEnabled(true);
    setNotice('You will get a reset alert for this movie.');
  };

  const averageRating = reviews.length ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1) : '0.0';
  const ratingGroups = RATING_OPTIONS.map((rating) => ({ rating, count: reviews.filter((item) => Number(item.rating) === rating).length }));

  if (!movie || !meta) return null;

  return (
    <div className="movie-details-page">
      <section className="details-hero">
        <div className="details-hero-inner">
          <div className="details-poster-wrap">
            <img className="details-poster" src={movie.img} alt={movie.title} />
            <div className={`details-status ${soldOut ? 'sold-out' : 'open'}`}>{soldOut ? 'Sold Out' : 'Booking Open'}</div>
          </div>

          <div className="details-copy">
            <p className="details-kicker">Movie Details</p>
            <h1>{movie.title}</h1>
            <p className="details-synopsis">{meta.synopsis}</p>

            <div className="details-meta-grid">
              <div><span>Language</span><strong>{meta.language || '—'}</strong></div>
              <div><span>Runtime</span><strong>{meta.runtime || '—'}</strong></div>
              <div><span>Rating</span><strong>{averageRating} / 5</strong></div>
              <div><span>Certification</span><strong>{meta.certification || '—'}</strong></div>
            </div>

            <div className="details-section">
              <h3>Cast</h3>
              <div className="chip-row cast-avatar-list">
                {meta.cast.length > 0 ? meta.cast.map((member, index) => {
                  const photo = meta.castPhotos?.[index];
                  return (
                    <span key={`${member}-${index}`} className="cast-avatar">
                      {photo ? <img src={photo} alt={member} className="cast-photo" /> : <span className="avatar-dot" />}
                      {member}
                    </span>
                  );
                  }) : (
                    <span className="detail-empty">
                      No cast added yet.
                      {hasApiKey() ? (
                        <>
                          {' '}
                          <button type="button" className="btn-outline" onClick={fetchCastForMovie}>Fetch cast</button>
                        </>
                      ) : (
                        ' Save cast names below.'
                      )}
                    </span>
                  )}
              </div>
            </div>

            <div className="details-section">
              <h3>Show Times</h3>
              <div className="chip-row">
                {meta.showTimes.length > 0 ? meta.showTimes.map((time) => (
                  <button key={time} type="button" className={selectedShowTime === time ? 'detail-chip selected' : 'detail-chip'} onClick={() => setSelectedShowTime(time)}>{time}</button>
                )) : <span className="detail-empty">No show times added yet.</span>}
              </div>
            </div>

            <div className="details-section">
              <h3>Screen</h3>
              <div className="chip-row">
                {meta.screens.length > 0 ? meta.screens.map((screen) => (
                  <button key={screen} type="button" className={selectedScreen === screen ? 'detail-chip selected' : 'detail-chip'} onClick={() => setSelectedScreen(screen)}>{screen}</button>
                )) : <span className="detail-empty">No screens added yet.</span>}
              </div>
            </div>

            <div className="details-actions">
              <button className="btn-primary" onClick={handleBookNow} disabled={soldOut}>{soldOut ? 'Sold Out' : 'Book Now'}</button>
              <button className="btn-outline" onClick={handleTrailer}>Watch Trailer</button>
              {soldOut ? <button className="btn-outline" onClick={handlePermission}>Enable reset alert</button> : null}
            </div>

            {soldOut ? <div className="sold-out-banner"><strong>Tickets sold out.</strong><span>Reset in {Math.max(1, Math.ceil(soldOutCountdown / 1000))} seconds.</span></div> : null}
            {notice ? <div className="details-notice">{notice}</div> : null}
          </div>
        </div>
      </section>

      <section className="details-section-panel">
        <div className="details-panel-card">
          <form className="movie-details-editor" onSubmit={handleDetailsSave}>
            <div className="panel-header">
              <div>
                <p className="details-kicker">Your Details</p>
                <h2>Add real movie data</h2>
              </div>
              <button type="submit" className="btn-primary">Save Details</button>
            </div>

            <div className="editor-grid">
              <label><span>Cast names</span><textarea rows="3" placeholder="Enter cast names separated by commas" value={detailsForm.cast} onChange={(event) => setDetailsForm((prev) => ({ ...prev, cast: event.target.value }))} /></label>
              <label><span>Cast photo URLs</span><textarea rows="3" placeholder="Enter cast photo URLs separated by commas" value={detailsForm.castPhotos} onChange={(event) => setDetailsForm((prev) => ({ ...prev, castPhotos: event.target.value }))} /></label>
              <label><span>Show times</span><textarea rows="3" placeholder="Enter show times separated by commas" value={detailsForm.showTimes} onChange={(event) => setDetailsForm((prev) => ({ ...prev, showTimes: event.target.value }))} /></label>
              <label><span>Screens</span><textarea rows="3" placeholder="Enter screen names separated by commas" value={detailsForm.screens} onChange={(event) => setDetailsForm((prev) => ({ ...prev, screens: event.target.value }))} /></label>
              <label><span>Trailer URL</span><input type="url" placeholder="Paste trailer link" value={detailsForm.trailerUrl} onChange={(event) => setDetailsForm((prev) => ({ ...prev, trailerUrl: event.target.value }))} /></label>
              <label><span>Language</span><input type="text" placeholder="Movie language" value={detailsForm.language} onChange={(event) => setDetailsForm((prev) => ({ ...prev, language: event.target.value }))} /></label>
              <label><span>Runtime</span><input type="text" placeholder="For example 2h 30m" value={detailsForm.runtime} onChange={(event) => setDetailsForm((prev) => ({ ...prev, runtime: event.target.value }))} /></label>
              <label><span>Certification</span><input type="text" placeholder="U, U/A, A" value={detailsForm.certification} onChange={(event) => setDetailsForm((prev) => ({ ...prev, certification: event.target.value }))} /></label>
              <label className="editor-full"><span>Synopsis</span><textarea rows="4" placeholder="Write the movie description" value={detailsForm.synopsis} onChange={(event) => setDetailsForm((prev) => ({ ...prev, synopsis: event.target.value }))} /></label>
            </div>
          </form>

          <div className="panel-header">
            <div>
              <p className="details-kicker">Reviews</p>
              <h2>Audience ratings and notes</h2>
            </div>
            <div className="panel-score"><strong>{averageRating}</strong><span>{reviews.length} review{reviews.length === 1 ? '' : 's'}</span></div>
          </div>

          <div className="rating-bars">
            {ratingGroups.map((group) => (
              <div key={group.rating} className="rating-line">
                <span>{group.rating}</span>
                <div className="rating-track"><div className="rating-fill" style={{ width: `${reviews.length ? Math.max(8, (group.count / reviews.length) * 100) : 8}%` }} /></div>
                <strong>{group.count}</strong>
              </div>
            ))}
          </div>

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <div className="review-grid">
              <input type="text" placeholder="Your name" value={reviewForm.name} onChange={(event) => setReviewForm((prev) => ({ ...prev, name: event.target.value }))} />
              <div className="rating-picker" role="group" aria-label="Review rating">
                {RATING_OPTIONS.map((value) => <button key={value} type="button" className={Number(reviewForm.rating) === value ? 'rating-chip selected' : 'rating-chip'} onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}>{value} {value === 1 ? 'Star' : 'Stars'}</button>)}
              </div>
            </div>
            <textarea rows="4" placeholder="Write your review or feedback" value={reviewForm.text} onChange={(event) => setReviewForm((prev) => ({ ...prev, text: event.target.value }))} />
            <button type="submit" className="btn-primary review-submit">Save Review</button>
          </form>

          <div className="review-list">
            {reviews.length > 0 ? reviews.map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-head"><strong>{review.name}</strong><span>{'★'.repeat(Number(review.rating))}{Number(review.rating) === 0 ? '0' : ''}</span></div>
                <p>{review.text}</p>
              </article>
            )) : <p className="empty-state">No reviews yet. Add the first review for this movie.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MovieDetails;