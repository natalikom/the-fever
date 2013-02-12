/*
    bieber.js
    An implementation of the BieberFeed project.
*/

// This code will be executed when the page finishes loading
window.addEventListener('load', function() {
    // Start requesting biebs
    gimmieMoreBiebs();
    // Start rendering biebs as soon as we have biebs to render
    renderNextTweet();
}, false);

/**
 * An array of tweets in chronological order.
 */
tweets = [];

/**
 * The current index of unrendered tweets
 */
renderIndex = 0;

/**
 * A hash from tweet ids to tweet objects.
 */
tweetidToTweet = {};

/**
 * Whether or not to request more biebs. (aka true)
 */
requestMoreBiebs = true;

/**
 * The rendering event loop.
 */
function renderNextTweet() {
    // We'll render 1 tweet, or as many as we are behind the limit of 25
    var biebsToRender = Math.max(tweets.length - renderIndex - 25, tweets.length - renderIndex == 0 ? 0 : 1);
    for( var i = 0; i < biebsToRender; i++ ) {
        renderTweet(tweets[renderIndex++]);
    }
    setTimeout(renderNextTweet, 1000);
}

function messageToHtml(tweetText) {
    var span = document.createElement("span");
    span.className = 'tweet-body';
    var textNode = document.createTextNode(tweetText);
    span.appendChild(textNode);
    return span;
}

/**
 * Renders a tweet
 */
function renderTweet(tweet) {
    var li = document.createElement("li");
    li.className = 'tweet';

    var profImg = document.createElement("img");
    profImg.src = tweet.user.profile_image_url;
    profImg.alt = tweet.user.screen_name + "'s profile image";
    profImg.width = "48";
    profImg.height = "48";
    li.appendChild(profImg);

    var screenNameText = document.createTextNode('@' + tweet.user.screen_name);
    var screenNameCont = document.createElement("a");
    screenNameCont.className = 'screen-name';
    screenNameCont.href = "http://twitter.com/" + tweet.user.screen_name;
    screenNameCont.target = "_blank";
    screenNameCont.appendChild(screenNameText);
    li.appendChild(screenNameCont);
    li.appendChild(messageToHtml(tweet.text));

    var clear = document.createElement("div");
    clear.className = 'clear';
    li.appendChild(clear);

    profImg.addEventListener("load", function(e) {
        var tweetsEl = document.getElementById("tweets");
        tweetsEl.insertBefore(li, tweetsEl.childNodes[0]);
        if( tweetsEl.childNodes.length > 100 ) {
            tweetsEl.removeChild(tweetsEl.childNodes[tweetsEl.childNodes.length-1]);
        }
    });
}

/**
 * Makes an ajax call requesting more biebs.
 */ 
function gimmieMoreBiebs() {
    req('http://bieber.mattpatenaude.com/feed/jbowens', biebProcessor);
}

/**
 * Adds the tweet to the list of tweets! Does nothing about
 * rendering (that's left to the rendering event loop).
 */
function addTweet(tweet) {
    tweet.rendered = false;
    tweetidToTweet[tweet.id] = tweet;
    tweets.push(tweet);
}

/**
 * Processes received biebs.
 */
function biebProcessor(req) {
    var biebs = JSON.parse(req.responseText);
   
    for( var i = 0; i < biebs.length; i++ ) {
        if( ! tweetidToTweet[biebs[i].id] ) {
            addTweet(biebs[i]);
        }
    }

    if( requestMoreBiebs ) {
        setTimeout(gimmieMoreBiebs, 20000);
    }
}

/**
 * Takes a url to GET request, and a function callback. Will
 * perform the get request asynchornously, calling callback on
 * success (status = OK). If the request ends with an http status
 * other than 200, the function will make an appropriate alert
 * message.
 */
function req(url, callback) {
    
    if( typeof callback != 'function' ) {
        alert("You bieber get a new programmer!");
        return;
    }

    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.addEventListener('load', function(e) {
        if( request.status == 200 ) {
            callback(request);
        } else {
            alert("no biebs 4 u (" + request.status + ")");
        }
    }, false);

    request.send(null);
}
