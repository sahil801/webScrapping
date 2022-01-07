const puppeteer = require("puppeteer");
const json2csv = require("json2csv").Parser;
const fs = require("fs");
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true
  });
  const page = await browser.newPage();
    const url = 'https://cricheroes.in/tournament-organisers';
    await page.goto(url);
    // ***************** Load More......... */
    await page.evaluate(async () => {
      let Loadbutton = document.querySelector("#loadMoreOrganizer");
      let display = 900;
      while (display>0) {
        Loadbutton.click();
        await new Promise((r) => setTimeout(r, 500));
        display = display-1;
        console.log(display);
      }
    });
    //***************** Getting data......... */
    let data = await page.evaluate(
      async () => {
        let arr = document.querySelector(`#organizerDiv`).children;
        var parentArray = Array.prototype.slice.call(arr);
        let jsonData = [];
        parentArray.forEach((element) => {
          let dataObj = {};
          let organizerdiv =  element.querySelector(`h2.pmd-card-title-text`);
          let organizer='';
          let city = '';
          let tournamentsOrganized = '';
          let ratting = '';
          if(organizerdiv){
              organizer =organizerdiv.innerText ;
              city = element.querySelector(`.pmd-card-subtitle-text`).innerText;
              tournamentsOrganized = element.querySelector(`.content-text strong`).innerText;
              ratting = element.querySelector(`.reviews .badge`).innerText;
          }
          if(organizer!=''){
            dataObj= {
              'organizer':organizer, 
              'city' :city,
              'tournamentsOrganized':tournamentsOrganized,
              'ratting' :ratting
            };
            jsonData.push(dataObj);
          } 

        });
        console.log(jsonData)
        return jsonData;
    });
    // console.log(data);
  //********************writing to csv */
  const j2cp = new json2csv();
  const csv = j2cp.parse(data);
  fs.writeFileSync(`Organizers.csv`, csv, "utf-8");
  browser.close();
})();
