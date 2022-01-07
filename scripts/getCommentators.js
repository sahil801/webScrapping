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
    "https://cricheroes.in/cricket-commentators";
  await page.goto(url);
  // ***************** Load More......... */
  await page.evaluate(async () => {
    let Loadbutton = document.querySelector("#loadMoreCommentator");
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
    let arr = document.querySelector(`#commentatorDiv`).children;
    var parentArray = Array.prototype.slice.call(arr);
    let jsonData = [];
    parentArray.forEach((element) => {
      let dataObj = {};
      let commentatorName = "";
      let city = "";
      let matches = "";
      let price = "";
      let comentatorDiv = element.querySelector(`div.player-team`);
      if (comentatorDiv) {
        commentatorName = comentatorDiv.querySelector(
          `h3.booking-person-name`
        ).innerText;
        let middleDiv = comentatorDiv.querySelector(`ul`).children;
        let middleDataArray = Array.prototype.slice.call(middleDiv);
        city = middleDataArray[0].querySelector(`span`).innerText;
        matches = middleDataArray[1].querySelector(`span`).innerText;
        price = comentatorDiv.querySelector(`span.price-amount`).innerText;
      }
      if (commentatorName !== "") {
        dataObj = {
          commentatorName,
          city,
          matches,
          price,
        };
        jsonData.push(dataObj);
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
  fs.writeFileSync(`commentators.csv`, csv, "utf-8");
  browser.close();
})();
