//google apps script to pull data from TBA and STB and put it into a google sheet 
//note, this script's file extension is really .gs, though for the purpose of syntax highlighting, it has been changed to .js
//for the to work, you must rename the file extension before importing to apps script. 
//This script has been decently optimized, any delay in running is likely due to google and or the external APIs rate limiting. 

function refresh() {
  var TBA_STRING = "https://www.thebluealliance.com/api/v3/";
  var STB_STRING = "https://api.statbotics.io/v1/";

  function tbaCall(suffix) {
    var options = {
      "headers": { "X-TBA-Auth-Key": "5fsqBdP8JZfu5wzuBz00HpunpuNGbNiqquVIOuHGXPinm9uC7A564QjNB3m8dJ1z" } //throwaway key :)
    };
    var response = UrlFetchApp.fetch(TBA_STRING + suffix, options);
    return JSON.parse(response.getContentText());
  }

  function stbCall(suffix) {
    var response = UrlFetchApp.fetch(STB_STRING + suffix);
    return JSON.parse(response.getContentText());
  }

  function getTeamList(eventKey) {
    raw = tbaCall("event/" + eventKey + "/teams/keys");
    raw2 = tbaCall("event/" + eventKey + "/teams");
    var teamListNumber = [];
    var teamListName = [];
    for (var i = 0; i < raw.length; i++) {
      teamListNumber.push(raw[i].substring(3));
      teamListName.push(raw2[i].nickname)
    }
    return [teamListNumber, teamListName];
  }


  function getRecentElo(teamNumber) {
    try {
      raw = stbCall("team/" + teamNumber);
      return raw[0].elo_recent;
    }
    catch (TypeError) {
      return 1500
    }
  }

  function getAwards(teamNumber) {
    raw = tbaCall("team/frc" + teamNumber + "/awards");
    var bannerCount = 0;
    var chairmanCount = 0;
    for (const banner of raw) {
      if (banner.award_type == 1 | banner.award_type == 0) {
        bannerCount++;
      }
      if (banner.award_type == "0") {
        chairmanCount++;
      }
    }
    return [bannerCount, chairmanCount];
  }

  function getElo(teamNumber) {
    return new Promise((resolve, reject) => {
      try {
        resolve(getRecentElo(teamNumber));
      } catch (err) {
        reject(err);
      }
    })
  }
  //Columns:
  //team number (pulled from event list, TBA)
  //team name (pulled from team info, TBA)
  //team recent elo (pulled from team stats, STB)
  //team chairman's banners (pulled from team awards, TBA)
  //team total banners (pulled from team awards, TBA)

  // setup
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('A3:E').clearContent();
  var eventKey = spreadsheet.getRange('C1:C1').getValue()

  //iterate through team list
  var teamList = getTeamList(eventKey);
  teamList[2] = [];
  teamList[3] = [];

  Logger.log(teamList)
  Logger.log(Boolean((!teamList.includes("862"))))
  if (!teamList[0].includes("862")) {
    teamList[0].push(862)
    teamList[1].push("Lightning Robotics")
  }
  let promises = [];
  let promises0 = []
  teamList[0].map((team) => {
    promises.push(getElo(team))
    promises0.push(getAwards(team))
  });
  Promise.all(promises).then(elo => {
    Promise.all(promises0).then(awards => {
      for (var i = 0; i < teamList[0].length; i++) {
        var data = [[teamList[0][i], teamList[1][i], elo[i], awards[i][1], awards[i][0]]];
        Logger.log(i + 3)
        spreadsheet.getRange("A" + (i + 3) + ":E" + (i + 3)).setValues(data);
      }
    });
  });

  var date = Utilities.formatDate(new Date(), "GMT-4", "MM/dd/yyyy HH:mm")
  spreadsheet.getRange('F1:F1').setValue(date)

};
