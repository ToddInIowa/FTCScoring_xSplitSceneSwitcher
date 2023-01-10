var xjs = require('xjs');

xjs.ready()
.then(function() {
  return xjs.Scene.getSceneCount();
}).then(function(count) {
  for(let i = 1; i < count + 1; i++) {
    xjs.Scene.getById(i).then(function(scene) {
      var newElement = document.createElement('BUTTON');
      var t = document.createTextNode('Scene:: '+ i);
      newElement.appendChild(t);
      document.getElementById('scene-id').appendChild(newElement);
      newElement.addEventListener('click', function() {
        xjs.Scene.setActiveScene(scene);
      });
    });
  }
});