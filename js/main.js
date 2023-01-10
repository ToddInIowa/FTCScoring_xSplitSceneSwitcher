// to use tailwindcss: https://tailwindcss.com/docs/installation
// To compile the output.css use the following command in a terminal window
// npx tailwindcss -i dev/input.css -o css/output.css --watch

var xjs = require('xjs');
var ScoringServer = "192.168.0.179";
var SSapiEventCodes = "/api/v1/events/";
var EventCode = "usiadsmtst99";
var SSapiStream = "/api/v2/stream/?code=";
var NumFields = 1;
var ActiveField = 1;
var ActiveScene = 1;
var fieldVariable = "";
var DebugEnabled = false;

document.getElementById("ss-pull-events").onclick = async function() {
    //The pull events button was clicked
    //alert('Pull Matches button pressed');
    ScoringServer = document.getElementById("scoring-system").value;
    const response= await fetch("http://" + ScoringServer + SSapiEventCodes)
    console.log(response);
    const data= await response.json();
    //console.log(data);
    length=data.eventCodes.length;
    //console.log(data);
    var temp="";
    for(i=0;i<length;i++)
    {
        temp+='<div class="flex items-center">' + "\n";
        temp+='<input value="' + data.eventCodes[i] + '" name="ss-pulled-events" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500">' + "\n";
        temp+='<label for="push-everything" class="ml-3 block text-sm font-medium text-gray-700">' + data.eventCodes[i] + '</label>' + "\n";
        temp+='</div>' + "\n";
    }

        document.getElementById("ss-events").innerHTML=temp;
  
}


function ConnectToScoringSystem() {
    let socket = new WebSocket("ws://" + ScoringServer + SSapiStream + EventCode);

    socket.onopen = function(e) {
    if (DebugEnabled) { alert("[open] Connection established"); };
    SSConnectedStatus.innerHTML = "Connected";
    document.getElementById("SSConnectedStatus").className = "h-10 flex rounded-r-md border border-l-0 items-center justify-center px-3 text-sm bg-green-600 shadow-lg";
    };

    socket.onmessage = function(event) {
        
        var msg = JSON.parse(event.data);
        //var fieldVariable = 'field' + ActiveField + '-scene';
        if (DebugEnabled) { alert("Data received:" + event.data); };
        if (DebugEnabled) { alert("\nUpdate Type:" + msg.updateType + "\nField Number:" + msg.payload.field ); };
        // alert("Update Type:" + event)
        ActiveField = msg.payload.field;
        fieldVariable = 'field' + ActiveField + '-scene';
        if (DebugEnabled) { alert('ActiveField:' + ActiveField + "\nfieldVariable:" +fieldVariable); };
        var e = document.getElementById(fieldVariable);
        ActiveScene = e.value;
        
        if (DebugEnabled) { alert('SHOW_PREVIEW for field ' + ActiveField + ' Switching to Scene ' + ActiveScene); };
        
        switch (msg.updateType) {
            case "SHOW_PREVIEW":
              xjs.Scene.getBySceneIndex(ActiveScene).then(function(scene) {
                xjs.Scene.setActiveScene(scene);
              });

           break;
            case "MATCH_START":
              xjs.Scene.getBySceneIndex(ActiveScene).then(function(scene) {
                xjs.Scene.setActiveScene(scene);
              });
            break;
        // //    case "MATCH_COMMIT":

        // //    break;
            case "MATCH_POST":
              xjs.Scene.getBySceneIndex(ActiveScene).then(function(scene) {
                xjs.Scene.setActiveScene(scene);
              });
            break;
        //    case "MATCH_ABORT":

        //    break;
        }
    }

    socket.onclose = function(event) {
        if (event.wasClean) {
            alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            alert('[close] Connection died');
        }
        SSConnectedStatus.innerHTML = "Not Connected";
        document.getElementById("SSConnectedStatus").className = "h-10 flex rounded-r-md border border-l-0 items-center justify-center px-3 text-sm bg-red-600 shadow-lg";
    };

    socket.onerror = function(error) {
        alert(`[error]`);
        SSConnectedStatus.innerHTML = "Not Connected";
        document.getElementById("SSConnectedStatus").className = "h-10 flex rounded-r-md border border-l-0 items-center justify-center px-3 text-sm bg-red-600 shadow-lg";
    };
}

document.getElementById("ConnectSS").onclick = function() {
    var ele =document.getElementsByName('ss-pulled-events');
    for (i=0; i < ele.length; i++) {
        if (ele[i].checked) {
            EventCode = ele[i].value;
        }
    }
    //alert('EventCode is:' + EventCode);
    ConnectToScoringSystem();
}

document.getElementById("UpdateNumFields").onclick = function() {
    NumFields = document.getElementById("NumFields").value;
    xjs.ready().then(function() {
  
      return xjs.Scene.getSceneCount();
    }).then(function(SceneCount) {
      //if (DebugEnabled) { alert('Debug: The number of scenes:' + SceneCount + '\nThe number of fields:' + NumFields); };
      if (NumFields > SceneCount) {
        alert('ERROR: The system only has ' + SceneCount + ' scene(s) configured. \nThere must be the same number of scenes or more than the number of fields.');
      } else {
        var tempHtml = ""
        for(i=1;i<=NumFields;i++) {
          tempHtml += '<div class="mt-1 flex rounded-md shadow-sm">'+"\n";
          tempHtml += '<span class="inline-flex items-center rounded-l-md border whitespace-nowrap border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-500">Field ' + i + "</span>\n";
          tempHtml += '<select id="field' + i + '-scene" class="h-10 mt-1 block w-full rounded-none rounded-r-md border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">'+"\n\n";
          tempHtml += '<!-- SceneCount:' + SceneCount + '-->' + "\n";
          for(j = 0; j < SceneCount; j++) {
            tempHtml += '<!-- SceneNumber:' + j + '-->' + "\n";
       
            tempHtml += '<option value="' + j;
            if(i == (j+1) ) {
              tempHtml += '" selected>Scene ' + (j+1) + '-';
            } else {
              tempHtml += '">Scene ' + (j+1) + '-';
            }
            //This section that is supposed to get the scene name isn't working yet.
            xjs.Scene.getBySceneIndex(0).then(function(focusscene) {
                focusscene.getName().then(function(name) {
                  tempHtml += name;
              });
            });
            tempHtml += '</option>\n';
            
            
          }
          //  <option value="1" selected>Scene 1</option>
          //  <option value="2">Scene 2</option>
          //  <option value="3">Scene 3</option>
          tempHtml += '</select>';
          tempHtml += '</div>';
        }
        document.getElementById("FieldMapping").innerHTML = tempHtml;
        document.getElementById("FieldMapping").className = "mt-4 space-y-4";
        
        let XSplitStatus = document.getElementById('XSplitStatus');
        XSplitStatus.innerHTML = "Ready";
        XSplitStatus.className = "h-10 flex rounded-r-md border border-l-0 items-center justify-center px-3 text-sm bg-green-600 shadow-lg";
      }
      
    });
  
  };

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

let SSConnectedStatus = document.getElementById('SSConnectedStatus');
SSConnectedStatus.className = "h-10 flex rounded-r-md border border-l-0 items-center justify-center px-3 text-sm bg-red-600 shadow-lg";
SSConnectedStatus.innerHTML = "Not Connected";
let XSplitStatus = document.getElementById('XSplitStatus');
XSplitStatus.innerHTML = "Not Ready";
XSplitStatus.className = "h-10 flex rounded-r-md border border-l-0 items-center justify-center px-3 text-sm bg-red-600 shadow-lg";
