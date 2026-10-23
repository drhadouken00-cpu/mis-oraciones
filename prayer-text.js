'use strict';
window.prayerTools = (()=>{
 const ave='Dios te salve, María, llena eres de gracia, el Señor es contigo; bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.';
 const padre='Padre nuestro, que estás en los cielos, santificado sea tu nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.';
 const gloria='Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.';
 function expand(text){
   const numbers={un:1,una:1,uno:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10};
   return text.replace(/\b(?:rezar|reza|se\s+reza[n]?)\s+(?:(un[ao]?|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d{1,2})\s+)?(ave\s*mar[ií]as?|padre\s*nuestros?|glorias?)\b\.?/gi,(match,count,name)=>{
     const n=count?(numbers[count.toLowerCase()]||Number(count)):1;
     if(!n||n>20)return match;
     const key=name.normalize('NFD').replace(/[\u0300-\u036f\s]/g,'').toLowerCase();
     return '\n\n'+Array(n).fill(key.startsWith('ave')?ave:key.startsWith('padre')?padre:gloria).join('\n\n')+'\n\n';
   }).replace(/\n{3,}/g,'\n\n').trim();
 }
 function parts(text){
   const chunks=text.replace(/\r/g,'').replace(/\[PETICIÓN\]/gi,'\n\n[PETICIÓN]\n\n').split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean), result=[];
   for(const chunk of chunks){
     if(chunk.toUpperCase()==='[PETICIÓN]'){result.push({text:'Haz tu petición en silencio. Pulsa continuar cuando quieras seguir.',pause:true});continue}
     // Bound each utterance even when pasted text has no paragraph breaks.
     let rest=chunk;
     while(rest.length>3000){let end=rest.lastIndexOf('. ',3000);if(end<500)end=rest.lastIndexOf(' ',3000);if(end<1)end=3000;else end++;result.push({text:rest.slice(0,end).trim(),speech:rest.slice(0,end).trim()});rest=rest.slice(end).trim()}
     if(rest)result.push({text:rest,speech:rest});
   }
   return result;
 }
 return {expand,parts};
})();
