// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const imageUpload = document.getElementById('imageUpload');
  const pasteArea = document.getElementById('pasteArea');
  const applyButton = document.getElementById('applyOverlay');
  const removeButton = document.getElementById('removeOverlay');
  const opacitySlider = document.getElementById('opacitySlider');
  const scaleSlider = document.getElementById('scaleSlider');
  const opacityValue = document.getElementById('opacityValue');
  const scaleValue = document.getElementById('scaleValue');

  const moveLeft = document.getElementById('moveLeft');
  const moveRight = document.getElementById('moveRight');
  const moveUp = document.getElementById('moveUp');
  const moveDown = document.getElementById('moveDown');

  let pastedImage = null;

  pasteArea.addEventListener('paste', function(e) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        pastedImage = items[i].getAsFile();
        pasteArea.value = 'Image pasted successfully!';
        break;
      }
    }
  });

  applyButton.addEventListener('click', function() {
    let imageFile = imageUpload.files[0] || pastedImage;
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "applyOverlay", imageData: e.target.result});
        });
      };
      reader.readAsDataURL(imageFile);
    }
  });

  removeButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "removeOverlay"});
    });
  });

  opacitySlider.addEventListener('input', function() {
    const value = opacitySlider.value;
    opacityValue.textContent = `${Math.round(value * 100)}%`;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "setOpacity", value: value});
    });
  });

  scaleSlider.addEventListener('input', function() {
    const value = scaleSlider.value;
    scaleValue.textContent = `${Math.round(value * 100)}%`;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "setScale", value: value});
    });
  });

  function moveOverlay(direction) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "moveOverlay", direction: direction});
    });
  }

  moveLeft.addEventListener('click', () => moveOverlay('ArrowLeft'));
  moveRight.addEventListener('click', () => moveOverlay('ArrowRight'));
  moveUp.addEventListener('click', () => moveOverlay('ArrowUp'));
  moveDown.addEventListener('click', () => moveOverlay('ArrowDown'));

  document.addEventListener('keydown', function(e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      moveOverlay(e.key);
      e.preventDefault();
    }
  });
});