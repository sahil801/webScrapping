const puppeteer = require("puppeteer");
const json2csv = require("json2csv").Parser;
const fs = require("fs");
var csv2json = require("csvtojson");
const csvPath = "./data/pastTurnamensDetail.csv";

csv2json().fromFile(csvPath).then((pastGames)=>{
  (async()=>{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let jsonArray = [];
    for(let jsonIndex = 0;jsonIndex<20;jsonIndex++){
      const url = pastGames[jsonIndex].gameLink;
      const tournament = pastGames[jsonIndex].TournamentName;
      await page.goto(url);
      console.log(jsonIndex);
        let gameData = await page.evaluate(
          async (url, tournament) => {
            let scorecardTab = document.querySelector("#scorecardTab");
            console.log('id found',scorecardTab)
            await scorecardTab.click();
            await new Promise((r) => setTimeout(r, 1000));
            let parentDiv = document.querySelector("#accordion7").children;
            let parentArray = Array.prototype.slice.call(parentDiv);
            let MatchDetails = [];
              parentArray.forEach(async (element) => {
                console.log('inside foreach');
                let teamname = element.querySelector(".teamname").innerText;
                element.querySelector("a").click();
                let contentDiv = element.querySelector(".panel-body").children;
                let contentArray = Array.prototype.slice.call(contentDiv);
                let TeamScore = [];
                let batters = [];
                let bowlers = [];
                let battersDiv = contentArray[0].querySelector("tbody").children;
                let battersList = Array.prototype.slice.call(battersDiv);

                for (let ind = 0; ind < battersList.length - 2; ind++) {
                  let rowData = Array.prototype.slice.call(
                    battersList[ind].children
                  );
                  let name = rowData[0].innerText;
                  let ProfileLink = rowData[0].querySelector("a").href;
                  let OutTypeAndBowler = rowData[1].innerText
                    .replace(/(\r\n|\n|\r)/gm, "")
                    .replace(
                      "                                                              ",
                      ""
                    );
                  let runsScored = rowData[2].innerText;
                  let ballsPlayed = rowData[3].innerText;
                  let fours = rowData[4].innerText;
                  let sixes = rowData[5].innerText;
                  let strikeRate = rowData[6].innerText;
                  let min = rowData[7].innerText;
                  BatsmanObj = {
                    name,
                    ProfileLink,
                    OutTypeAndBowler,
                    runsScored,
                    ballsPlayed,
                    fours,
                    sixes,
                    strikeRate,
                    min,
                  };
                  batters.push(BatsmanObj);
                }
                let bowlersDiv = contentArray[4].querySelector("tbody").children;
                let bowlersList = Array.prototype.slice.call(bowlersDiv);

                for (let ind = 0; ind < bowlersList.length; ind++) {
                  let rowData = Array.prototype.slice.call(
                    bowlersList[ind].children
                  );
                  let name = rowData[0].innerText;
                  let ProfileLink = rowData[0].querySelector("a").href;
                  let Overs = rowData[1].innerText;
                  let maidenOvers = rowData[2].innerText;
                  let runs = rowData[3].innerText;
                  let wickets = rowData[4].innerText;
                  let dotBalls = rowData[5].innerText;
                  let fours = rowData[6].innerText;
                  let sixes = rowData[7].innerText;
                  let widealls = rowData[8].innerText;
                  let noBalls = rowData[9].innerText;
                  let economy = rowData[10].innerText;
                  bowlerObj = {
                    name,
                    ProfileLink,
                    Overs,
                    maidenOvers,
                    runs,
                    wickets,
                    dotBalls,
                    fours,
                    sixes,
                    widealls,
                    noBalls,
                    economy,
                  };
                  bowlers.push(bowlerObj);
                }
                TeamScore.push({ teamname, batting: batters, bowling: bowlers });
                MatchDetails.push({ teamname, batting: batters, bowling: bowlers });
            })
            console.log('MatchDetails found');
            console.log(MatchDetails.length);
            console.log(MatchDetails);
            return ({ tournament, url, MatchDetails });
          },
          url,
          tournament
        );
        jsonArray.push(gameData)
        console.log(gameData);
    }
    fs.writeFileSync(`game.json`, JSON.stringify(jsonArray), "utf-8");
    browser.close();
  })();
})