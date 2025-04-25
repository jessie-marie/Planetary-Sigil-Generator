const CHALDEAN_ORDER = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

function getCurrentPlanetaryHour(callback) {
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      const lat = data.latitude;
      const lon = data.longitude;

      if (!lat || !lon) {
        console.warn("Failed to get IP-based coordinates, defaulting to Sun.");
        callback({ hourRuler: 'sun', dayRuler: 'sun' });
        return;
      }

      const now = new Date();
      const times = SunCalc.getTimes(now, lat, lon);

      const sunrise = times.sunrise;
      const sunset = times.sunset;

      const isDay = now >= sunrise && now < sunset;
      const base = isDay ? sunrise : sunset;
      const nextBase = isDay
        ? sunset
        : SunCalc.getTimes(new Date(now.getTime() + 86400000), lat, lon).sunrise;

      const hourLength = (nextBase - base) / 12;
      const hourIndex = Math.floor((now - base) / hourLength);

      const weekday = now.getDay(); // 0=Sunday, 1=Monday, etc.
      const dayRulers = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
      const dayRuler = dayRulers[weekday];

      const startIndex = CHALDEAN_ORDER.indexOf(dayRuler);
      const fullSequence = Array.from({ length: 24 }, (_, i) =>
        CHALDEAN_ORDER[(startIndex + i) % 7]
      );

      const hourRuler = fullSequence[hourIndex % 24];

      callback({ hourRuler, dayRuler });
    })
    .catch(error => {
      console.error("Error fetching IP location:", error);
      callback({ hourRuler: 'sun', dayRuler: 'sun' });
    });
}
