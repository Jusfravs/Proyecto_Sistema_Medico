(() => {
  const data = window.VECTRA_MAP;
  if (!data || !window.L) return;
  const map = L.map('map', {zoomControl:false}).setView(data.center, 13);
  L.control.zoom({position:'bottomright'}).addTo(map);
  L.tileLayer(data.tileUrl, {attribution:data.attribution, maxZoom:19}).addTo(map);
  const user = L.circleMarker(data.center, {radius:8, color:'#fff', weight:3, fillColor:'#276EF1', fillOpacity:1}).addTo(map).bindTooltip('Referencia de búsqueda');
  const markers = new Map();
  const profileById = new Map(data.profiles.map((profile) => [String(profile.id), profile]));
  let activeRoute = null;
  const construirPopup = (profile) => {
    // Nodos DOM + textContent: nunca se concatena HTML con datos del especialista
    // (nombre y clínica los controla el usuario que se registra). SEC-02.
    const cont = document.createElement('div');
    const nombre = document.createElement('strong');
    nombre.textContent = profile.name;
    const especialidad = document.createElement('div');
    especialidad.textContent = profile.specialty;
    const enlace = document.createElement('a');
    enlace.href = profile.url; // url_for('especialista', ...) -> ruta interna /especialista/<int>
    enlace.textContent = 'Ver perfil';
    cont.append(nombre, especialidad, enlace);
    return cont;
  };
  data.profiles.forEach((profile) => {
    const marker = L.marker([profile.lat, profile.lng]).addTo(map).bindPopup(construirPopup(profile));
    markers.set(String(profile.id), marker);
  });
  document.querySelectorAll('[data-profile-id]').forEach((card) => card.addEventListener('mouseenter', () => markers.get(card.dataset.profileId)?.openPopup()));
  if (data.profiles.length) map.fitBounds(L.latLngBounds([data.center, ...data.profiles.map((p) => [p.lat,p.lng])]), {padding:[48,48], maxZoom:14});
  window.vectraRouteTo = async (lat, lng) => {
    const routeUrl = `${data.routeServiceUrl}/${data.center[1]},${data.center[0]};${lng},${lat}?overview=full&geometries=geojson`;
    try { const response = await fetch(routeUrl); const route = await response.json(); if (route.routes?.[0]) { if (activeRoute) map.removeLayer(activeRoute); activeRoute = L.geoJSON(route.routes[0].geometry, {style:{color:'#276EF1',weight:5}}).addTo(map); map.fitBounds(activeRoute.getBounds(), {padding:[48,48]}); } } catch (_) { /* Haversine distance remains the fallback. */ }
  };
  document.querySelectorAll('[data-route-to]').forEach((button) => button.addEventListener('click', () => {
    const profile = profileById.get(button.dataset.routeTo); if (profile) window.vectraRouteTo(profile.lat, profile.lng);
  }));
})();
