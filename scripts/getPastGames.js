const puppeteer = require('puppeteer');
const json2csv = require('json2csv').Parser;
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  const url = 'https://cricheroes.in/past-tournaments';
  await page.goto(url);
  
  // for(let i=0;i<10;i++){
  //   await page.click('#loadMoreTournaments');
  //   console.log('clicked ',i,' times');
  // }
  
  let i =100;
  while (i) {
    await page.evaluate(`document.querySelector('#loadMoreTournaments').click()`);
    i--;
  }
  await new Promise(r => setTimeout(r, 4000));
  // wait();
  // let time = 100000;
  // while(time){
  //   time--;
  //   console.log(time);
  // }
  
  let data = await page.evaluate(async () => {

    let jsonArray = [];
    let arr = document.querySelector('div.tournamentsDiv').children;
    var parentArray = Array.prototype.slice.call(arr);
    parentArray.forEach(element => {
      let finalObj = {};
      let link = '';
      let val = '';
      let value = element.querySelector('div.pmd-card-title');
      let anchor = element.querySelector('a.nohover');
      if(anchor){
        link = anchor.href;
      }
      if(value){
        val = value.innerText;
      }
      
      finalObj['TournamentName'] = val;
      finalObj['TournamentLink'] = link;
      if(val!==''){
        jsonArray.push(finalObj)
      }
    });
    console.log(jsonArray)
    return jsonArray
  });
  // *************************************writing data into csv file****************************************** 
    const j2cp = new json2csv();
    const csv = j2cp.parse(data);
    fs.writeFileSync(`./pastGames.csv`, csv, "utf-8");
  browser.close();
})();