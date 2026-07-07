import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'LevelBookUp Cinema';
const SITE_URL = 'https://levelbookupcinema.netlify.app';
const DEFAULT_IMAGE = new URL('../assets/logo.png', import.meta.url).href;

const PAGE_META = {
  '/': {
    title: 'LevelBookUp Cinema | Movie Booking in India',
    description: 'Book movies, explore showtimes, and discover cinema experiences on LevelBookUp Cinema. A practice demo with home, movie, profile, and booking flows.',
    index: true,
  },
  '/movies': {
    title: 'Now Showing Movies | LevelBookUp Cinema',
    description: 'Browse now-showing and featured movies, then move into seat selection from one clean booking flow.',
    index: true,
  },
  '/about': {
    title: 'About LevelBookUp Cinema',
    description: 'Learn about the LevelBookUp Cinema demo project, its booking flow, and the practice features built into the site.',
    index: true,
  },
  '/services': {
    title: 'Cinema Services & Features | LevelBookUp Cinema',
    description: 'See what the cinema booking experience includes: movie discovery, seat selection, ticket generation, and account support.',
    index: true,
  },
  '/contact': {
    title: 'Contact LevelBookUp Cinema',
    description: 'Get in touch with LevelBookUp Cinema for support, demo feedback, or practice project questions.',
    index: true,
  },
  '/movie-details': {
    title: 'Movie Details | LevelBookUp Cinema',
    description: 'View movie cast, showtimes, reviews, and booking details for the selected title.',
    index: false,
  },
  '/seat-selection': {
    title: 'Select Seats | LevelBookUp Cinema',
    description: 'Choose your seats before confirming your movie booking.',
    index: false,
  },
  '/payment': {
    title: 'Secure Payment | LevelBookUp Cinema',
    description: 'Finalize your cinema booking with the payment step.',
    index: false,
  },
  '/ticket': {
    title: 'Your Ticket | LevelBookUp Cinema',
    description: 'View the generated ticket after booking confirmation.',
    index: false,
  },
  '/signup': {
    title: 'Sign Up | LevelBookUp Cinema',
    description: 'Create an account to save bookings and profile details.',
    index: false,
  },
  '/login': {
    title: 'Login | LevelBookUp Cinema',
    description: 'Sign in to access your bookings and profile.',
    index: false,
  },
  '/forgetpass': {
    title: 'Reset Password | LevelBookUp Cinema',
    description: 'Reset your LevelBookUp Cinema account password.',
    index: false,
  },
  '/profile': {
    title: 'My Profile | LevelBookUp Cinema',
    description: 'Manage your profile, saved information, and account details.',
    index: false,
  },
};

const PUBLIC_PATHS = new Set(['/', '/movies', '/about', '/services', '/contact']);

const resolvePageMeta = (pathname) => {
  if (pathname.startsWith('/movie-details/')) {
    return PAGE_META['/movie-details'];
  }

  return PAGE_META[pathname] || PAGE_META['/'];
};

const upsertMetaTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const Seo = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.toLowerCase();
    const pageMeta = resolvePageMeta(pathname);
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
    const shouldIndex = Boolean(pageMeta.index && PUBLIC_PATHS.has(pathname));

    document.title = pageMeta.title;
    document.documentElement.lang = 'en-IN';

    upsertMetaTag('meta[name="description"]', {
      name: 'description',
      content: pageMeta.description,
    });

    upsertMetaTag('meta[name="robots"]', {
      name: 'robots',
      content: shouldIndex ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,nofollow',
    });

    upsertMetaTag('meta[property="og:title"]', {
      property: 'og:title',
      content: pageMeta.title,
    });

    upsertMetaTag('meta[property="og:description"]', {
      property: 'og:description',
      content: pageMeta.description,
    });

    upsertMetaTag('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });

    upsertMetaTag('meta[property="og:type"]', {
      property: 'og:type',
      content: pathname === '/' ? 'website' : 'article',
    });

    upsertMetaTag('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: SITE_NAME,
    });

    upsertMetaTag('meta[property="og:image"]', {
      property: 'og:image',
      content: DEFAULT_IMAGE,
    });

    upsertMetaTag('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });

    upsertMetaTag('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: pageMeta.title,
    });

    upsertMetaTag('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: pageMeta.description,
    });

    upsertMetaTag('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: DEFAULT_IMAGE,
    });

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    let jsonLd = document.head.querySelector('script[data-seo-jsonld="true"]');
    if (shouldIndex && pathname === '/') {
      const payload = {
        '@context': 'https://schema.org',
        '@type': 'MovieTheater',
        name: SITE_NAME,
        url: canonicalUrl,
        image: DEFAULT_IMAGE,
        telephone: '+91 7069598725',
        email: 'support@levelbookup.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Surat',
          addressRegion: 'Gujarat',
          addressCountry: 'IN',
        },
        sameAs: [
          'https://www.instagram.com/d_a_t_t_p_a_t_e_l_1_8?igsh=NWJhcTJjMWw3cml3',
          'https://x.com/PatelDatt18',
          'https://youtube.com/@pateldatt18',
        ],
      };

      if (!jsonLd) {
        jsonLd = document.createElement('script');
        jsonLd.type = 'application/ld+json';
        jsonLd.setAttribute('data-seo-jsonld', 'true');
        document.head.appendChild(jsonLd);
      }

      jsonLd.textContent = JSON.stringify(payload);
    } else if (jsonLd) {
      jsonLd.remove();
    }
  }, [location.pathname]);

  return null;
};

export default Seo;