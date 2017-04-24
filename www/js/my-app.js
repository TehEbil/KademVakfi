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

var ip = "http://52.59.238.139:3001";

var counter = 0;
var firstVid = "";
var player = null;
var data_o;
var isFullScreenState = false;
var versionx = "1.0.0";
var playerIsSetup = false;
var gState = 0;

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
	"sahsiyet": "Şahsiyet",
	"edebiyat": "Edebiyat",
	"dünya": "Dünya Fikir",
	"düsünce": "Düşünce ve İfade",
	"yaratilis": "Yaratılış ve Kişilik"
};

var $$ = Dom7;
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

$$(document).on('deviceready', function() {
	
	$$.ajaxSetup({'timeout': 3000});
	initialize();
});

/*
$$('body').click(function() {
	if ($$('body').hasClass('with-panel-left-cover') || $$('body').hasClass('with-panel-left-reveal')) 
		myApp.closePanel();
});
*/

myApp.onPageInit('about', function (page) {
	myApp.closePanel();
	
	$$('#idVer').html("App Version: " + versionx);
	// HTML About: Report Problem
	$$('.form-to-data').on('click', function(){
	  var xname = $$("#formName").val();
	  var problem = $$("#formText").val();
	  //$$.get( ip + "/api/postProblem?name=" + xname + "&problem=" + problem + "&os=" + device.platform + "&ver=" + versionx + "&manu=" + device.manufacturer + "&model=" + device.model);
	  
	  $$.ajax({
		type: 'GET',
		url: ip + "/api/postProblem?name=" + xname + "&problem=" + problem + "&os=" + device.platform + "&ver=" + versionx + "&manu=" + device.manufacturer + "&model=" + device.model,
		success: function (data) {
			alert(messages.thanks);
	  }});

	mainView.router.back();
	});
});


 

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
		versionx = version;
		
		
	$$('#idVer').html("App Version: " + versionx);
	console.log(versionx);

		$$.ajax({
			type: 'GET',
			url: ip + "/api/version/",
			success: function (data) {
				if(version < data) {
					alert(messages.newVer);
				}
			}});
	});
	gState = 1;
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
	console.log(event);
	console.log(this.childNodes[1].click());
	console.log($$(this).children());
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
	found.click();
});

function getVideos(pVideoTitle, init=false)
{
	var markup_o = "";	
	var size = data_o[pVideoTitle].length;
	
	for(var key_s in data_o[pVideoTitle])
	{
		var dat = data_o[pVideoTitle][key_s];
		var vidId = dat.videoId;
		
		if(firstVid == "")
			firstVid = vidId;
		
		var url = dat.img;
		
		var date = dat.date;
		var videoTitle = "UNDEFINED";
		if(dat.title != "")
			videoTitle = dat.title;
		
		markup_o += '<div class="clVideos" ><a id="onChangeVideoClick" onclick="ChangeVideo(\''+ vidId + '\');"><img border="0" class="lazy lazy-fadein" alt="111" src="' + url + '" width="100%" ></a><div class="clVideoX"><div id="idVideoText" class="clCounter">' + size-- + '</div><p class="clTitle">' + videoTitle + '</p><p id="idVideoDate" class="clDate">' + date + '</p></div></div>\n';
	}
	
	if(!init)
	{
		ChangeVideo(firstVid, true);
		firstVid = "";
	}
	$$("#idTest").html(markup_o);	
	return;
}

function ChangeVideoSite(pVideoTitle) {
	getVideos(pVideoTitle);
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
			for(var key_s in data)
				markup_o += '<div class="close-panel classA" onclick="ChangeVideoSite(\''+ key_s + '\')"><p><a id="onUrlClick" class="close-panel" onclick="ChangeVideoSite(\''+ key_s + '\');">' + categories[key_s] + '</a></p></div>';
				//markup_o += '<div class="classA"><p><a id="onUrlClick" class="close-panel" onclick="ChangeVideoSite(\''+ key_s + '\');">' + categories[key_s] + '</a></p></div>';
				//markup_o += '<p><a id="onUrlClick" class="close-panel" onclick="ChangeVideoSite(\''+ key_s + '\');">' + categories[key_s] + '</a></p>';

			$$("#idSidebar").html(markup_o);
			getVideos("sahsiyet", true);
		}});

	return;
}

function onYouTubeIframeAPIReady() {
	if(counter <= 12 && (firstVid == null || firstVid == ""))
	{
		setTimeout(onYouTubeIframeAPIReady, 250);
		counter++;
		return;
	}
	if(counter >= 12)
	{
		$$("#idTest").html("<p>" + messages.serverProblem + "</p>");	
	}
	else
		SetupPlayer();
	
}

function onPlayerError(event) {
	alert(event);
	alert("FEHLER: onPlayerError");
}

function SetupPlayer()
{
	if(player!=null)
		return;
	
	if(firstVid == "" || firstVid == null)
	{
		alert("NULL");
		firstVid = "4xkG4pPbIjg";
	}
	
	player = new YT.Player('player', {
		height: '250',
		width: '100%',
		color: 'white',
		playerVars: { fs:1 },
		videoId: firstVid,
		events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
		}
	});
	
	
	/*
	var playerParams =
	{
		playerVars:
		{
			"fs" : 1,		  
			"enablejsapi": 1,
			"modestbranding": 0,
			"showinfo": 0,
			"rel": 0,
			"color": "red"
		},
		events:
		{
			"onReady":onPlayerReady,
			"onError":onPlayerError,
			"onStateChange":onPlayerStateChange
		},
		width: '100%',
		videoId: firstVid
	};
	player = new YT.Player("player",playerParams);
	*/
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
	firstVid = "";
	gState = 2;
	$$('#player').attr("style", "height: 40vmax; margin: -10% 0 -3% 0; -webkit-clip-path: inset(10% 0px 3% 0px);");
	
}

function onPlayerReady(event) {
	console.log(event);
  //alert("Ready")
  playerIsSetup = true;
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
	//alert(1);			// DOUBLE AUFRUF
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