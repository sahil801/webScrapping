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
    "https://cricheroes.in/cricket-umpires";
  await page.goto(url);
  // ***************** Load More......... */
  await page.evaluate(async () => {
    let Loadbutton = document.querySelector("#loadMoreUmpire");
    let display = 900;
    while (display > 0) {
      Loadbutton.click();
      await new Promise((r) => setTimeout(r, 500));
      display = display - 1;
      console.log(display);
    }
  });
  //***************** Getting data......... */
  let data = await page.evaluate(async () => {
    let arr = document.querySelector(`#umpireDiv`).children;
    var parentArray = Array.prototype.slice.call(arr);
    let jsonData = [];
    parentArray.forEach((element) => {
      let dataObj = {};
      let umpireName = "";
      let city = "";
      let matchesUmpired = "";
      let price = "";
      let umpiresDiv = element.querySelector(`div.player-team`);
      if (umpiresDiv) {
        umpireName = umpiresDiv.querySelector(
          `h3.booking-person-name`
        ).innerText;
        let middleDiv = umpiresDiv.querySelector(`ul`).children;
        let middleDataArray = Array.prototype.slice.call(middleDiv);
        city = middleDataArray[0].querySelector(`span`).innerText;
        matchesUmpired = middleDataArray[1].querySelector(`span`).innerText;
        price = umpiresDiv.querySelector(`span.price-amount`).innerText;
      }
      if (umpireName !== "") {
        dataObj = {
          umpireName,
          city,
          matchesUmpired,
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
  fs.writeFileSync(`umpires.csv`, csv, "utf-8");
  browser.close();
})();

