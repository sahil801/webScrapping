const puppeteer = require("puppeteer");
const json2csv = require("json2csv").Parser;
const fs = require("fs");
var csv2json = require("csvtojson");
const csvPath = "./pastGames.csv";

csv2json()
  .fromFile(csvPath)
  .then((pastGames) => {
    (async () => {
      const browser = await puppeteer.launch({
        headless: false,
        // devtools: true,
      });
      const page = await browser.newPage();
      let jsonArray = [];
      for (let jsonindex = 0; jsonindex <= 40; jsonindex+=1) {
        const url = pastGames[jsonindex].TournamentLink;
        await page.goto(url);
        // ***************** Load More......... */
        await page.evaluate(async () => {
          let Loadbutton = document.querySelector("#loadMorePastMatches");
          let display = 'none';
          if(Loadbutton){
            display= Loadbutton.style.display;
          }
          while (display !== 'none') {
            Loadbutton.click();
            await new Promise((r) => setTimeout(r, 1000));
            display = Loadbutton.style.display;
          }
        });
        //***************** Getting data......... */
        let data = await page.evaluate(async (jsonindex,pastGames) => {
          let tournamentgames = [];
          let arr = document.querySelector(`div.pastmatchesDiv`).children;
          var parentArray = Array.prototype.slice.call(arr);
          parentArray.forEach((element) => {
            let finalObj = {};
            let gameLink = element.querySelector("a.nohover").href;
            let mediaTitle = element
              .querySelector("div.media-body")
              .innerText.replace("\n", "");
            let groundArray = mediaTitle.split(",");
            let team_A = element
              .querySelector("div.pmd-card-body .section1 #team-a-name")
              .innerText.replace("\n", "");
            let teamAscore = element
              .querySelector("div.pmd-card-body .section1  .score")
              .innerText.replace("\n", "");
            let team_B = element
              .querySelector("div.pmd-card-body .section2 #team-b-name")
              .innerText.replace("\n", "");
            let teamBscore = element
              .querySelector("div.pmd-card-body .section2 .score")
              .innerText.replace("\n", "");
            let gameResult = element
              .querySelector("div.test-result")
              .innerText.replace("\n", "");
            // let value = element.querySelector('div.stat-item-value strong').innerText;
            finalObj = {
              "Tournament Name": pastGames[jsonindex].TournamentName,
              "Team A": team_A,
              "Team A Score": teamAscore,
              "Team B": team_B,
              "Team B Score": teamBscore,
              'ground': groundArray[0],
              'city': groundArray[1],
              'date': groundArray[2],
              'overs': groundArray[3],
              'Round': groundArray[4],
              "Game Result": gameResult,
              'gameLink': gameLink,
            };
            tournamentgames.push(finalObj);
          });
          return tournamentgames
        },jsonindex,pastGames);
        jsonArray.push(...data)
        
      }
      //********************writing to csv */
      const j2cp = new json2csv();
      const csv = j2cp.parse(jsonArray);
      fs.writeFileSync(`pastTurnamensDetail.csv`, csv, "utf-8");
      browser.close();
    })();
  });
