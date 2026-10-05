import { useState, useEffect } from 'react';

export default function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const m = window.matchMedia(query);
        const fn = () => setMatches(m.matches);
        m.addEventListener('change', fn);
        return () => m.removeEventListener('change', fn);
    }, [query]);
    return matches;
}