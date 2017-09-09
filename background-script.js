let lastActiveTab = {
	"id": 0,
	"pinned": false
};
let loadInBackground = true;

browser.storage.local.get("loadInBackground", function(res) {
	if (res.loadInBackground === undefined) {
		loadInBackground = true;

		browser.storage.local.set({
			"loadInBackground": true
		});
	} else {
		loadInBackground = res.loadInBackground;
	}
});

browser.storage.onChanged.addListener(function(changes) {
	if (changes["loadInBackground"]) {
		loadInBackground = changes["loadInBackground"].newValue;
	}
});

browser.tabs.onActivated.addListener(function(activeInfo) {
	browser.tabs.get(activeInfo.tabId, function(activeTab) {
		lastActiveTab = {
			"id": activeTab.id,
			"pinned": activeTab.pinned
		};
	});
});

browser.tabs.onCreated.addListener(function(tab) {
	if (lastActiveTab.pinned) {
		browser.tabs.query({
			windowId: tab.windowId
		}, function(tabs) {
			// check if tab was opened from outside of firefox or is about:newtab
			if (tab.index != tabs.length - 1) {
				browser.tabs.move(tab.id, {
					index: -1
				}, function() {
					// in all cases scroll tab bar to the right
					browser.tabs.update(tab.id, { active: true });
					
					if (loadInBackground) {
						browser.tabs.update(lastActiveTab.id, { active: true });
					}
				});
			}
		});
	}
});
