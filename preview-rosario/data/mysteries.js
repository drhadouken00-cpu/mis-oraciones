// 20 mysteries: fresco file (frescos/<key>.webp) + ES/EN names. Order = RosaryMap mystery index.
// optional focus per artwork inside the oval (SVG preserveAspectRatio)
window.MYSTERY_FIT={'gloriosos-4':'xMidYMin slice','gloriosos-1':'xMidYMin slice','gozosos-1':'xMidYMid slice'};
window.MYSTERIES=[
 ['gozosos-1','La Anunciación','The Annunciation'],
 ['gozosos-2','La Visitación','The Visitation'],
 ['gozosos-3','El Nacimiento de Jesús','The Nativity'],
 ['gozosos-4','La Presentación en el Templo','The Presentation in the Temple'],
 ['gozosos-5','El Niño perdido y hallado en el Templo','The Finding in the Temple'],
 ['luminosos-1','El Bautismo en el Jordán','The Baptism in the Jordan'],
 ['luminosos-2','Las Bodas de Caná','The Wedding at Cana'],
 ['luminosos-3','El Anuncio del Reino','The Proclamation of the Kingdom'],
 ['luminosos-4','La Transfiguración','The Transfiguration'],
 ['luminosos-5','La Institución de la Eucaristía','The Institution of the Eucharist'],
 ['dolorosos-1','La Oración en el Huerto','The Agony in the Garden'],
 ['dolorosos-2','La Flagelación','The Scourging at the Pillar'],
 ['dolorosos-3','La Coronación de espinas','The Crowning with Thorns'],
 ['dolorosos-4','El Camino del Calvario','The Carrying of the Cross'],
 ['dolorosos-5','La Crucifixión','The Crucifixion'],
 ['gloriosos-1','La Resurrección','The Resurrection'],
 ['gloriosos-2','La Ascensión','The Ascension'],
 ['gloriosos-3','La Venida del Espíritu Santo','The Descent of the Holy Spirit'],
 ['gloriosos-4','La Asunción de María','The Assumption of Mary'],
 ['gloriosos-5','La Coronación de María','The Coronation of Mary']
].map(([key,es,en])=>({key,es,en,src:'frescos/'+key+'.webp',fit:window.MYSTERY_FIT[key]||'xMidYMid slice'}));
window.ROSARY_SETS={es:['Misterios gozosos','Misterios luminosos','Misterios dolorosos','Misterios gloriosos'],en:['Joyful Mysteries','Luminous Mysteries','Sorrowful Mysteries','Glorious Mysteries']};
window.ROSARY_STR={
 es:{ord:['Primer','Segundo','Tercer','Cuarto','Quinto'],mystery:'misterio',intro:'Inicio',end:'Final',demo:'Demo',prev:'Anterior',next:'Siguiente',play:'Reproducir',pause:'Pausa',step:'Paso',of:'de',complete:'Rosario completo',lap:'Serie',credit:'Obra',tap:'Toca una cuenta para ir a ella',short:['Gozosos','Luminosos','Dolorosos','Gloriosos','Completo']},
 en:{ord:['First','Second','Third','Fourth','Fifth'],mystery:'mystery',intro:'Opening',end:'Closing',demo:'Demo',prev:'Previous',next:'Next',play:'Play',pause:'Pause',step:'Step',of:'of',complete:'Full Rosary',lap:'Set',credit:'Artwork',tap:'Tap a bead to jump to it',short:['Joyful','Luminous','Sorrowful','Glorious','Full']}
};
