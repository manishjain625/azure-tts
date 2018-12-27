const express = require("express");
const path = require("path");
const request = require('request');
const fs = require('fs');

const app = express();
const subscriptionKey = 'ef2e5973c55c4646b906216548d1cb58';

function textToSpeech(saveAudio, text, fileName, language) {
    let options = {
        method: 'POST',
        uri: 'https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey
        }
    };
    // This function retrieve the access token and is passed as callback
    // to request below.
    function getToken(error, response, body) {
        console.log("Getting your token...\n")
        if (!error && response.statusCode == 200) {
            //This is the callback to our saveAudio function.
            // It takes a single argument, which is the returned accessToken.
            saveAudio(body, text, fileName, language)
        }
        else {
            throw new Error(error);
        }
    }
    request(options, getToken)
}

function saveAudio(accessToken, text, fileName, language) {
    let options = {
        method: 'POST',
        baseUrl: 'https://westus.tts.speech.microsoft.com/',
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'Jiny',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: '<speak version=\'1.0\' xmlns="http://www.w3.org/2001/10/synthesis" xml:lang=\'en-US\'>\n<voice  name=\'Microsoft Server Speech Text to Speech Voice (' + language + ')\'>' + text + '</voice> </speak>'
    };
    // This function makes the request to convert speech to text.
    // The speech is returned as the response.
    function convertText(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Converting text-to-speech. Please hold...\n")
        }
        else {
            throw new Error(error);
        }
        console.log("Your file is ready.\n")
    }
    // Pipe the response to file.
    request(options, convertText).pipe(fs.createWriteStream(`./sounds/${fileName}.wav`));
}

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/tts", function (req, res) {
    const text = req.query.text;
    const fileName = req.query.fileName;
    const language = req.query.language;
    textToSpeech(saveAudio, text, fileName, language);
    res.json();
});

app.use("/public", express.static("./public"));

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`listening on http://localhost:${port}`);