// Logic for applying rules...
//
//
export function pickBike (activity, rules) {
    let speed = mps2mph(activity.average_speed);
    let temp = c2f(activity.average_temp);
    for (let rule of rules) {      
        // type match
       if (!rule.defaultType || rule.defaultType == activity.type) {
           // speed match
            if (! rule.speedLimit ||
                  ((!rule.maxSpeed || rule.maxSpeed > speed)
                  &&
                  (!rule.minSpeed || rule.minSpeed < speed)
                )
             ) {
                 // temp match
                if (!rule.tempLimit || 
                    (rule.tempLimit && 
                        (
                            (!rule.maxTemp || rule.maxTemp > temp) 
                            &&  
                            (!rule.minTemp || rule.minTemp < temp)
                        ) 
                    )) {
                        if (rule.bike) {
                            return rule.bike
                        }
                    }
            }
       }
    }
}

function mps2mph (mps) {
    return mps * 2.23694
}

function c2f (temp) {
    return 1.8 * temp + 32
} 


function testBikePicker () {
    const sampleActivity = {

    }
    const rules = [
        {"bike":"b6200605","defaultType":"VirtualRide","speedLimit":false,"tempLimit":false,"maxSpeed":15,"maxTemp":12},
        {"bike":"b6808556","defaultType":"Ride","speedLimit":true,"tempLimit":true,"maxSpeed":10,"minTemp":39,"maxTemp":null},
        {"bike":"b6719913","defaultType":"Ride","tempLimit":true,"maxTemp":38,"speedLimit":true,"maxSpeed":10}
    ]
    
}