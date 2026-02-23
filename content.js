// content.js
let overlay = null;
let originalWidth = 0;
let originalHeight = 0;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.action) {
    case "applyOverlay":
      applyOverlay(request.imageData);
      break;
    case "removeOverlay":
      removeOverlay();
      break;
    case "setOpacity":
      setOverlayOpacity(request.value);
      break;
    case "setScale":
      setOverlayScale(request.value);
      break;
    case "moveOverlay":
      moveOverlayFromUI(request.direction);
      break;
  }
});

function applyOverlay(imageData) {
  removeOverlay();
  overlay = document.createElement('div');
  overlay.id = 'design-version-comparator-overlay';
  document.body.appendChild(overlay);

  const img = new Image();
  img.onload = function() {
    originalWidth = this.width;
    originalHeight = this.height;
    overlay.style.width = originalWidth + 'px';
    overlay.style.height = originalHeight + 'px';
    overlay.style.backgroundImage = `url(${imageData})`;
    overlay.style.backgroundSize = 'contain';
    positionOverlay();
    
    overlay.style.zIndex = '2147483647';
  };
  img.src = imageData;

  document.addEventListener('keydown', moveOverlay);
  window.addEventListener('scroll', positionOverlay);
  window.addEventListener('resize', positionOverlay);
  
  overlay.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
}

function removeOverlay() {
  if (overlay) {
    document.body.removeChild(overlay);
    overlay = null;
    document.removeEventListener('keydown', moveOverlay);
    window.removeEventListener('scroll', positionOverlay);
    window.removeEventListener('resize', positionOverlay);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
    offsetX = 0;
    offsetY = 0;
  }
}

function setOverlayOpacity(value) {
  if (overlay) {
    overlay.style.opacity = value;
  }
}

function setOverlayScale(value) {
  if (overlay) {
    overlay.style.transform = `scale(${value})`;
    positionOverlay();
  }
}

function positionOverlay() {
  if (overlay) {
    overlay.style.position = 'fixed';
    overlay.style.left = `${offsetX}px`;
    overlay.style.top = `${offsetY}px`;
  }
}

function moveOverlay(e) {
  if (overlay) {
    const step = e.shiftKey ? 100 : 10;
    moveOverlayByStep(e.key, step);
    e.preventDefault();
  }
}

function moveOverlayFromUI(direction) {
  if (overlay) {
    moveOverlayByStep(direction, 10);
  }
}

function moveOverlayByStep(direction, step) {
  switch(direction) {
    case 'ArrowLeft':
      offsetX -= step;
      break;
    case 'ArrowRight':
      offsetX += step;
      break;
    case 'ArrowUp':
      offsetY -= step;
      break;
    case 'ArrowDown':
      offsetY += step;
      break;
    default:
      return;
  }
  positionOverlay();
}

function startDragging(e) {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  overlay.style.cursor = 'grabbing';
}

function drag(e) {
  if (isDragging) {
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    offsetX += deltaX;
    offsetY += deltaY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    positionOverlay();
  }
}

function stopDragging() {
  isDragging = false;
  overlay.style.cursor = 'grab';
}