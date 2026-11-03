const section = document.getElementById('opciones-web');
if (section) {
  import('../business/offer-selection.js')
    .then(({initializeObjectives}) => initializeObjectives(section))
    .catch(error => console.error('No se pudo iniciar el selector de objetivos', error));
}
