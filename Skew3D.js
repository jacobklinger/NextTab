Skew3D = function() {
    
    // Array of objects to apply effect to.
    var sites;
    
    /*
    * Adds the effect to the given list of site objects.
    * @param siteList
    */
    this.create = function(siteList) {
        sites = siteList;
        
        for(i = 0; i < sites.length; i++) {
            sites[i].element().childNodes[0].addEventListener("mousemove", move);
            sites[i].element().childNodes[0].addEventListener("mouseout", exit);
        }
    };
    
    /*
    * Removes the effect to the current list of site objects.
    * @param siteList
    */
    this.remove = function() {
        if(sites != undefined) {
            for(i = 0; i < sites.length; i++) {
                sites[i].element().removeEventListener("mousemove", move);
                sites[i].element().removeEventListener("mouseout", exit);
            }   
        }        
    };
    
    /*
    * Called when the mouse is moving over a site.
    * @param event
    */
    function move(event) {
        var site = event.target;
        site.style.transition = "transform .2s ease, box-shadow 0.2s ease";
        var mouseX = event.clientX;
        var mouseY = event.clientY;
        var siteBounds = site.getBoundingClientRect();
        var centerX = siteBounds.left + (siteBounds.width/2);
        var centerY = siteBounds.top + (siteBounds.height/2);
        var xOffset = mouseX - centerX;
        var yOffset = centerY - mouseY;
        var rotateX = yOffset / (siteBounds.height / 2) * 12;
        var rotateY = xOffset / (siteBounds.width / 2) * 12;
        var perspective = 320;
        site.style.transform = "scale(1.1) perspective(" + perspective + "px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
    };
    
    /*
    * Called when the mouse is exiting the bounds of a site.
    * @param event
    */
    function exit(event) {
        var site = event.target;
        site.style.transition = "transform 1s ease, box-shadow 1s ease";
        site.style.transform = "rotateX(0deg) rotateY(0deg)";
    };
};