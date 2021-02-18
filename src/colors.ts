let gearColors = [        
    '#fe7f2d',
    '#a09abc',
    '#2176ae',
    '#4b3b40',
    '#9db17c',
    '#16697a',
    '#cb9cf2',
    '#d64933',
    '#086050',
    '#9d9d24',
    '#3d52d5',
                    ]
                
let gearColorIndex = 0;
let colorByGear = {}
export function getColorForGear (id) {
    console.log('Get color for ',id)
    if (customColors[id]) {
        return customColors[id];
    }
    if (colorByGear[id]) {
        return colorByGear[id];
    } else {
        colorByGear[id] = gearColors[gearColorIndex % gearColors.length];
        gearColorIndex += 1;
        return colorByGear[id];
    }
}
export const defaultColor = '#ff3e00'
export function getColors () {
    return [defaultColor,...gearColors.slice(gearColorIndex)]
}

let storedCustomColors = localStorage.getItem('customColors');
let customColors = {}
if (storedCustomColors) {
    try {
        customColors = JSON.parse(storedCustomColors);
    } catch (err) {
        console.log('Bad custom colors?',storedCustomColors)
    }
    for (let color in Object.values(customColors)) {
        if (gearColors.indexOf(color)>-1) {
            gearColors.splice(gearColors.indexOf(color),1); // remove one...
        }
    }
}

export function setCustomColor (id, color) {
    console.log('Custom color!',id,'==>',color)
    customColors[id] = color
    localStorage.setItem('customColors',JSON.stringify(customColors));
    if (gearColors.indexOf(color)>-1) {
        gearColors.splice(gearColors.indexOf(color),1); // remove one...
    }
}