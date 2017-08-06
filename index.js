// Author: Elm (elmthedev@gmail.com) (https://github.com/ElmTheDev/Youtube-Bulk-MP3-Downloader)

// Don't edit under this line if you have no idea what you are doing.

const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const YouTube = require("youtube-node");
const fs = require("fs");
const config = require("./config.json");

let youTube = new YouTube();
let currentVideoId = 1;
let songQueue = [];

youTube.setKey(config.apiKey);

let YD = new YoutubeMp3Downloader({
    "ffmpegPath": config.ffmpegPath,
    "outputPath": config.outputPath,
    "youtubeVideoQuality": "highest",
    "queueParallelism": 2,
    "progressTimeout": 2000
});

YD.on("progress", function(progress) {
    let progressNice = (progress.progress.percentage).toFixed(2);
    let speedNice = (progress.progress.speed / 1000).toFixed(2);
    let songName = songQueue[currentVideoId - 1];
    console.log(`Video: '${songName}' | Progress: ${progressNice}% | Speed: ${speedNice}kb/s | Currently downloading ${currentVideoId}/${songQueue.length-1}`);
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

fs.readFile("./" + config.songList, function(err, data) {
    if (err) throw err;
    songQueue = data.toString().replace(/\r/g, "").split("\n");
    songQueue.push("");

    SearchYoutube(songQueue[0], function(returnValue) {
        DownloadNextOne(returnValue);
    });
});

function DownloadNextOne(videoId) {
    if (currentVideoId == songQueue.length) {
        console.log("\n\n\nFinished downloading music!");
        process.exit(0);
    }
    YD.download(videoId, mysqlEscape(songQueue[currentVideoId - 1]) + "." + config.fileFormat);
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

function mysqlEscape(stringToEscape) {
    if (stringToEscape == '') {
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