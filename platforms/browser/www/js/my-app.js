var myApp = new Framework7({
    pushState: true,
    swipePanel: 'left',
	
	onAjaxStart: function (xhr) {
        myApp.showIndicator();
    },
    onAjaxComplete: function (xhr) {
        myApp.hideIndicator();
    }
});

var ip = "http://52.59.238.139:3001"

var counter = 0;
var firstVid = ""
var player = null;
var data_o;
var isFullScreenState = false;
var versionx = "1.0.0";
var playerIsSetup = false;

var messages = {
	"problem": "Youtube-Playersinin hatali olmasi nedeniyle. Playernin siyah ekran olma ihtimali var",
	"newVer": "Yeni güncelleme mevcut",
	"noInternet": "Internet baglantiniz yok. Devam etmek icin lütfen internet baglantinizin oldugundan emin olun."
}

var categories = {
	"sahsiyet": "Şahsiyet",
	"edebiyat": "Edebiyat",
	"dünya": "Dünya Fikir",
	"düsünce": "Düşünce ve İfade",
	"yaratilis": "Yaratılış ve Kişilik"
}

var $$ = Dom7;
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

$$(document).on('deviceready', function() {
	
	$$.ajaxSetup({'timeout': 4000});
	initialize();
});

$$('body').click(function() {
	if ($$('body').hasClass('with-panel-left-cover') || $$('body').hasClass('with-panel-left-reveal')) 
		myApp.closePanel();
});

myApp.onPageInit('about', function (page) {
	myApp.closePanel();

	$$('#idVer').html("App Version: " + versionx);
	
	$$('.form-to-data').on('click', function(){
	  name = $$("#formName").val();
	  problem = $$("#formText").val();
	  //$$.get( ip + "/api/postProblem?name=" + name + "&problem=" + problem + "&os=" + device.platform + "&ver=" + versionx + "&manu=" + device.manufacturer + "&model=" + device.model);
	  
	$$.ajax({
		type: 'GET',
		url: ip + "/api/postProblem?name=" + name + "&problem=" + problem + "&os=" + device.platform + "&ver=" + versionx + "&manu=" + device.manufacturer + "&model=" + device.model,
		success: function (data) {
			alert("Tessekür Ederim")
		},
		error: function() {
		  alert("Cannot Reach Server.");            
	}});

	  mainView.router.back();
	}); 
})

function initialize()
{	
	//console.log(device.version); 
	if(!localStorage.getItem('firstTime'))
	{
		localStorage.setItem('firstTime', true)
		alert(messages["problem"]);
	}
	
	if(!checkConnection())
	{
		alert(messages["noInternet"])
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
		  "badge": true,
		},
		"windows": {}
	});

   myApp.push.on('registration', function(data) {
	   var oldRegId = localStorage.getItem('registrationId');
	   if (oldRegId !== data.registrationId) {
		   localStorage.setItem('registrationId', data.registrationId);
			$$.ajax({
			type: 'GET',
			url: ip + "/api/postId?id=" + data.registrationId + "&oldId=" + oldRegId + "&os=" + device.platform,
			error: function() {
			  alert("Cannot Reach Server1.");            
			}});
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
};

function SetupJSAPI()
{
	var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	
	cordova.getAppVersion.getVersionNumber().then(function (version) {
		versionx = version;

		$$.ajax({
			type: 'GET',
			url: ip + "/api/version/",
			success: function (data) {
				if(version < data)
					alert(messages["newVer"]);
			},
			error: function() {
			  alert("Cannot Reach Server.");            
		}});
	});
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

function onResume() {
}

function onMenuKeyDown() {
	if(!playerIsSetup)
		return;
	
	if(player != null || player)
		player.pauseVideo();
}

function SetupFullscreen()
{ 
    var screenChange = "webkitfullscreenchange mozfullscreenchange fullscreenchange"
	
	screenChange.split(" ").forEach(function(e){
	
		document.addEventListener(e, function(e) {
			if (isFullScreenState = !isFullScreenState) {
				StatusBar.hide();
				console.log("FullScreen")
			} else {
				StatusBar.show();
				console.log("NotFullScreen")
			}
		});
	});
}

function IsFullscreen2() {
	//alert(document.body.clientHeight + " " +  screen.height + "    !!   " + document.body.clientWidth + " " + screen.width)
	return document.body.clientHeight >= screen.height-30 && document.body.clientWidth == screen.width;
}

function IsFullscreen() {
	//alert(document.fullScreen  + " " +   document.webkitIsFullScreen  + " " +   document.mozFullScreen)
	return document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen;
}
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

function getVideos(var pVideoTitle, var init=false)
{
	markup_o = ""	
	var size = data_o[pVideoTitle].length;
	
	for(var key_s in data_o[pVideoTitle])
	{
		dat = data_o[pVideoTitle][key_s];
		vidId = dat['videoId'];
		
		if(firstVid == "")
			firstVid = vidId;
		
		var url = dat["img"];
		
		date = dat.date;
		if(dat.title != "")
			videoTitle = dat.title;
		else
			videoTitle = "UNDEFINED";
		
		//markup_o += '<div class="clVideos"> <a id="onChangeVideoClick" onclick="ChangeVideo(\''+ vidId + '\');"><img border="0" class="lazy lazy-fadein" alt="111" src="' + url + '" width="100%" ></a><p>' + videoTitle + '</p><p>' + date + '</p></div>\n';
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

function ChangeVideoSite(var pVideoTitle) {
	getVideos(pVideoTitle);
}

function getVideoData()
{
	markup_o = "";
	
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
		},
		error: function() {
		  alert("Cannot Reach Server.");            
	}});

	return;
}

function onYouTubeIframeAPIReady() {
	if(counter <= 40 && (firstVid == null || firstVid == ""))
	{
		setTimeout(onYouTubeIframeAPIReady, 250)
		counter++;
		return;
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
	firstVid = ""; 
}

function onPlayerReady() {
  playerIsSetup = true;
}

function onPlayerStateChange(var event) {
	if (event.data == YT.PlayerState.BUFFERING) {
		//event.target.setPlaybackQuality('hd720');
	}
}

function ChangeVideo(var vidId, var pause=false)
{
	if(!playerIsSetup)
	{
		alert("FEHLER");
		return;
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