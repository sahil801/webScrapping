const puppeteer = require("puppeteer");
const json2csv = require("json2csv").Parser;
const fs = require("fs");
var csv2json = require("csvtojson");
const csvPath = "./data/pastGames.csv";

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
      for (let jsonindex = 0; jsonindex <= 2; jsonindex += 1) {
        const url = pastGames[jsonindex].TournamentLink;
        await page.goto(url);
        console.log(url);
        // ***************** Load More......... */
        let tdata = await page.evaluate(async () => {
          let tournamentName = document.querySelector('h2.tournamentName').innerText;
          const data = [];
          let teamsButton = document.querySelector('#teamsTab');
          console.log(teamsButton);
          teamsButton.click();
          await new Promise(r => setTimeout(r, 1000));

          let clicknumber = 2;
          while (clicknumber--) {
            let Loadmoreteams = document.querySelector('#loadMoreTeams');
            if (Loadmoreteams) { Loadmoreteams.click() }
            await new Promise(r => setTimeout(r, 2000));
          }

          let arr = document.querySelector('#accordion5').children;
          var parentArray = Array.prototype.slice.call(arr);
          parentArray.forEach((element) => {
            let team = [];
            let teamName = element.querySelector('a').innerText.replace('VIEW PROFILE\nkeyboard_arrow_down', '');
            console.log('team name--->', teamName);
            element.querySelector('a').click();
            let membersContainer = element.querySelector(`.panel-body`).children;
            let membersDiv = membersContainer[0].children
            var membersArr = Array.prototype.slice.call(membersDiv);
            membersArr.forEach((player) => {
              let playerName = player.querySelector('.player-info h3').innerText;
              let playerImage = player.querySelector('.img-responsive').src;
              let playerProfile = player.querySelector('a').href;
              team.push({playerName,playerImage,playerProfile});
            });
            data.push({
              'Team Name': teamName,
              'Members': team
            })
          })
          let finalObj = {tournamentName,data}
          return finalObj;
        });
        jsonArray.push(tdata)
        // console.log(tdata)
      }
      console.log(jsonArray);
      //********************writing to csv */
      const j2cp = new json2csv();
      const csv = j2cp.parse(jsonArray);
      fs.writeFileSync(`TeamDetails1.csv`, csv, "utf-8");
      fs.writeFileSync(`TeamDetails12.json`, JSON.stringify(jsonArray), "utf-8");
      browser.close();
    })();
  });

  