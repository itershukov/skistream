/**
 * Created by sinires on 02.03.17.
 */

var defaultSettings = {
   // "table-borderStyle": "solid",
    "text-string-length": 10,
    "table-backgroundColor": "#ffffff",
    "table-opacity": "1",
    "table-height": "300px",
    "table-width": "400px",
    "text-string-length": "20",
    "text-color": "#000000",
    "text-fontSize": "20px",
    "text-fontFamily": "'Comic Sans MS', cursive, sans-serif"
};

var storageSettings = JSON.parse(localStorage.getItem("settings"));

var settings = Object.assign({}, defaultSettings, storageSettings);

(function initSettings() {
    Object.keys(settings).forEach(function (id) {
        var element = document.getElementById(id);
        if(element)
            element.value = settings[id].replace('px','').replace('pt','');
    })
    updateStyle();
})();

function editSettings(element, param) {
    var name = element.id,
        value = element.value.toString() + (param? param : '');
    settings[name] = value;
    localStorage.setItem('settings', JSON.stringify(settings));
    updateStyle();
}

function updateStyle() {
    var tableElements = document.querySelectorAll(".table-style"),
        textElements  = document.querySelectorAll(".text-style");

    Object.keys(settings).forEach(
        function (param) {
            // debugger;
            var fontKey = 'text-',
                tableKey = 'table-',
                value = settings[param],
                name = null;

            if(param.indexOf(tableKey)>=0){
                name = param.replace(tableKey,'');
                setParam2Elements(name, value, tableElements)
            }else if(param.indexOf(fontKey)>=0){
                name = param.replace(fontKey, '');
                setParam2Elements(name, value, textElements)
            }
        }
    )
}

function setParam2Elements(param, value, elements) {
     for(var i = 0; i<elements.length; i++){
         var element = elements[i];
         element.style[param] = value;
     }
}

function string2array(string) {
    var length = settings["text-string-length"]-0,
        array = [];
    if(!length) return;
    for(var i = 0; i<string.length; i+=length) {
        array.push([string.substr(i, length-1)]);
    }
    return array;

}