const puppeteer = require("puppeteer");
const json2csv = require("json2csv").Parser;
const fs = require("fs");
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  });
  const page = await browser.newPage();
  const url =
    "https://cricheroes.in/cricket-scorers";
  await page.goto(url);
  // ***************** Load More......... */
  await page.evaluate(async () => {
    let display = 900;
    for (let i = 0; i < 900; i++) {
      try {
        let Loadbutton = document.querySelector("#loadMoreScorer");
        console.log('Loadbutton');
        console.log(Loadbutton);
        if (!Loadbutton) continue;
        Loadbutton.click();
        await new Promise((r) => setTimeout(r, 500));
        display = display - 1;
        console.log(display);
      } catch (error) {
        console.log('error caught bhai.');
        console.log(error);
      }
    }
  });
  console.log('Loop se bahar aa gaya main.');
  //***************** Getting data......... */
  let data = await page.evaluate(async () => {
    let arr = document.querySelector(`#scorerDiv`).children;
    var parentArray = Array.prototype.slice.call(arr);
    let jsonData = [];
    parentArray.forEach((element) => {
      let dataObj = {};
      let scorerName = "";
      let city = "";
      let matchesScored = "";
      let price = "";
      let scorerDiv = element.querySelector(`div.player-team`);
      if (scorerDiv) {
        scorerName = scorerDiv.querySelector(
          `h3.booking-person-name`
        ).innerText;
        let middleDiv = scorerDiv.querySelector(`ul`).children;
        let middleDataArray = Array.prototype.slice.call(middleDiv);
        city = middleDataArray[0].querySelector(`span`).innerText;
        matchesScored = middleDataArray[1].querySelector(`span`).innerText;
        price = scorerDiv.querySelector(`span.price-amount`).innerText;
      }
      if (scorerName !== "") {
        dataObj = {
          scorerName,
          city,
          matchesScored,
          price,
        };
        jsonData.push(dataObj);
      }
    });
    console.log(jsonData);
    return jsonData;
  });
  // console.log(data);
  //********************writing to csv */
  const j2cp = new json2csv();
  const csv = j2cp.parse(data);
  fs.writeFileSync(`scorers.csv`, csv, "utf-8");
  browser.close();
})();

