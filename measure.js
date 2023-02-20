const ytdl = require('ytdl-core')
const fs = require("fs");
const wav = require("node-wav");
const path = require('path')
const { exec } = require('child_process')
const Meyda = require("meyda");



//const { plot, stack, clear, Plot } = require('nodeplotlib');

const baseURL = 'https://www.youtube.com/watch?v=';

DayIdPair = new Map([
    ['2021/07/12', 'uLsQXgLVHCk'],
    ['2021/08/07', 'sTk3_L3jWOs'],
    ['2023/02/20', 'c0_uCQw7K6M'],
    ['2023/01/19', 'PsXEnefFCbU'],
    ['2022/11/04', 'Jzs93MhL5xM'],
].sort());

console.log(DayIdPair)
DayIdPair.forEach((YTID,Day)=>{


    url = baseURL + YTID;

    function chunk(array, size) {
        const chunked_arr = [];
        let index = 0;
        while (index < array.length - array.length % size) {
            chunked_arr.push(array.slice(index, size + index));
            index += size;
        }
        return chunked_arr;
    }

    const inputFilePath = path.resolve(__dirname, `./tmp/${YTID}.webm`);
    const outputFilePath = path.resolve(__dirname, `./tmp/${YTID}.wav`);


    const video = ytdl(url, {
        filter: "audioonly",
        fmt: "mp3",
    })

    video.pipe(fs.createWriteStream(path.resolve(__dirname, `./tmp/${YTID}.webm`)))

    video.on('end', () => {

        exec(`ffmpeg -y -vn -i ${inputFilePath} ${outputFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return;
            }
            //console.log(stdout);
            //console.log(stderr);

            let audioFile = fs.readFileSync(outputFilePath);
            let audioBuffer = wav.decode(audioFile);
            //console.log(audioBuffer.sampleRate);
            //console.log(audioBuffer.channelData); // array of Float32Arrays

            trimedWave = chunk(audioBuffer.channelData[0], 256) // divide for 256

            rms = [];
            trimedWave.forEach(element => {
                rms.push(Meyda.extract('rms', element))
            });

            //console.log(rms)


            avg = rms.reduce((x, y) => x + y) / rms.length
            console.log(Day, YTID,avg)


        });
    });
});
