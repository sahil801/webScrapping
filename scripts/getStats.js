const puppeteer = require('puppeteer');
const json2csv = require('json2csv').Parser;
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  const url = 'https://cricheroes.in/player-profile/775888/Ajay-Zode#STATS';
  await page.goto(url);

  var fields = ['battingStat', 'bowlingStat', 'fieldingStat'];
  let data = await page.evaluate(async (fields) => {
    const OutputData = [];
    fields.forEach(field => {
      let jsonArray = [];
      let finalObj = {};
      let arr = document.querySelector(`div.${field}`).children;
      var parentArray = Array.prototype.slice.call(arr);
      parentArray.forEach(element => {
        let key = element.querySelector('div.stat-item-name span').innerText;
        let value = element.querySelector('div.stat-item-value strong').innerText;
        finalObj[key] = value;
      })
      jsonArray.push(finalObj);
      OutputData.push(jsonArray);
    })
    return OutputData;
  },fields);

  console.log(data)
  // *************************************writing data into csv file****************************************** 
  for (let i = 0; i < fields.length; i++) {
    const j2cp = new json2csv();
    const csv = j2cp.parse(data[i]);
    fs.writeFileSync(`./${fields[i]}.csv`, csv, "utf-8");
  }
  browser.close();
})();


//row bowlingStat
//row fieldingStat