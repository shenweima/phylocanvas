$(function(){!function(){window.WGST.exports.mapFullscreenIdToTemplateId={"collection-map":"collection-map-fullscreen","collection-data":"collection-data-fullscreen"},window.WGST.exports.mapFullscreenIdToPanelType={"collection-map":"collection-map","collection-data":"collection-data"},window.WGST.exports.createFullscreen=function(e,l){if(!($('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').length>0)){if("undefined"==typeof l)return console.error("[WGST][Error] No template context were provided."),void 0;l.fullscreenLabel=window.WGST.exports.getContainerLabel({containerName:"fullscreen",containerType:l.fullscreenType,containerId:e}),console.debug("templateContext.fullscreenType: "+l.fullscreenType);var n=window.WGST.exports.mapFullscreenIdToTemplateId[l.fullscreenType];console.debug("fullscreenTemplateId: "+n);var o=$('.wgst-template[data-template-id="'+n+'"]').html(),t=Handlebars.compile(o),a=t(l);$(".wgst-workspace").prepend(a),window.WGST.exports.createHidable(e,l.fullscreenLabel)}},window.WGST.exports.removeFullscreen=function(e){$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').remove(),window.WGST.exports.hidableFullscreenRemoved(e)},window.WGST.exports.showFullscreen=function(e){$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').removeClass("hide-this invisible-this"),window.WGST.exports.hidableFullscreenShown(e)},window.WGST.exports.bringFullscreenToFront=function(e){$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').css("z-index","5000")},window.WGST.exports.bringFullscreenToBack=function(e){$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').css("z-index","auto")},window.WGST.exports.bringFullscreenToPanel=function(e,l){if(0!==$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').length){var n=e.split("__")[0],o=e,t=e.split("__")[1],a=n;if(console.debug("[WGST][Debug] bringFullscreenToPanel | fullscreenType: "+a),console.debug("[WGST][Debug] bringFullscreenToPanel | fullscreenId: "+e),console.debug("[WGST][Debug] bringFullscreenToPanel | panelId: "+o),console.debug("[WGST][Debug] bringFullscreenToPanel | panelType: "+n),console.debug("[WGST][Debug] bringFullscreenToPanel | collectionID: "+t),window.WGST.exports.createPanel(n,{panelId:o,panelType:n,collectionId:t}),"undefined"!=typeof l&&l(),"collection-data"===a){var s=$('.wgst-fullscreen[data-fullscreen-id="'+e+'"]').find(".wgst-panel-body"),r=$('.wgst-panel[data-panel-id="'+o+'"]');r.find(".wgst-panel-body").replaceWith(s.clone(!0)),r.find(".wgst-collection-controls").removeClass("hide-this")}else"collection-map"===a&&$('.wgst-panel[data-panel-id="'+o+'"]').find(".wgst-panel-body-content").append(window.WGST.geo.map.canvas.getDiv());window.WGST.exports.removeFullscreen(e),window.WGST.exports.showPanel(o),"collection-map"===a&&google.maps.event.trigger(window.WGST.geo.map.canvas,"resize"),window.WGST.exports.bringPanelToFront(o)}},window.WGST.exports.bringPanelToFullscreen=function(e){var l=e.split("__")[0],n=e;if(console.debug("[WGST][Debug] bringPanelToFullscreen | fullscreenType: "+l),console.debug("[WGST][Debug] bringPanelToFullscreen | fullscreenId: "+n),console.debug("[WGST][Debug] bringPanelToFullscreen | panelId: "+e),!($('.wgst-fullscreen[data-fullscreen-id="'+n+'"]').length>0)){window.WGST.exports.createFullscreen(n,{fullscreenType:l,fullscreenId:n}),"undefined"!=typeof panelWasCreated&&panelWasCreated();var o=$('.wgst-panel[data-panel-id="'+e+'"]').attr("data-panel-type"),t=$('.wgst-fullscreen[data-fullscreen-id="'+n+'"]');if("collection-data"===o){var a=$('.wgst-panel[data-panel-id="'+e+'"]').find(".wgst-panel-body");a.clone(!0).appendTo(t),t.find(".wgst-collection-controls").addClass("hide-this")}else"collection-map"===o&&$('.wgst-fullscreen[data-fullscreen-id="'+n+'"]').find(".wgst-map").replaceWith(window.WGST.geo.map.canvas.getDiv());window.WGST.exports.showFullscreen(n),"collection-map"===o&&google.maps.event.trigger(window.WGST.geo.map.canvas,"resize"),window.WGST.exports.removePanel(e),console.debug(">>>> WATCH this one: "+$('[data-toggle="tooltip"]').length)}}}()});