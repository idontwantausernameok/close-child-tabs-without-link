browser.browserAction.onClicked.addListener( async (tab) => {

	const regexstr = (await (async () => {
		try {
			const storeid = 'regex';
			let tmp = await browser.storage.local.get(storeid);
			if (typeof tmp[storeid] === 'string'){
				return tmp[storeid];
			}
		}catch(e){
			console.error(e);
		}
		return '';
	})());

	if(regexstr === ''){
		console.log('hammertime');
		return;
	}

	//const regex = new RegExp('^https?:\/\/corp\.local\/reports\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/complete$');

	const tabs = await browser.tabs.query({currentWindow: true, active: false});
	for ( const t of tabs) {
		if(t.openerTabId === tab.id){
			// check if the tab contains an anchor with 
			let keep_open = await browser.tabs.executeScript(t.id,{
				code: `
				(function(){
					const anchors = document.getElementsByTagName('a');
					const regex = new RegExp('${regexstr}');
					for (let anchor of anchors){
						if( anchor.href && regex.test(anchor.href) ) {
							return true; 
						}
					}
					return false;
				}());
				`
			});
			keep_open = keep_open[0];
			if(!keep_open){
				browser.tabs.remove(t.id);
				//console.log('removed ', t.url);
			}
		}
	}
});

