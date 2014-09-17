$(function(){!function(){window.WGST.exports.createAssemblyPanel=function(e,o){var n="assembly__"+e,r="assembly",s={panelId:n,panelType:r};return"undefined"!=typeof o&&$.extend(s,o),window.WGST.exports.createPanel(r,s),n},window.WGST.exports.calculateAssemblyTopScore=function(e){var o,n=[];for(o in e)e.hasOwnProperty(o)&&n.push({referenceId:e[o].referenceId,score:e[o].score});return n=n.sort(function(e,o){return o.score-e.score}),n[0]};var e=function(e){var o="";return o=0===e.length?"Not found":e},o=function(e,o){var n,r,s,t,a,l,i=[];for(s in e)if(e.hasOwnProperty(s)){t=e[s],n=[];for(a in t)t.hasOwnProperty(a)&&(r="","undefined"!=typeof o[s]?"undefined"!=typeof o[s][a]?(l=o[s][a].resistanceState,r="RESISTANT"===l?"RESISTANT":"SENSITIVE"===l?"SENSITIVE":"UNKNOWN"):r="UNKNOWN":r="UNKNOWN",n.push({antibioticName:a,antibioticResistanceData:r}));i.push({antibioticGroupName:s,antibioticGroupResistanceData:n})}return i},n=function(e){var o,n,r,s=[];for(r in e)e.hasOwnProperty(r)&&(o=e[r],n={},n=null===o?{locusId:"None",alleleId:r}:{locusId:e[r].locusId,alleleId:e[r].alleleId},s.push(n));return s},r=function(e){var o=window.WGST.exports.calculateAssemblyTopScore(e),n=o.referenceId;return n},s=function(e,o){for(var n=[],r=Object.keys(o).sort(function(e,n){return o[e]-o[n]}),s=r.length;0!==s;){s-=1;var t=r[s],a=o[t],l=a.score.toFixed(2)+" = "+Math.round(a.score*parseInt(e,10))+"/"+e;n.push({referenceId:a.referenceId,text:l})}return n};window.WGST.exports.getAssembly=function(t){$.ajax({type:"POST",url:"/api/assembly",datatype:"json",data:{assemblyId:t}}).done(function(a){console.log("[WGST] Received data for assembly "+t);var l=a.assembly,i=l.ASSEMBLY_METADATA.userAssemblyId,c=a.antibiotics,d=l.PAARSNP_RESULT.paarResult.resistanceProfile,u=o(c,d),p=l.MLST_RESULT.stType,f=e(p);console.debug("assemblySequenceTypeData:"),console.log(f);var S=l.MLST_RESULT.alleles,y=n(S);console.debug("assemblyMlstData:"),console.dir(y);var T=l.FP_COMP.scores,b=r(T);console.debug("assemblyNearestRepresentativeData:"),console.dir(b);var m=l.FP_COMP.fingerprintSize,I=s(m,T);console.debug("assemblyScoresData:"),console.dir(I);var w={assemblyUserId:i,antibioticResistanceData:u,sequenceTypeData:f,mlstData:y,nearestRepresentativeData:b,scoresData:I};console.debug("additionalTemplateContext:"),console.dir(w);var N=window.WGST.exports.createAssemblyPanel(t,w);window.WGST.exports.bringPanelToFront(N),window.WGST.exports.showPanel(N)}).fail(function(e,o,n){console.log("[WGST][Error] Failed to get assembly data"),console.error(o),console.error(n),console.error(e)})}}()});