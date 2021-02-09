
export function closestBetween (p1, p2, target, threshhold=0.005, start=true) {
	
	let pointDistance = distance(p1.lat,p1.lng,p2.lat,p2.lng,'K');
	let p1dist = distance(p1.lat,p1.lng,target.lat,target.lng,'K');
	let p2dist = distance(p2.lat,p2.lng,target.lat,target.lng,'K');
	let midpoint = {
		lat:(p1.lat+p2.lat)/2,
		lng:(p1.lng+p2.lng)/2
	};
	let mdist = distance(midpoint.lat,midpoint.lng,target.lat,target.lng,'K')
	try {
	if (isNaN(p1dist)) {throw 'wtf'}
	if (isNaN(p2dist)) {throw 'wtf'}
	if (isNaN(mdist)) {throw 'wtf'}
	} catch (err) {
		console.log('GRRRRRR WTF')
		console.log({p1,p2,target,threshhold,p1dist,p2dist,mdist,midpoint,start})
		throw err
	}
	//console.log('Points are ',pointDistance,'km a part');
	/* if (start) {
		console.log('Find distance between: ',p1,p2,'and',target,'with threshhold',threshhold,'km')
		console.log('p1 is ',p1dist,'from target')
		console.log('p2 is ',p2dist,'from target')
		console.log('Midpoint is',midpoint,' which is ',mdist,'from target');
	} */
	let dist = Math.min(p1dist,p2dist,mdist);
	if (pointDistance < threshhold) {
		/* console.log('Returning:',dist,'which is distance from point')
		console.log('Options were ',p1dist,p2dist,mdist)
		if (dist==mdist) {console.log(mdist)}
		if (dist==p1dist) {console.log(p1dist)}
		if (dist==p2dist) {console.log(p2dist)} */
		return dist
	} else {
		if (p1dist < p2dist) {
			return closestBetween(
				p1,
				midpoint,
				target,
				threshhold,
				false
			)
		} else {
			return closestBetween(
				p2,
				midpoint,
				target,
				threshhold,
				false
			)
		}
	}
}

export function distance(lat1, lon1, lat2, lon2, unit) {
    /* https://www.geodatasource.com/developers/javascript */
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}