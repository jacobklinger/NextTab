var NextTab = NextTab || {};

NextTab.driver;

window.onload = function(event) {
    NextTab.driver = new NextTab.Driver();
    NextTab.driver.create();
};

window.onresize = function(event) {
    NextTab.driver.resize();
};

NextTab.Driver = function() {
    
    // The maximum number of columns of sites in a window
    var maxColumns = 0;
    
    // Information about the mouse
    var mousedown = false;
    var mousedownX;
    var mousedownY;
    
    // Reference to edit button and state of editing
    var editButton;
    var editing = false;
    
    // The parent element of all the site elements
    var sitesParent = document.getElementsByClassName("sites")[0];
    
    // The element being dragged (turns invisible and rearranges on grid)
    var dragged = null;
    
    // The element the mouse is dragging (a clone of the actual site element)
    var dragging = null;
    
    // Object to add/remove 3D card effect
    var skew3DController;
    
    // Objects to keep collection of sites temporarily and in persistence
    var siteCollection = new NextTab.SiteCollection();
    var storageManager = new NextTab.StorageManager();
    
    /**
    * Get things started. Creates and sets up storage, site elements, and event listeners.
    */
    this.create = function() {
        storageManager.create(siteCollection, setup);
        editButton = document.getElementsByTagName("button")[0];
        editButton.addEventListener("click", editClick);
    };
    
    /**
    * To be called when the window is resized
    */
    this.resize = function() {
        centerSites(SITE_WIDTH, SITE_MARGIN);
    };
    
    onmousedown = function(event) {
        event.preventDefault();
        mousedown = true;
        mousedownX = event.clientX;
        mousedownY = event.clientY;
    };

    onmouseup = function(event) {
        event.preventDefault();
        if (dragging !== null) {
            document.getElementsByTagName("body")[0].removeChild(dragging);
            dragging = null;
            dragged.style.opacity = 1;
            dragged = null;
        }
        mousedown = false;
    };
  
    onmousemove = function(event) {
        event.preventDefault();
        
        if (mousedown && editing && maxColumns > 0) {
            if(event.target.className === "site" && dragging === null) {
                dragged = event.target;
                dragging = event.target.cloneNode();
                dragged.style.opacity = 0;
                dragging.style.position = "fixed";
                document.getElementsByTagName("body")[0].appendChild(dragging);
            }
            
            // Only if we are dragging something
            if (dragging !== null) {
                
                // Get the location of the mouse
                var x = event.clientX;
                var y = event.clientY;
                
                // Get the location/size of the site we are dragging
                var bounds = dragging.getBoundingClientRect();
                
                // Center the site at the mouse location
                dragging.style.left = x - bounds.width/2 + "px";
                dragging.style.top = y - bounds.height/2 + "px";
                
                // Find the coordinates of the center of the site being dragged
                var centerX = bounds.left + bounds.width/2;
                var centerY = bounds.top + bounds.height/2;
                
                // Get the location/size of the site we are dragged
                var bounds = dragged.getBoundingClientRect();
                
                // Find the element before, after, above, and below us
                var previousElement = dragged.previousSibling;
                var nextElement = dragged.nextSibling;
                var belowElement = recursiveNextSibling(dragged, maxColumns);
                var aboveElement = recursivePreviousSibling(dragged, maxColumns);
                
                // We need to find out if the element we are dragging is the first or last one
                var isFirstElement = sitesParent.childNodes[0] == dragged;
                var isLastElement = sitesParent.lastChild == dragged;
                
                // We also need to find out if the element is in the bottom or top row
                var isTopRow = aboveElement === null;
                var isBottomRow = belowElement === null;
                
                // There exists a next element (this is not the last element)
                // And t
                if (!isLastElement) {
                    
                    // Get the bounds of the next element
                    var next = nextElement.getBoundingClientRect();
                    
                    // We need to find out if the site is at the end of a row
                    var endOfRow = bounds.left >= next.left;
                    
                }
                
                // There is no previous element for the first site
                if (!isFirstElement) {
                    
                    // Get the bounds of the previous element
                    var previous = previousElement.getBoundingClientRect();
                    
                    // We need to find out if the site is at the end of a row
                    var beginningOfRow = bounds.left <= previous.left;
                }
                
                // There is an element below us
                if (!isBottomRow) {
                    var below = belowElement.getBoundingClientRect();
                }
                
                //console.log(aboveElement);
                // There is an element above us
                if (!isTopRow) {
                    var above = aboveElement.getBoundingClientRect();
                }
                
                // If we are ahead of the one after us, switch with that one
                // Check to make sure this is not the end of a row
                // Check to make sure there is one after us (this is not the last site)
                if (!isLastElement && !endOfRow && x > next.left) {
                    console.log("1");
                    sitesParent.insertBefore(nextElement, dragged);
                }
                
                // If we are behind of the one before us, switch with that one
                // Check to make sure this is not the beginning of a row
                // Check to make sure there is one before us (this is not the first site)
                else if (!isFirstElement && !beginningOfRow && x < previous.right) {
                    console.log("2");
                    sitesParent.insertBefore(dragged, previousElement);
                }
                
                // If we are below the one below us, move before it
                // Check to make sure there is one below us (this is not the bottom row)
                else if (!isBottomRow && y > below.top) {
                    console.log("3");
                    sitesParent.insertBefore(dragged, belowElement.nextSibling);
                }
                
                // If we are above the one above us, move before it
                // Check to make sure there is one above us (this is not the top row)
                else if (!isTopRow && y < above.bottom) {
                    console.log("4");
                    sitesParent.insertBefore(dragged, aboveElement);
                }
            }
        }
    };
    
    /**
    * Find the next sibling of the given element, count nodes ahead.
    * @param element
    * @param count
    */
    function recursiveNextSibling(element, count) {
        // If this element or the next one is null, return null 
        // (there is no element count nodes ahead)
        if (element === null || element.nextSibling === null) {
            return null;
        }
        // If we are looking for the next sibling, return it
        else if (count === 1) {
            return element.nextSibling;
        }
        // Recursively call this function
        else {
            return recursiveNextSibling(element.nextSibling, count-1);
        }
    };
    
    /**
    * Find the previous sibling of the given element, count nodes back.
    * @param element
    * @param count
    */
    function recursivePreviousSibling(element, count) {
        // If this element or the previous one is null, return null 
        // (there is no element count nodes back)
        if (element === null) {
            return null;
        }
        // If we are looking for the previous sibling, return it
        else if (count === 1) {
            return element.previousSibling;
        }
        // Recursively call this function
        else {
            return recursivePreviousSibling(element.previousSibling, count-1);
        }
    };
    
    /* Finishes setup of the site elements
    *
    */
    function setup() {
        checkForUpdates();
        addSkew3D();
        centerSites(SITE_WIDTH, SITE_MARGIN);
        storageManager.updateStorage(siteCollection.activeSitesObjects(), siteCollection.inactiveSitesObjects());
    };

    /**
    * Adds the 3D card effect to the site collection
    */
    function addSkew3D() {
        skew3DController = new Skew3D();
        skew3DController.create(siteCollection.activeSites());
    };
    
    /**
    * Recenters the sites on the page
    * @param siteWidth
    * @param siteMargin
    */
    function centerSites(siteWidth, siteMargin) {
        // Get the parent element of the sites
        var sitesContainer = document.getElementsByClassName("sites")[0];
        
        // The width of the parent element of the sites
        var siteAreaWidth = parseInt(getComputedStyle(sitesContainer).width);

        // Compute the width of each site
        var siteWidth = SITE_WIDTH + (SITE_MARGIN * 2);

        maxColumns = ~~(siteAreaWidth/siteWidth);

        // Compute the maximum width of one row (top row)
        var maxRowWidth = siteWidth * maxColumns;

        // Compute the different between the width of row and space in site area
        var difference = siteAreaWidth - maxRowWidth;

        // offset the parent element of the sites by half the difference
        sitesContainer.style.transform = "translate(" + difference / 2 + "px)";
    };
    
    /*
    * Called when the edit button is clicked. 
    * Toggles the page between the view and edit state.
    */
    function editClick() {
        
        if (editing) {
            
            editing = !editing;
            
            editButton.innerHTML = "Edit";
            
            siteCollection.viewState(sitesParent);
            
            storageManager.updateStorage(siteCollection.activeSitesObjects(), siteCollection.inactiveSitesObjects());
            
            skew3DController.create(siteCollection.activeSites());
        }
        else {
            
            editing = !editing;
            
            editButton.innerHTML = "Done";
            
            siteCollection.editState(sitesParent);
            
            skew3DController.remove();
        }
    };
    
    function checkForUpdates() {
        
        var allCurrentSites = [];
        
        var active = siteCollection.activeSites();
        
        for (i = 0; i < active.length; i++) {
            allCurrentSites.push(active[i]);
        }
        
        var inactive = siteCollection.inactiveSites();
        
        for (i = 0; i < inactive.length; i++) {
            allCurrentSites.push(inactive[i]);
        }
        
        var allSites = siteCollection.allSites();
        
        for (k = 0; k < allSites.length; k++) {
            var contains = isIn(allSites[k], allCurrentSites);
            if (!contains) {
                siteCollection.addActiveSite(allSites[k]);
            }
        }
        
        function isIn(item, list) {
            for (j = 0; j < list.length; j++) {
                if (item.site === list[j].name() && item.url === list[j].url() && item.image === list[j].image()) {
                    return true;
                }
            }
            
            return false;
        };
        
    }
    
    // Width and margin of each site element
    var SITE_WIDTH = 160;
    var SITE_MARGIN = 10;
};

NextTab.StorageManager = function() {
    
    // A site collection object representing the sites in memeory.
    var siteCollection;
    
    // The function to be called once initial storage retrieval is done.
    var callbackFunction;
    
    /*
    * Initializes object data and begins storage retrieval.
    * @param siteCollectionObj
    * @param callback
    */
    this.create = function(siteCollectionObj, callback) {
        //Uncomment to reset everything (for development purposes)
        //chrome.storage.sync.clear();
        
        callbackFunction = callback;
        siteCollection = siteCollectionObj;
        
        chrome.storage.sync.get(null, getStorage);
        
    };
    
    /*
    * Updates storage with the two given arrays.
    * @param activeSites
    * @param inactiveSites
    */
    this.updateStorage = function(activeSites, inactiveSites) {
      setStorage(activeSites, inactiveSites);  
    };
    
    /*
    * Gets the contents of storage. Initializes storage with all sites if storage is empty.
    * @param items
    */
    function getStorage(items) {
        // If this is the first time the extension has been enabled since being installed
      
        if (items.activeSites === undefined) {
            setStorage(siteCollection.allSites(), []);
            chrome.storage.sync.get(null, getStorage);
        }
        else {
            
            siteCollection.loadActiveSites(items.activeSites);
            siteCollection.loadInactiveSites(items.inactiveSites);
            
            callbackFunction();
        }
    };
    
    /*
    * Stores the two given arrays.
    * @param activeSites
    * @param inactiveSites
    */
    function setStorage(activeSites, inactiveSites) {
        
        var obj = {"activeSites": activeSites};
        
        if (activeSites) {
            chrome.storage.sync.remove("activeSites");
            chrome.storage.sync.set(obj);
        }
        
        obj = {"inactiveSites": inactiveSites};
        
        if (inactiveSites) {
            chrome.storage.sync.remove("inactiveSites");
            chrome.storage.sync.set(obj);
        }
    };
}

NextTab.SiteCollection = function() {
    
    // Array of site objects for active (visible) sites
    var activeSites = [];
    
    // Array of site objects for inactive (hidden) sites
    var inactiveSites = [];
    
    // True if the sites are being edited, false otherwise
    var editState = false;
    
    /*
    * Creates a site object for each object in the given array.
    * Stores each object in as active sites.
    * @param storageActiveSites
    */
    this.loadActiveSites = function(storageActiveSites) {
        var parent = document.getElementsByClassName("sites")[0];
        while(parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        
        for (i = 0; i < storageActiveSites.length; i++) {
            var obj = storageActiveSites[i];
            var site = new NextTab.Site();
            site.create(obj.site, obj.url, obj.image, true);
            activeSites[i] = site;
        }
        
        appendSitesTo(document.getElementsByClassName("sites")[0]);
    };
    
    /*
    * Adds a single site to the collection as an active site.
    */
    this.addActiveSite = function(obj) {
        var site = new NextTab.Site();
        site.create(obj.site, obj.url, obj.image, true);
        activeSites.push(site);
        document.getElementsByClassName("sites")[0].appendChild(site.element());; 
    }
    
    /*
    * Creates a site object for each object in the given array.
    * Stores each object in as inactive sites.
    * @param storageInactiveSites
    */
    this.loadInactiveSites = function(storageInactiveSites) {
        for (i = 0; i < storageInactiveSites.length; i++) {
            var obj = storageInactiveSites[i];
            var site = new NextTab.Site();
            site.create(obj.site, obj.url, obj.image, false);
            inactiveSites[i] = site;
        }
    };
    
    /*
    * Returns an array of objects, with the data of the active site objects.
    */
    this.activeSitesObjects = function() {
        activeSitesObjects = [];
        
        for (i = 0; i < activeSites.length; i++) {
            var site = activeSites[i];
            var obj = {site: site.name(), url: site.url(), image: site.image()};
            activeSitesObjects.push(obj);
        }
        
        return activeSitesObjects;
    };
    
    /*
    * Returns an array of objects, with the data of the inactive site objects.
    */
    this.inactiveSitesObjects = function() {
        inactiveSitesObjects = [];
        
        for (i = 0; i < inactiveSites.length; i++) {
            var site = inactiveSites[i];
            var obj = {site: site.name(), url: site.url(), image: site.image()};
            inactiveSitesObjects.push(obj);
        }
        
        return inactiveSitesObjects;
    };
    
    /*
    * Returns an array of the active site objects.
    */
    this.activeSites = function() {
        return activeSites;
    }
    
    /*
    * Returns an array of the inactive site objects.
    */
    this.inactiveSites = function() {
        return inactiveSites;
    }
    
    /*
    * Puts each site object in the collection into the edit state.
    * @param parent
    */
    this.editState = function(parent) {
        
        if (!editState) {
            for (i = 0; i < activeSites.length; i++) {
                activeSites[i].element().parentElement.removeChild(activeSites[i].element());
                activeSites[i].editState(siteEditEvent);
                parent.appendChild(activeSites[i].element());
            }
            
            for (i = 0; i < inactiveSites.length; i++) {
                inactiveSites[i].editState(siteEditEvent);
                parent.appendChild(inactiveSites[i].element());
            }
            
            editState = true;
        }
    };
    
    /*
    * Puts each site object in the collection into the view state.
    * @param parent
    */
    this.viewState = function(parent) {
        if (editState) {
            // Get all of the site elements and reset the site object lists
            var children = parent.childNodes;
            activeSites = [];
            inactiveSites = [];
            
            // For each site element, create a representative site object in the view state
            for (i=0; i < children.length; i++) {
                var site = new NextTab.Site();
                var isActive = false;
                if (children[i].getAttribute("active") === "true") {
                    isActive = true;
                }
                site.create(children[i].getAttribute("name"), children[i].getAttribute("url"), children[i].getAttribute("image"), isActive);
                site.viewState();
                
                // Push that site to active or inactive
                if (children[i].getAttribute("active") === "true") {
                    activeSites.push(site);
                }
                else {
                    console.log(children[i]);
                    inactiveSites.push(site);
                }
            }
            
            // Remove all site elements
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
            
            // Add back the ones from the update active site object array
            for (i = 0; i < activeSites.length; i++) {
                //activeSites[i].viewState();
                parent.appendChild(activeSites[i].element());
            }
            
            editState = false;
        }
        
        console.log(activeSites);
        console.log(inactiveSites);
};
    
    /*
    * Returns all possible sites (active or inactive).
    */
    this.allSites = function() {
        return allSites;
    };
    
    /*
    * Called when a site is edited. (Plus/minus is clicked)
    */
    function siteEditEvent(site) {
        var siteActive = site.active();
        if (siteActive === true) {
            moveToInactive(site);
            site.setActive(false);
        }
        else {
            moveToActive(site);
            site.setActive(true);
        }
    };
    
    /*
    * Moves the given site object from the inactive array to the active array.
    * @param site
    */
    function moveToInactive(site) {
        var parent = site.element().parentNode;
        parent.removeChild(site.element());
        parent.appendChild(site.element());
        
        var found = false;
        var i = 0;
        while (!found) {
            if (activeSites[i] === site) {
                activeSites.splice(i, 1);
                inactiveSites.push(site);
                found = true;
            }
            i++;
        }
    };
    
    /*
    * Moves the given site object from the active array to the inactive array.
    * @param site
    */
    function moveToActive(site) {
        var found = false;
        var i = 0;
        while (!found) {
            if (inactiveSites[i] === site) {
                inactiveSites.splice(i, 1);
                activeSites.push(site);
                found = true;
            }
            i++;
        };
    };
    
    /*
    * Appends all site objects' elements to given parent element.
    * @param parent
    */
    function appendSitesTo(parent) {
        for (i = 0; i < activeSites.length; i++) {
            parent.appendChild(activeSites[i].element());
        }
    };
    
    // All of the built-in sites.
    var allSites = [{site: "google", url: "http://www.google.com", image: "/images/sites/google.png"},
                    {site: "facebook", url: "http://www.facebook.com", image: "/images/sites/facebook.png"},
                    {site: "twitter", url: "http://www.twitter.com", image: "/images/sites/twitter.png"},
                    {site: "amazon", url: "http://www.amazon.com", image: "/images/sites/amazon.png"},
                    {site: "wikipedia", url: "http://www.wikipedia.com", image: "/images/sites/wikipedia.png"},
                    
                    {site: "youtube", url: "http://www.youtube.com", image: "/images/sites/youtube.png"},
                    {site: "gmail", url: "http://mail.google.com/", image: "/images/sites/gmail.png"},
                    {site: "google maps", url: "http://maps.google.com/", image: "/images/sites/maps.png"},
                    
                    {site: "yahoo", url: "http://www.yahoo.com", image: "/images/sites/yahoo.png"},
                    {site: "bing", url: "http://www.bing.com", image: "/images/sites/bing.png"},
                    
                    {site: "reddit", url: "http://www.reddit.com", image: "/images/sites/reddit.png"},
                    {site: "instagram", url: "http://www.instagram.com", image: "/images/sites/instagram.png"},
                    {site: "pinterest", url: "http://www.pinterest.com", image: "/images/sites/pinterest.png"},
                    {site: "tumblr", url: "http://www.tumblr.com", image: "/images/sites/tumblr.png"},
                    
                    {site: "netflix", url: "http://www.netflix.com", image: "/images/sites/netflix.png"},
                    {site: "hulu", url: "http://www.hulu.com/", image: "/images/sites/hulu.png"},
                    
                    {site: "fitbit", url: "http://www.fitbit.com/", image: "/images/sites/fitbit.png"},
                    {site: "quizlet", url: "http://www.quizlet.com/", image: "/images/sites/quizlet.png"},
                    {site: "vimeo", url: "http://www.vimeo.com/", image: "/images/sites/vimeo.png"},
                    
                    {site: "tripadvisor", url: "http://www.tripadvisor.com/", image: "/images/sites/tripadvisor.png"},
                    {site: "kayak", url: "http://www.kayak.com/", image: "/images/sites/kayak.png"},
                    {site: "airbnb", url: "http://www.airbnb.com/", image: "/images/sites/airbnb.png"},
                    {site: "yelp", url: "https://www.yelp.com/", image: "/images/sites/yelp.png"},
                    
                    {site: "ebay", url: "http://www.ebay.com", image: "/images/sites/ebay.png"},
                    {site: "craigslist", url: "http://www.craigslist.com", image: "/images/sites/craigslist.png"},
                    {site: "paypal", url: "http://www.paypal.com/", image: "/images/sites/paypal.png"},
                    {site: "walmart", url: "https://www.walmart.com/", image: "/images/sites/walmart.png"},
                    {site: "target", url: "https://www.target.com/", image: "/images/sites/target.png"},
                    {site: "wayfair", url: "https://www.wayfair.com/", image: "/images/sites/wayfair.png"},
                    {site: "bestbuy", url: "http://www.bestbuy.com/", image: "/images/sites/bestbuy.png"},
                    {site: "home depot", url: "http://www.homedepot.com/", image: "/images/sites/homedepot.png"},
                    
                    {site: "cnn", url: "http://www.cnn.com", image: "/images/sites/cnn.png"},
                    {site: "msn", url: "https://www.msn.com/", image: "/images/sites/msn.png"},
                    {site: "foxnews", url: "http://www.foxnews.com/", image: "/images/sites/foxnews.png"},
                    {site: "bbc", url: "http://www.bbc.com/", image: "/images/sites/bbc.png"},
                    {site: "buzzfeed", url: "http://www.buzzfeed.com/", image: "/images/sites/buzzfeed.png"},
                    
                    {site: "new york times", url: "http://www.nytimes.com/", image: "/images/sites/newyorktimes.png"},
                    {site: "huffington post", url: "https://www.huffingtonpost.com/", image: "/images/sites/huffington.png"},
                    {site: "washington post", url: "https://www.washingtonpost.com/", image: "/images/sites/washingtonpost.png"},
                    {site: "forbes", url: "http://www.forbes.com/", image: "/images/sites/forbes.png"},
                    {site: "daily mail", url: "http://www.dailymail.com/", image: "/images/sites/dailymail.png"},
                    {site: "wall street journal", url: "http://www.wallstreetjournal.com/", image: "/images/sites/wallstreetjournal.png"},
                    {site: "business insider", url: "http://www.businessinsider.com/", image: "/images/sites/businessinsider.png"},
                    
                    {site: "espn", url: "http://www.espn.com", image: "/images/sites/espn.png"},
                    {site: "nfl", url: "https://www.nfl.com/", image: "/images/sites/nfl.png"},
                    
                    {site: "weather channel", url: "https://www.weather.com/", image: "/images/sites/weatherchannel.png"},
                    {site: "weather underground", url: "https://www.wunderground.com/", image: "/images/sites/weatherunderground.png"},
                    
                    {site: "linkedin", url: "http://www.linkedin.com", image: "/images/sites/linkedin.png"},
                    {site: "zillow", url: "https://www.zillow.com/", image: "/images/sites/zillow.png"},
                    {site: "etsy", url: "https://www.etsy.com/", image: "/images/sites/etsy.png"},
                    {site: "imgur", url: "http://www.imgur.com", image: "/images/sites/imgur.png"},
                    {site: "blogspot", url: "http://www.blogspot.com/", image: "/images/sites/blogspot.png"},
                    {site: "wordpress", url: "https://www.wordpress.com/", image: "/images/sites/wordpress.png"},
                    {site: "imdb", url: "http://www.imdb.com/", image: "/images/sites/imdb.png"},
                    {site: "wikia", url: "https://www.wikia.com/", image: "/images/sites/wikia.png"},
                    {site: "sales force", url: "https://www.salesforce.com/", image: "/images/sites/salesforce.png"},
                    {site: "quora", url: "https://www.quora.com/", image: "/images/sites/quora.png"},
                    
                    {site: "apple", url: "http://www.apple.com/", image: "/images/sites/apple.png"},
                    {site: "microsoft", url: "https://www.microsoft.com/", image: "/images/sites/microsoft.png"},
                    {site: "adobe", url: "https://www.adobe.com/", image: "/images/sites/adobe.png"},
                    
                    {site: "chase", url: "http://www.chase.com", image: "/images/sites/chase.png"},
                    {site: "bank of america", url: "https://www.bankofamerica.com/", image: "/images/sites/bankofamerica.png"},
                    {site: "wells fargo", url: "https://www.wellsfargo.com/", image: "/images/sites/wellsfargo.png"},
                    {site: "discover", url: "http://www.discover.com/", image: "/images/sites/discover.png"},
                    {site: "capitalone", url: "http://www.capitalone.com/", image: "/images/sites/capitalone.png"},
                    {site: "americanexpress", url: "http://www.americanexpress.com/", image: "/images/sites/amex.png"},
                    {site: "intuit", url: "http://www.intuit.com/", image: "/images/sites/intuit.png"},
                    
                    {site: "spotify", url: "http://www.spotify.com/", image: "/images/sites/spotify.png"},
                    {site: "pandora", url: "http://www.pandora.com/", image: "/images/sites/pandora.png"},
                    {site: "sound cloud", url: "http://www.soundcloud.com/", image: "/images/sites/soundcloud.png"},
                    {site: "twitch", url: "http://www.twitch.com/", image: "/images/sites/twitch.png"},
                    {site: "deviantart", url: "http://www.deviantart.com/", image: "/images/sites/deviantart.png"},
                    
                    {site: "github", url: "https://www.github.com/", image: "/images/sites/github.png"},
                    {site: "stack overflow", url: "https://www.stackoverflow.com/", image: "/images/sites/stackoverflow.png"},
                    {site: "godaddy", url: "https://www.godaddy.com/", image: "/images/sites/godaddy.png"},
                    
                    {site: "xfinity", url: "http://www.xfinity.com/", image: "/images/sites/xfinity.png"},
                    {site: "att", url: "http://www.att.com/", image: "/images/sites/att.png"},
                    
                    {site: "walt disney world", url: "https://disneyworld.disney.go.com/", image: "/images/sites/waltdisneyworld.png"},
                    {site: "disneyland", url: "https://disneyland.disney.go.com/", image: "/images/sites/disneyland.png"},
                    
                    {site: "aol", url: "https://www.aol.com/", image: "/images/sites/aol.png"},
                    
                    {site: "google drive", url: "http://drive.google.com/", image: "/images/sites/drive.png"},
                    {site: "google photos", url: "http://photos.google.com/", image: "/images/sites/googlephotos.png"},
                    {site: "google hangouts", url: "http://www.google.com/hangouts", image: "/images/sites/hangouts.png"},
                    {site: "google news", url: "http://www.google.com/news", image: "/images/sites/googlenews.png"},
                    {site: "google translate", url: "http://www.google.com/translate", image: "/images/sites/googletranslate.png"},
                    {site: "google docs", url: "http://www.google.com/docs", image: "/images/sites/googledocs.png"},
                    {site: "google sheets", url: "http://www.google.com/sheets", image: "/images/sites/googlesheets.png"},
                    {site: "google slides", url: "http://www.google.com/slides", image: "/images/sites/googleslides.png"},
                    {site: "google contacts", url: "http://www.google.com/contacts", image: "/images/sites/googlecontacts.png"},
                    {site: "google calendar", url: "http://www.google.com/calendar", image: "/images/sites/googlecal.png"}
                   ];

};

NextTab.Site = function() {
    
    // This object
    var _this = this;
    
    // The element of the object
    var element;

    // The name of the site
    var name;
    
    // The URL of the site
    var url;
    
    // The path to the image for the site
    var imageURL;
    
    // True if the site should be show, false if it should be hidden.
    var active = true;
    
    // True if the site is being edited, false if it is being viewed.
    var editState = false;
    
    /*
    * Creates a new site object from the given name, url, image path, and active status.
    * @param siteName
    * @param siteURL
    * @param siteImageURL
    * @param isActive
    */
    this.create = function(siteName, siteURL, siteImageURL, isActive) {
        
        name = siteName;
        url = siteURL;
        imageURL = siteImageURL;
        active = isActive;
        
        element = document.createElement("a");
        element.setAttribute("href", url);
        element.setAttribute("name", name);
        
        divElement = document.createElement("div");
        divElement.className = "site";
        divElement.style.background = "url(" + imageURL + ")";
        divElement.style.backgroundSize = "contain";
        // Set the attributes of the div
        divElement.setAttribute("name", name);
        divElement.setAttribute("url", url);
        divElement.setAttribute("image", imageURL);
        divElement.setAttribute("active", active);
        
        element.appendChild(divElement);
        
        return element;
    };
    
    /*
    * Returns the element associated with the object.
    */
    this.element = function() {
        return element;
    };
    
    /*
    * Puts the site into a viewing state.
    */
    this.viewState = function() {
        if (editState) {
            editElement = element.childNodes[0];
            element.removeChild(editElement);
            
            anchorElement = document.createElement("a");
            anchorElement.setAttribute("href", url);
            anchorElement.setAttribute("name", name);
            
            anchorElement.appendChild(element);
            
            element = anchorElement;
            
            editState = false;
        }
    };
    
    /*
    * Puts the site into an editing state.
    */
    this.editState = function(callback) {
        if (!editState) {
            // Remove anchor span
            element = element.childNodes[0];
            
            // Set the attributes of the div
            element.setAttribute("name", name);
            element.setAttribute("url", url);
            element.setAttribute("image", imageURL);
            element.setAttribute("active", active);
            
            // Create plus/minus edit button
            var editElement = document.createElement("div");
            editElement.className = "edit";
            editElement.setAttribute("active", active);
            editElement.addEventListener("click", editClick);
            element.appendChild(editElement);            
            
            // The site is in the edit state
            editState = true;
        }
        
        /**
        * Called when the plus/minus button is clicked (when a site is edited)
        */
        function editClick(event) {
            callback(_this);
        };
    };
    
    /*
    * Returns the active status of the site.
    */
    this.active = function() {
        return active;
    };
    
    /*
    * Sets the active status of the site.
    * @param isActive
    */
    this.setActive = function(isActive) {
        active = isActive;
        element.setAttribute("active", active);
        event.target.setAttribute("active", "" + active);
    };
    
    /*
    * Returns the name of the site.
    */
    this.name = function() {
        return name;
    };
    
    /*
    * Returns the url of the site.
    */
    this.url = function() {
        return url;
    };
    
    /*
    * Returns the image path of the site.
    */
    this.image = function() {
        return imageURL;
    };

};