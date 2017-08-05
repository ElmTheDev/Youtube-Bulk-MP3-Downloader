// Author: Elm (elmthedev@gmail.com)

// Configuration

let apiKey     = ""; // YouTube V3 API Key
let songList   = "./songs.txt"; // Path to song list
let fileFormat = "mp3"; // File format you want video to be outputted to
let ffmpegPath = "./ffmpeg/ffmpeg.exe"; // Path to ffmpeg.exe
let outputPath = "./mp3"; // Folder where video will be outputted

// Don't edit under this line if you have no idea what you are doing.

const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const YouTube    		   = require("youtube-node");
const fs 		           = require("fs");

let youTube 			   = new YouTube();
let currentVideoId         = 1;
let songQueue              = [];

youTube.setKey(apiKey);

 
let YD = new YoutubeMp3Downloader({
    "ffmpegPath": ffmpegPath,
    "outputPath": outputPath,
    "youtubeVideoQuality": "highest",
    "queueParallelism": 2,
    "progressTimeout": 2000      
});
 
fs.readFile("./"+songList, function(err, data) {
    if (err) throw err;
    songQueue = data.toString().replace(/\r/g, "").split("\n");

    SearchYoutube(songQueue[0], function(returnValue) {
        DownloadNextOne(returnValue);
    });
});


YD.on("finished", function(err, data) {
    console.log(`\nVideo '${songQueue[currentVideoId - 1]}' finished downloading!\n`);
    currentVideoId++;
    SearchYoutube(songQueue[currentVideoId - 1], function(returnValue) {
        DownloadNextOne(returnValue)
    });
});

YD.on("error", function(error) {
	console.log(`Ouch! There was an error!\n\n${error}`);
	process.exit(0);
});

YD.on("progress", function(progress) {
    let progressNice = (progress.progress.percentage).toFixed(2);
    let speedNice = (progress.progress.speed / 1000).toFixed(2);
	let songName = songQueue[currentVideoId - 1];
	console.log(`Video: '${songName}' | Progress: ${progressNice}% | Speed: ${speedNice}kb/s | Currently downloading ${currentVideoId}/${songQueue.length}`);
});

function DownloadNextOne(videoId) {
	if(currentVideoId == songQueue.length)
	{
		console.log("\n\n\nFinished downloading music!");
		process.exit(0);
	}
    YD.download(videoId, mysqlEscape(songQueue[currentVideoId-1]) + "." + fileFormat);
}

function SearchYoutube(string, callback) {
    youTube.search(string, 1, function(error, result) {
        if (error) {
            console.log(error);
        } else {
            callback(result["items"][0].id.videoId);

        }

    });
}

function mysqlEscape(stringToEscape){
    if(stringToEscape == '') {
        return stringToEscape;
    }

    return stringToEscape
        .replace(/\\/g, "\\\\")
        .replace(/\'/g, "\\\'")
        .replace(/\"/g, "\\\"")
        .replace(/\n/g, "\\\n")
        .replace(/\r/g, "\\\r")
        .replace(/\x00/g, "\\\x00")
        .replace(/\x1a/g, "\\\x1a");
}