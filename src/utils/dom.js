import { fireEvent } from './events';

let windowURL = window.URL || window.webkitURL;

export function createBlobUrl(data) {
  var blob = new Blob([ data ], { type: 'text/csv;charset=utf-8' });
  return windowURL.createObjectURL(blob);
}

export function setupDownloadLink(url, filename) {
  var anchor = document.createElement('a');
  var isDownloadSupported = (typeof anchor.download !== 'undefined');

  anchor.href = url;
  anchor.target = '_blank';
  if (isDownloadSupported) {
    anchor.download = filename;
  }
  fireEvent(anchor, 'click');
  if (isDownloadSupported) {
    windowURL.revokeObjectURL(anchor.href);
  }
}

/**
 * Get the x coordinate of oElement
 *
 * @param domElement - The element to get the X position of.
 *
 */
export function getX(domElement) {
  var xValue = 0;
  while (domElement) {
    xValue += domElement.offsetLeft;
    domElement = domElement.offsetParent;
  }
  return xValue;
}

/**
 * Get the y coordinate of oElement
 *
 * @param domElement - The element to get the Y position of.
 *
 */
export function getY(domElement) {
  var yValue = 0;
  while (domElement) {
    yValue += domElement.offsetTop;
    domElement = domElement.offsetParent;
  }
  return yValue;
}

export function addClass(element, className) {
  var classes = element.className.split(' ');
  if (classes.indexOf(className) === -1) {
    classes.push(className);
    element.className = classes.join(' ');
  }
}

export function removeClass(element, className) {
  var classes = element.className.split(' ');
  var index = classes.indexOf(className);

  if (index !== -1) {
    classes.splice(index, 1);
    element.className = classes.join(' ');
  }
}

export function hasClass(element, className) {
  var classes = element.className.split(' ');
  var index = classes.indexOf(className);

  return index !== -1;
}