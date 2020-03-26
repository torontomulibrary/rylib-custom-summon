/** 
 * Modifications to the "Title Found Online" custom panel section by 
 * Ryerson University Library
 * 
 * Modified to prevent it from hiding the wrong boxes?
 **/
$('head').append('<link rel="stylesheet" href="https://local.4libs.org/apps/summon/ShowJournal.css" type="text/css" />');

/** 
 * Finds an h3 with text "Journal & Book" in the right pane, grabs it's 
 * parent li (only if the li has the .content class), and hides said li.
 * 
 * Why? I don't know. Why didn't the page just render with that li hidden in
 * the first place?
 **/
$('div#rightPane div.customSections li h3[ng-bind="::section.title"]')
  .filter(function (index) { return $(this).text() == "Journal & Book" })
  .parent(".content")
  .css("display", "none");

/** 
 * This forcibly unhides the first li in the customSections div. 
 * 
 * I'm not sure why they render it, then hide it via JS. Also, why do they use 
 * such a generic selector to hide it?
 **/
$('div#rightPane div.customSections li').first().css("display", "block");

// TODO: fix this setTimeout() madness?
setTimeout(function () {
  callAtoZ();
}, 500);

function callAtoZ() {
  // gets the ?q= query parameter from the current URL
  var currentQuery = getQueryParameter(location.href, "q");
  var scripts = document.getElementsByTagName('script');

  // Finds the script src for ShowJournal.js
  var myScript;
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.search("ShowJournal.js") > 0) {
      myScript = scripts[i].src;
      break;
    }
  }

  // Grabs everything after ? from the script src
  var queryString = myScript.replace(/^[^\?]+\??/, '');

  var params = parseQuery(queryString);
  var libhash = params['libhash'];

  var yql = "https://local.4libs.org/apps/summon/GetJournalAndBook.php?libhash=" + libhash + "&title=" + currentQuery;

  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    crossDomain: true,
    url: yql,
    success: successCallback
  });
}

/** 
 * Added by Ryerson University Library
 * 
 * Moves the callback out of the ajax options to make the code readable.
 * Also fixes a bunch of terrible code in the original function.
 * Also removes a bunch of unused code in the original function.
*/

var successCallback = function (data) {
  var number = Object.keys(data).length;
  var journalContents = "";
  var bookContents = "";

  for (var i = 0; i < number; i++) {
    var title = data[i]['title'];
    var pidentifer = data[i]['pidentifer'];
    var eidentifer = data[i]['eidentifer'];
    var format = data[i]['format'];
    var nbsp = "&nbsp;";
    var comma = ",";

    if ((format == 'journal') && !onlyBook()) {
      if (title) {
        journalContents += "<span><b>" + title + "</b></span>";
      }

      if (pidentifer) {
        journalContents += "<span>" + nbsp + pidentifer + "</span>";
      }

      if (eidentifer) {
        if (pidentifer) {
          journalContents += "<span>" + comma + nbsp + eidentifer + "</span>";
        }
        else {
          journalContents += "<span>" + nbsp + eidentifer + "</span>";
        }
      }

      for (var j = 0; j < data[i]['holdings']['dbname'].length; j++) {
        var dbName = data[i]['holdings']['dbname'][j];
        var dbUrl = data[i]['holdings']['url'][j];
        var startDate = data[i]['holdings']['startdate'][j];
        var endDate = data[i]['holdings']['enddate'][j];

        var dbLine = "<div style='text-indent:15px'>";
        if (dbName && dbUrl) {
          dbline += "<a target='_blank' href='" + dbUrl + "'>" + dbName + "</a>";
        }
        else if (dbName) {
          dbName;
        }

        if (startDate) {
          dbLine += nbsp + "from" + nbsp + startDate;
          if (endDate) {
            dbLine += nbsp + "to" + nbsp + endDate;
          } else {
            dbLine += nbsp + "to present";
          }
        }
        dbLine += "</div>";
        journalContents += dbLine;
      }
    } else if ((format == 'book') && !onlyJournal()) {
      if (title) {
        bookContents = bookContents + "<span><b>" + title + "</b></span>";
      }
      if (pidentifer) {
        bookContents = bookContents + "<span>" + nbsp + pidentifer + "</span>";
      }
      if (eidentifer) {
        if (pidentifer)
          bookContents = bookContents + "<span>" + comma + nbsp + eidentifer + "</span>";
        else
          bookContents = bookContents + "<span>" + nbsp + eidentifer + "</span>";
      }

      for (var j = 0; j < data[i]['holdings']['dbname'].length; j++) {
        var dbName = data[i]['holdings']['dbname'][j];
        var dbUrl = data[i]['holdings']['url'][j];
        var startDate = data[i]['holdings']['startdate'][j];
        var endDate = data[i]['holdings']['enddate'][j];

        var dbLine = "<div style='text-indent:15px'>";
        if (dbName && dbUrl) {
          dbLine += "<a target='_blank' href='" + dbUrl + "'>" + dbName + "</a>";
        }
        else if (dbName) {
          dbLine += dbName;
        }

        if (startDate) {
          dbLine += nbsp + "from" + nbsp + startDate;
          if (endDate) {
            dbLine += nbsp + "to" + nbsp + endDate;
          } else {
            dbLine += nbsp + "to present";
          }
        }

        dbLine += "</div>";
        bookContents += dbLine;
      }
    }
  }

  // Struture the HTML to be added to #mydiv < lol wtf
  var html = "<div>";
  if (journalContents) {
    html += "<a href='#' class='format'>Journal</a><br>";
    html += journalContents;
    html += '<br>';
  }
  if (bookContents) {
    html += "<a href='#' class='format'>Book</a><br>"
    html += bookContents;
  }
  html += "</div>";

  // This is actually stupid.
  $('div#mydiv').html(html);

  $('.format').css({
    "background-color": "#29b6f6",
    "-moz-border-radius": "3px",
    "-webkit-border-radius": "3px",
    "border-radius": "3px",
    "border": "0.3px solid  #e0e0e0 ",
    "display": "inline-block",
    "cursor": "pointer",
    "color": "#ffffff",
    "font-family": "Arial",
    "font-size": "13px",
    "font-weight": "bold",
    "padding": "5px 11px",
    "width": "100%",
    "text-decoration": "none"
  });
}

// Added by Ryerson University Library
function onlyBook() {
  var book = getParam('book');
  if (book !== undefined && book === 'true') {
    return true;
  }
  return false;
}

// Added by Ryerson University Library
function onlyJournal() {
  var journal = getParam('journal');
  if (journal !== undefined && journal === 'true') {
    return true;
  }
  return false;
}

// Added by Ryerson University Library
function getParam(paramName) {
  // Finds the script src for ShowJournal.js
  var scripts = document.getElementsByTagName('script');
  var myScript;
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.search("ShowJournal.js") > 0) {
      myScript = scripts[i].src;
      break;
    }
  }

  // Grabs everything after ? from the script src
  var queryString = myScript.replace(/^[^\?]+\??/, '');

  var params = parseQuery(queryString);
  return params[paramName];
}

function parseQuery(query) {
  var Params = new Object();
  if (!query) return Params; // return empty object
  var Pairs = query.split(/[;&]/);
  for (var i = 0; i < Pairs.length; i++) {
    var KeyVal = Pairs[i].split('=');
    if (!KeyVal || KeyVal.length != 2) continue;
    var key = unescape(KeyVal[0]);
    var val = unescape(KeyVal[1]);
    val = val.replace(/\+/g, ' ');
    Params[key] = val;
  }
  return Params;
}

function getQueryParameter(source, parameterName) {
  var queryString = source;
  var parameterName = parameterName + "=";

  if (queryString.length > 0) {
    begin = queryString.lastIndexOf(parameterName);
    if (begin != -1) {
      begin += parameterName.length;
      end = queryString.lastIndexOf("&", begin);
      if (end == -1 || begin >= end) {
        end = queryString.length
      }
      return queryString.substring(begin, end);
    }
  }
  return "null";
}