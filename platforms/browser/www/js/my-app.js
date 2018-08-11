var myApp = new Framework7({
    pushState: true,
    swipePanel: 'left',
	//fastClicks: false,
	onAjaxStart: function (xhr) {
        myApp.showIndicator();
    },
    onAjaxComplete: function (xhr) {
        myApp.hideIndicator();
    }
});

var oldOldIp = "http://52.59.238.139:3001";
var oldIp = "http://35.158.214.37:3001";
var ip = "http://54.93.95.92:3001";


var counter = 0;
var firstVid = "";
var player = null;
var data_o;
var isFullScreenState = false;
var versionx = "1.0.3";
var playerIsSetup = false;
var gState = 0;
var oldElement = null;
var oldTextElement = null;
var ticketData = "";
var gTicketData = {};
var conversationStarted = false;
var myMessages;




var flagClearClicked = false;
var eventNameForFocus = "focus";

/*
a	b	c	ç	d	e	f	g	ğ	h	ı	i	j	k	l	m	n	o	ö	p	r	s	ş	t	u	ü	v	y	z
A	B	C	Ç	D	E	F	G	Ğ	H	I	İ	J	K	L	M	N	O	Ö	P	R	S	Ş	T	U	Ü	V	Y	Z
*/

var messages = {
	//"problem": 		 "Youtube-Playersinin hatali olmasi nedeniyle. Playernin siyah ekran olma ihtimali var",
	"problem": 		 "Uygulama takılırsa, lütfen uygulamayı yeniden başlatın ve hata bildirimi yapınız.",
	"newVer":  		 "Yeni güncelleme mevcut",
	"noInternet": 	 "İnternet bağlantınız yok. Devam etmek için lütfen İnternet bağlantınızın olduğundan emin olun.",
	"serverProblem": "Sunucuda sorun var. Lütfen sonra birdaha deneyin.",
	"thanks": 		 "Teşekkür Ederiz"
};

var categories = {
	"sahsiyet": "Şahsiyet Düşünce Ve İfade Üzerine",
	"dünya": "Dünya Fikir Sanat Ve Edebiyat Tarihi"
	/*
	"edebiyat": "Edebiyat",
	"düsünce": "Düşünce ve İfade",
	"yaratilis": "Yaratılış ve Kişilik"*/
};

var $$ = Dom7;
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
	domCache: true
});

//try to implement js fix for input/text area and mobile screen keyboard
    //use class or element name

myApp.onPageInit('about', function (page) {
	
	$$.ajax({
		type: 'GET',
		url: ip + "/api/getProblem?id=" + device.uuid,
		success: function (data) {
			ticketData = JSON.parse(data);
			gTicketData = ticketData;
			
			var markup_o = '<div class="list-block"><ul>'
			for(var key_s in ticketData)
			{
				/*gTicketData[key_s] = {}
				gTicketData[key_s]['messages'] = []
				gTicketData[key_s]['messages'] = testData;*/
				markup_o += ''
				+'      <li>'
				+'         <a class="startChat item-link">'
				//+'         <a class="startChat ' + key_s + '" onclick="sibtestfunc(' + testData + '])" class="item-link">'
				+'            <div class="item-content">'
				+'               <div class="item-media"><i class="icon">' + (parseInt(key_s) + 1) + '</i></div>'
				+'               <div id="'+key_s+'" class="item-inner">'
				+'                  <div id="'+key_s+'" class="item-title">' + ticketData[key_s].problem + '</div>'
				+'               </div>'
				+'            </div>'
				+'         </a>'
				+'      </li>';
				
			}
			markup_o += '</ul></div>'
			$$('#idTickets').html(markup_o);


			
			console.log(data);
	  }});
	
	myApp.closePanel();
				
				// Init Messages
	myMessages = myApp.messages('.messages', {
	  autoLayout:true
	});	
	
	$$(document).on('click', '.startChat', function (data) {
		id = $$(data.target).attr('id');
		console.log(data.target);
		console.log(data.target);
		sibtestfunc(id);
		
	});
	
	$$('#idVer').html("App Version: " + versionx);
	// HTML About: Report Problem
	$$('.form-to-data').on('click', function(){
	  var xname = $$("#formName").val();
	  var problem = $$("#formText").val();
	  //$$.get( ip + "/api/postProblem?name=" + xname + "&problem=" + problem + "&os=" + device.platform + "&ver=" + versionx + "&manu=" + device.manufacturer + "&model=" + device.model);
	  var oldRegId = localStorage.getItem('registrationId');	  
	  
	  
	  $$.ajax({
		type: 'GET',
		url: ip + "/api/postProblem?name=" + xname + "&problem=" + problem + "&os=" + device.platform + "&id=" + device.uuid + "&ver=" + versionx + "&manu=" + device.manufacturer + "&model=" + device.model + "&pushId=" + oldRegId,
		success: function (data) {
			ticketData = data;
			console.log(data);
			alert(messages.thanks);
	  }});

	mainView.router.back();
	});
});

$$(document).on('deviceready', function() {
	
	$$.ajaxSetup({'timeout': 3000});
	Keyboard.shrinkView(true);
	Keyboard.hideFormAccessoryBar(true);
	initialize();
});

/*
$$('body').click(function() {
	if ($$('body').hasClass('with-panel-left-cover') || $$('body').hasClass('with-panel-left-reveal')) 
		myApp.closePanel();
});
*/

7
       // eventNameForFocus = "touchstart focus";
/*
    if(Framework7.prototype.device.ios) {
    }
*/
$$(document).on("focus",".kbdfix", function(e){
//$$(document).on(eventNameForFocus,".kbdfix", function(e){
	console.log("WORKED");
	flagClearClicked = false;
	var el = $$(e.target);
	var page = el.closest(".page-content");
	if(page.length == 0)
		page = $$(".messages-content");
	console.log(page);

	var elTop = el.offset().top;
	//do correction if input at near or below middle of screen
	if(elTop > page.height() / 2 - 20 ){
		var delta = page.offset().top +  elTop - $$(".statusbar-overlay").height() * (Framework7.prototype.device.ios?2:1) - $$(".navbar").height(); //minus navbar height?&quest;? 56 fot MD 
		var kbdfix = page.find("#keyboard-fix");
		if(kbdfix.length == 0) { //create kbdfix element
			page.append("<div id='keyboard-fix'></div>");
		}

		$$("#keyboard-fix").css("height", delta * 2 + "px");
		page.scrollTop( delta, 300);
		//try to return caret to input field
		//dirty hack ios flying caret
		if(Framework7.prototype.device.ios) {
			setTimeout(function () {

				var temp = $$(el).val();
				if(temp !=="") {
					$$(el).val("");
					$$(el).val(temp);
				} else {
					$$(el).val(" ");
					$$(el).val("");
				}
				el.focus();
				//el[0].select(); // apply focus or select to return caret to input field
			}, 700); //set by experemtal on iPod
		}

		e.preventDefault();
		e.stopImmediatePropagation();
	}

}, true);

$$(document).on("blur",".kbdfix", function(e){
//call this code in the Back button handler - when it fired for keyboard hidding.
//$$(document).on("blur",".kbdfix", function(e){
	//console.log("blur");
	//reduce all fixes
	if(!flagClearClicked) {
		setTimeout(function() {
			$$("#keyboard-fix").css("height", "0px");
			flagClearClicked = false;
		},400);

	}

}, true);


function sibtestfunc(ticketId)
{
	var data = gTicketData[ticketId]
	//console.log(data);
	/*var newPageContent = '<div class="page toolbar-fixed"><div class="toolbar-inner"><textarea placeholder="Message" class=""></textarea><a href="#" class="link">Send</a>'
	+'<div class="page-content messages-content">'
	+'<div class="messages">'*/
	
	var newPageContent = '<div class="page toolbar-fixed"><div class="toolbar messagebar" style="height: 44px;">  <div class="toolbar-inner"> <textarea id="idMessageText" placeholder="Message" class=""></textarea><a href="#" class="link">Send</a> </div></div> <div class="page-content messages-content" style="padding-bottom: 44px !important;"> <div class="messages messages-auto-layout">'
  //var newPageContent = '<div data-page="home" class="page toolbar-fixed"> <div class="navbar"> <div class="navbar-inner"> <div class="left"> </div> <div class="center" style="left: 0px;">Messages</div> <div class="right"> </div> </div> </div> <div class="toolbar messagebar" style=""> <div class="toolbar-inner"> <textarea placeholder="Message" class=""></textarea><a href="#" class="link">Send</a> </div> </div> <div class="page-content messages-content"> <div class="messages messages-auto-layout">'
  
	for(var key_s in data['messages'])
		if(data['messages'][key_s]['isClient'])
			newPageContent += '<div class="message message-sent"><div class="message-text">'+ data["messages"][key_s]["msg"]+ '</div></div>';
		else 
			newPageContent += '<div class="message message-received"><div class="message-text">'+ data["messages"][key_s]["msg"]+ '</div></div>';
		
 
    newPageContent += '</div></div></div>';
	//newPageContent +='<div class="toolbar messagebar" style=""></div>';
	//console.log(newPageContent);
 //52.59.238.139
//Load new content as new page
	mainView.router.loadContent(newPageContent);
	myMessages = myApp.messages('.messages', {
	  autoLayout:true,
	  scrollMessages: true
	});
	      // Init Messagebar
      var myMessagebar = myApp.messagebar('.messagebar');
      var messageText = "";
      // Handle message
	  
	  
		
	  $$('#idMessageText').on('click', function() {
		  setTimeout(function() {
			  
		$$('#idMessageText').scrollTop($$('#idMessageText').offset().top, 500);
		$$('body').scrollTop($$('#idMessageText').offset().top, 500);
		}, 1000);
	  });
      $$('.messagebar .link').on('click', function () {
        // Message text
        messageText = myMessagebar.value().trim();
        // Exit if empy message
        if (messageText.length === 0) return;
        
        // Empty messagebar
        myMessagebar.clear()
        
        // Random message type
        //var messageType = (['sent', 'received'])[Math.round(Math.random())];
        var messageType = 'sent'
      
        // Avatar and name for received message
        var avatar, name;
        if(messageType === 'received') {
          avatar = 'https://github.com/TehEbil/KademVakfi/blob/master/www/person.png?raw=true';
          name = 'Cycrosoft';
        }
        // Add message
        myMessages.addMessage({
          // Message text
          text: messageText,
          // Random message type
          type: messageType,
          // Avatar and name:
          avatar: avatar,
          name: name,
          // Day
          day: !conversationStarted ? 'Today' : false,
          time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
        })
		//console.log(gTicketData[ticketId])
        gTicketData[ticketId]['messages'].push({isClient: true, msg: messageText})
		//console.log(gTicketData[ticketId])
		  $$.ajax({
			type: 'GET',
			url: ip + "/api/postAnswer?id=" + device.uuid + "&answer=" + messageText + "&ticketId=" + ticketId,
			success: function (data) {
				console.log(data);
		  }});
        // Update conversation flag
        conversationStarted = true;
      }); 
	  
}

function initialize()
{	
	//console.log(device.version); 
	if(!localStorage.getItem('firstTime'))
	{
		localStorage.setItem('firstTime', true);
		alert(messages["problem"]);
	}
	
	if(!checkConnection())
	{
		alert(messages.noInternet);
		document.addEventListener("online", delayedIntialize, true);
	}
	else
	{
		SetupJSAPI();
		getVideoData();
	}
	SetupFullscreen();
	
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("menubutton", onMenuKeyDown, false);
	
   myApp.push = PushNotification.init({
		"android": {
			"senderID": "492870102848"
		},
		"ios": {
		  "sound": true,
		  "vibration": true,
		  "badge": true
		},
		"windows": {}
	});

   myApp.push.on('registration', function(data) {
	   var oldRegId = localStorage.getItem('registrationId');
	   if (oldRegId != data.registrationId) {
		   localStorage.setItem('registrationId', data.registrationId);
			$$.ajax({
				type: 'GET',
				url: ip + "/api/postId?id=" + data.registrationId + "&oldId=" + oldRegId + "&os=" + device.platform
			});
	   }
	    //$$.get( ip + "/api/postId?id=" + data.registrationId);
   });

   myApp.push.on('error', function(e) {
	   console.log("push error = " + e.message);
   });
    myApp.push.on('notification', function(data) {
		console.log('notification event');
		//alert(data.title + ": " + data.message);
		if(data.title == "Chat")
		{
			myMessages.addMessage({
			// Message text
				text: data.message,
				// Random message type
				type: 'received',
				// Avatar and name:
				avatar: 'https://github.com/TehEbil/KademVakfi/blob/master/www/person.png?raw=true',
				name: 'Cycrosoft',
				// Day
				day: !conversationStarted ? 'Today' : false,
				time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
			})
			conversationStarted = true;
		}
	});

	myApp.push.finish(function() {
		  console.log('successPUSH');
	  }, function() {
		  console.log('errorPUSH');
	  });
}

function SetupJSAPI()
{	
	var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	
	cordova.getAppVersion.getVersionNumber().then(function (version) {
		console.log("version:", version)
		console.log("version:", version)
		console.log("version:", version)
		versionx = version;
		
		
	$$('#idVer').html("App Version: " + versionx);
	console.log(versionx);

		$$.ajax({
			type: 'GET',
			url: ip + "/api/version/",
			success: function (data) {
				console.log(version, data)
				console.log(version, data)
				console.log(version, data)

				if(cmpVersions(version, data) < 0) {
					alert(messages.newVer);
				}
			}});
	});
	gState = 1;
}

function cmpVersions (a, b) {
    var i, diff;
    var regExStrip0 = /(\.0+)+$/;
    var segmentsA = a.replace(regExStrip0, '').split('.');
    var segmentsB = b.replace(regExStrip0, '').split('.');
    var l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if (diff) {
            return diff;
        }
    }
    return segmentsA.length - segmentsB.length;
}

function delayedIntialize()
{
	getVideoData();
	SetupJSAPI();
}

function onPause() {
	if(!playerIsSetup)
		return;
	
	if(player != null || player)
		player.pauseVideo();
}

function onResume()
{
	if(gState == 0)
	{
		SetupJSAPI();
		getVideoData();
	}
	else if (gState == 1)
	{	
		getVideoData();
		SetupPlayer();			// ?
	}
}

function onMenuKeyDown() {
	if(!playerIsSetup)
		return;
	
	if(player != null || player)
		player.pauseVideo();
}

function SetupFullscreen()
{ 
    var screenChange = "webkitfullscreenchange mozfullscreenchange fullscreenchange";
	
	screenChange.split(" ").forEach(function(e){
	
		document.addEventListener(e, function(e) {
			if (isFullScreenState = !isFullScreenState) {
				StatusBar.hide();
				console.log("FullScreen");
			} else {
				StatusBar.show();
				console.log("NotFullScreen");
			}
		});
	});
}
/*
function IsFullscreen2() {
	//alert(document.body.clientHeight + " " +  screen.height + "    !!   " + document.body.clientWidth + " " + screen.width)
	return document.body.clientHeight >= screen.height-30 && document.body.clientWidth == screen.width;
}

function IsFullscreen() {
	//alert(document.fullScreen  + " " +   document.webkitIsFullScreen  + " " +   document.mozFullScreen)
	return document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen;
}
*/
/*
function Titles()
{
	kob = "";
	for(var key_s in data_o)
	{
		for(var key2_s in data_o[key_s])
		{
			title = data_o[key_s][key2_s]['snippet']['title']
			kob += '	"' + title + '",\n'
		}
	}
}*/


$$('.toola').click(function(event) {
	// this.append wouldn't work
	/* console.log(event);
	console.log(this.childNodes[1].click());
	console.log($$(this).children()); */
	//$$(this).children('a')[0].click();
});

$$('.tool').on('click', function(event) {
	var found = $$(this).find('a');
	/*console.log(event);
	console.log(this);*/
	//console.log(($$(this).children()).click());
	//console.log(($$(this).children()).click());
	//console.log($$('.tool a').click());
	
	/*
	console.log($$(this).find('a').click())
	console.log($$(this).find('a').click())
	*/

	found.click();
	found.click();			// NEC???
});

function getVideos(pVideoTitle, pCategory, init=false)
{
	var markup_o = "";	
	
	/*console.log(data_o)
	console.log(data_o[pVideoTitle]);
	console.log(data_o[pVideoTitle][pCategory]);*/
	
	console.log(data_o);
	data_o2 = data_o[pVideoTitle][pCategory]
	var size = data_o2.length;

	
	for(var key_s in data_o2)
	{
		//console.log(data_o2)
		var dat = data_o2[key_s];
		//console.log(dat);
		var vidId = dat.videoId;
				//console.log("test2");
		if(firstVid == "")
			firstVid = vidId;
				//console.log("test2");
		var url = dat.img;
				//console.log("test2");
		var date = dat.date;
		var videoTitle = "UNDEFINED";
		if(dat.title != "")
			videoTitle = dat.title;
		markup_o += '<div class="clVideos" ><a id="onChangeVideoClick" onclick="ChangeVideo(\''+ vidId + '\');"><img border="0" class="lazy lazy-fadein" alt="111" src="' + url + '" width="100%" ></a><div class="clVideoX"><div id="idVideoText" class="clCounter">' + size-- + '</div><p class="clTitle">' + videoTitle + '</p><p id="idVideoDate" class="clDate">' + date + '</p></div></div>\n';
		//console.log("test2");
	}
	if(!init)
	{
		ChangeVideo(firstVid, true);
		firstVid = "";
	}
	$$("#idTest").html(markup_o);	
	return;
}

function ChangeVideoSite(pVideoTitle, pCategory) {
	console.log(pVideoTitle)
	console.log(pCategory)
	//console.log($$(event.target).attr('style','#test1'));
	if(oldElement != null)
		oldElement.removeClass("classASelected");
	if(oldTextElement != null)
		oldTextElement.removeClass("classATextSelected");
	oldElement = $$(event.target);
	
	console.log(oldElement);
	console.log(oldElement);
	
	if(oldElement.prop("tagName") == "A")
		oldElement = oldElement.parent();
	if(oldElement.prop("tagName") == "P")
		oldElement = oldElement.parent();
	oldElement.addClass("classASelected");
	var text = $$(oldElement).children()[0];
	oldTextElement = $$(text).children()[0];
	oldTextElement = $$(oldTextElement);
	oldTextElement.addClass("classATextSelected");
	
	//console.log($$(event.target).addClass("test1"));
	
	
	getVideos(pVideoTitle, pCategory);
}

function getVideoData()
{
	var markup_o = "";
	
	$$.ajax({
		type: 'GET',
		url: ip + '/api/ytlink/all',
		dataType: 'json',
		timeout: 10000,
		success: function (data) {
			data_o = data;
			//console.log(data);
			for(var key_s in data)
			{
				markup_o += '<div class="clHeader">' + categories[key_s] + '</div>';
				for(var key2_s in data[key_s])
					if(key_s == "sahsiyet" && key2_s == "2016-2017")
						markup_o += '<div id="sahsiyetId" class="close-panel classA classASelected" onclick="ChangeVideoSite(\''+ key_s + '\',\'' + key2_s + '\')"><p><a id="onUrlClickSahsiyet" class="close-panel classATextSelected">' + key2_s + '</a></p></div>';
					else
						markup_o += '<div class="close-panel classA" onclick="ChangeVideoSite(\''+ key_s + '\',\'' + key2_s + '\')"><p><a id="onUrlClick" class="close-panel">' + key2_s + '</a></p></div>';
				//markup_o += '<div class="classA"><p><a id="onUrlClick" class="close-panel" onclick="ChangeVideoSite(\''+ key_s + '\');">' + categories[key_s] + '</a></p></div>';
				//markup_o += '<p><a id="onUrlClick" class="close-panel" onclick="ChangeVideoSite(\''+ key_s + '\');">' + categories[key_s] + '</a></p>';
			}
			
			$$("#idSidebar").html(markup_o);
			oldElement = $$('#sahsiyetId');
			oldTextElement = $$('#onUrlClickSahsiyet');
			getVideos("sahsiyet", "2016-2017", true);
			//ChangeVideoSite("sahsiyet", true);
		}});

	return;
}

function onYouTubeIframeAPIReady() {
/*	if(counter <= 12 && (firstVid == null || firstVid == ""))
	{
		counter++;
		setTimeout(onYouTubeIframeAPIReady, 250);
		return;
	}
	if(counter >= 12)
	{
		$$("#idTest").html("<p>" + messages.serverProblem + "</p>");	
	}
	else
		*/
		SetupPlayer();
	
}

function onPlayerError(event) {
	//alert(event);
	alert("FEHLER: onPlayerError");
}

function SetupPlayer()
{
	if(player!=null)
		return;
	
	/*if(firstVid == "" || firstVid == null)
	{
		alert("NULL");
		firstVid = "4xkG4pPbIjg";
	}*/
	
	/*player = new YT.Player('player', {
		height: '250',
		width: '100%',
		color: 'white',
		//videoId: firstVid,
		playerVars: { fs:1, "showinfo": 0, "rel": 0 },
		events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
		}
	});*/
	
	
	
	var playerParams =
	{
		playerVars:
		{
			"modestbranding": 1,
			"fs" : 1,		  
			"enablejsapi": 1,
			"showinfo": 1,
			"rel": 0,
			"color": "red"
		},
		events:
		{
			"onReady":onPlayerReady,
			"onError":onPlayerError,
			"onStateChange":onPlayerStateChange
		},
		//videoId: firstVid,
		width: '100%'
	};
	player = new YT.Player("player",playerParams);
	
	/*
	player = new YT.Player('player', 
	{
		width: '100%',
		playerVars: {
		  "fs" : 1,		  
		  "enablejsapi": 1,
		  "origin": document.domain,
		  "modestbranding": 0,
		  "showinfo": 0,
		  "rel": 0,
		  "color": "red"
		},
		videoId: firstVid,
		events: {
		  'onReady': onPlayerReady,
		  'onStateChange': onPlayerStateChange,
		  'onError': onPlayerError
		}
	});*/
	
	
	//if(device.platform == "iOS")
	//	onPlayerReady(null);
	//firstVid = "";
	gState = 2;
	//$$('#player').attr("style", "height: 40vmax; margin: -10% 0 -3% 0; -webkit-clip-path: inset(10% 0px 3% 0px);");
	$$('#player').attr("style", "height: 35vmax; width: 100%");
	
}

function onPlayerReady(event) {
	/*console.log(event);
	console.log("readyevent")*/
  playerIsSetup = true;
  ChangeVideo(firstVid, true);
  firstVid = "";
  //alert(playerIsSetup);
}

function onPlayerStateChange(event)
{
	if (event.data == YT.PlayerState.BUFFERING) {
		//event.target.setPlaybackQuality('hd720');
	}
}

function ChangeVideo(vidId, pause=false)
{
	
	if(isFullScreenState)
		return;
	
	if(!playerIsSetup)
	{
		alert("FEHLER ChangeVideo, playerIsSetup is false")
		console.log(player);
	}
	$$('.page-content').scrollTop(0, 600);
	player.loadVideoById(vidId);
	
	if(pause)
		player.stopVideo(); 
	
	return false;
}

function checkConnection() {
	if(navigator.connection.type == Connection.NONE)
		return false;
	return true;
}