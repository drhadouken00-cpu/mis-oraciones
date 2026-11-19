// 20 mysteries: fresco file (frescos/<key>.webp) + ES/EN names. Order = RosaryMap mystery index.
// Encuadre de cada cuadro dentro del óvalo: [fx, fy, zoom] = punto focal (0–1 del cuadro) y zoom
// (1 = cubre el óvalo; <1 deja ver más cuadro con un fondo difuminado). p = vertical, l = horizontal.
window.MYSTERY_FOCUS={
 'gozosos-1':{p:[.55,.56,.74],l:[.5,.5,1]},'gozosos-2':{p:[.42,.5,1],l:[.42,.38,1]},'gozosos-3':{p:[.3,.55,.85]},'gozosos-4':{p:[.45,.5,1]},'gozosos-5':{p:[.6,.48,1.15]},
 'luminosos-1':{p:[.5,.5,1]},'luminosos-2':{p:[.35,.62,1.2]},'luminosos-3':{p:[.45,.45,1]},'luminosos-4':{p:[.5,.45,1],l:[.5,.3,.85]},'luminosos-5':{p:[.35,.55,1]},
 'dolorosos-1':{p:[.3,.5,1],l:[.35,.4,1]},'dolorosos-2':{p:[.45,.55,1.1]},'dolorosos-3':{p:[.5,.45,1]},'dolorosos-4':{p:[.6,.55,1]},'dolorosos-5':{p:[.47,.45,1]},
 'gloriosos-1':{p:[.5,.42,1],l:[.5,.33,.85]},'gloriosos-2':{p:[.48,.4,1]},'gloriosos-3':{p:[.5,.6,1]},'gloriosos-4':{p:[.5,.3,1.6],l:[.5,.25,.75]},'gloriosos-5':{p:[.5,.4,1],l:[.5,.3,1]}};
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
].map(([key,es,en])=>({key,es,en,src:'frescos/'+key+'.webp',focus:window.MYSTERY_FOCUS[key]||{}}));
window.ROSARY_SETS={es:['Misterios gozosos','Misterios luminosos','Misterios dolorosos','Misterios gloriosos'],en:['Joyful Mysteries','Luminous Mysteries','Sorrowful Mysteries','Glorious Mysteries']};
window.ROSARY_STR={
 es:{ord:['Primer','Segundo','Tercer','Cuarto','Quinto'],mystery:'misterio',intro:'Inicio',end:'Final',prev:'Anterior',next:'Siguiente',play:'Reproducir',pause:'Pausa',step:'Paso',of:'de',complete:'Rosario completo',lap:'Serie',credit:'Obra',tap:'Toca una cuenta para ir a ella',short:['Gozosos','Luminosos','Dolorosos','Gloriosos','Completo']},
 en:{ord:['First','Second','Third','Fourth','Fifth'],mystery:'mystery',intro:'Opening',end:'Closing',prev:'Previous',next:'Next',play:'Play',pause:'Pause',step:'Step',of:'of',complete:'Full Rosary',lap:'Set',credit:'Artwork',tap:'Tap a bead to jump to it',short:['Joyful','Luminous','Sorrowful','Glorious','Full']}
};
