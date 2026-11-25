'use strict';
// Mis oraciones v3.1 (20): créditos de los textos de las oraciones (Ajustes ⚙ › Créditos). Solo añade un bloque; no toca ninguna clave guardada.
(()=>{
const cr=document.querySelector('.v8credits');if(!cr||document.getElementById('textCredits'))return;
const EN=window.MO_LANG==='en',T=(es,en)=>EN?en:es;
const ES_ITEMS=[
 ['Salmo 91 (90); Salmo 92 (91)','Sagrada Biblia, traducción católica de Félix Torres Amat (1823-1825), dominio público; es el mismo texto de la Biblia de esta app (en la numeración de la Vulgata son el Salmo 90 y el Salmo 91). En inglés: Douay-Rheims, revisión de Challoner (1899), dominio público.'],
 ['Magníficat','cántico de María (Lc 1, 46-55), según la Liturgia de las Horas de la Conferencia Episcopal Española, con el Gloria al Padre.'],
 ['Consagración a la Virgen María','fórmula de san Luis María Grignion de Montfort, del Tratado de la verdadera devoción a la Santísima Virgen (texto abreviado).'],
 ['Oración de Santa Gertrudis','oración tradicional atribuida a santa Gertrudis de Helfta, la Grande. La atribución no consta en sus escritos conservados; se difundió en la piedad popular.'],
 ['Oración a la llaga del hombro de Jesús','devoción tradicional atribuida a san Bernardo de Claraval. La atribución pertenece a la piedad tradicional y no está documentada en sus obras auténticas.'],
 ['Por las almas del purgatorio','devoción popular a María, Reina del Purgatorio. La invocación de la Llama de Amor proviene de la devoción del Inmaculado Corazón de María según el Diario espiritual de Isabel Kindelmann; la fórmula aquí usada es una variante.'],
 ['Perdón, Señor','acto de contrición de la tradición católica en español.'],
 ['Gracias, Señor','acción de gracias y examen de la noche, de devocionario católico tradicional.'],
 ['Guárdanos, Señor; Oración de la noche; Oración para la noche; Oración infantil antes de dormir; Antes de dormir; Oración a los ángeles','oraciones y jaculatorias de devoción popular y de la tradición oral, sin autor conocido, en la forma habitual en que se rezan en español.'],
 ['Versiones en inglés','se usa la forma inglesa tradicional cuando existe (por ejemplo, «Jesus, Mary and Joseph…» o la Biblia Douay-Rheims); las demás son traducciones fieles hechas para esta app.']];
const EN_ITEMS=[
 ['Psalm 91 (90); Psalm 92 (91)','Douay-Rheims Bible, Challoner revision (1899), public domain; the same text as this app’s Bible (Psalms 90 and 91 in the Vulgate numbering). In Spanish: Torres Amat translation (1823–1825), public domain.'],
 ['Magnificat','Canticle of Mary (Lk 1:46-55), as in the Liturgy of the Hours, with the Glory Be.'],
 ['Consecration to the Virgin Mary','formula of St Louis de Montfort, from the Treatise on the True Devotion to the Blessed Virgin (abridged).'],
 ['Prayer of Saint Gertrude','traditional prayer attributed to St Gertrude of Helfta, the Great. The attribution is not found in her surviving writings; the text spread in popular devotion.'],
 ['Prayer to the Shoulder Wound of Jesus','traditional devotion attributed to St Bernard of Clairvaux. The attribution belongs to pious tradition and is not documented in his authentic works.'],
 ['For the Souls in Purgatory','popular devotion to Mary, Queen of Purgatory. The Flame of Love petition comes from the Flame of Love of the Immaculate Heart of Mary, from the Spiritual Diary of Elizabeth Kindelmann; the wording used here is a variant.'],
 ['Forgive Me, Lord','traditional Act of Contrition from Spanish-speaking Catholic devotion.'],
 ['Thank You, Lord','traditional Catholic evening thanksgiving and examination of conscience.'],
 ['Keep Us, Lord; Night Prayer; Prayer for the Night; Children’s Bedtime Prayer; Before Sleep; Prayer to the Angels','prayers and short aspirations from popular devotion and oral tradition, with no known author, in the form in which they are commonly said.'],
 ['English versions','the received traditional English wording is used where one exists (for example “Jesus, Mary and Joseph…” or the Douay-Rheims Bible); the others are faithful translations made for this app.']];
const d=document.createElement('div');d.className='raCredits';d.id='textCredits';d.dataset.noi18n='1';
const h=document.createElement('h4');h.textContent=T('Textos de las oraciones','Prayer texts');d.append(h);
for(const [t,s] of (EN?EN_ITEMS:ES_ITEMS)){const p=document.createElement('p');const b=document.createElement('b');b.textContent=t+':';p.append(b,' '+s);d.append(p)}
cr.append(d);
})();
