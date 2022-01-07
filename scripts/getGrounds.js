const puppeteer = require("puppeteer");
const json2csv = require("json2csv").Parser;
const fs = require("fs");
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
  });
  const page = await browser.newPage();
  const url = "https://cricheroes.in/cricket-grounds";
  await page.goto(url);
  // ***************** Load More......... */
  await page.evaluate(async () => {
    let Loadbutton = document.querySelector("#loadMoreGrounds");
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
    let arr = document.querySelector(`div.groundsDiv`).children;
    var parentArray = Array.prototype.slice.call(arr);
    let jsonData = [];
    parentArray.forEach((element) => {
      let dataObj = {};
      let groundName = "";
      let location = "";
      let price = "";
      let ground = element.querySelector(`div.ground-title`);
      if (ground) {
        groundName = ground.innerText;
        location = element.querySelector(`.location span`).innerText;
        price = element.querySelector(`span.price-amount`).innerText;
      }
      if(groundName!==""){
        dataObj = {
          groundName,
          location,
          price
        }
        jsonData.push(dataObj)
      }
    });
    console.log(jsonData);
    return jsonData;
  });
  // console.log(data);
  //********************writing to csv */
  const j2cp = new json2csv();
  const csv = j2cp.parse(data);
  fs.writeFileSync(`Grounds.csv`, csv, "utf-8");
  browser.close();
})();
