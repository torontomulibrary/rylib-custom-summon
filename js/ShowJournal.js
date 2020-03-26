/** 
 * Modifications to "ShowJournal.js" by Ryerson University Library
 * 
 * Modified to... just fix everything.
 **/

// Start the madness in 500ms...
setTimeout(function () {
  // gets the ?q= query parameter from the current URL
  var currentQuery = getQueryParameter(location.href, "q");
  var libhash = getParam('libhash');
  var baseUrl = "https://local.4libs.org/apps/summon/GetJournalAndBook.php";

  var yql = baseUrl + "?libhash=" + libhash + "&title=" + currentQuery;
  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    crossDomain: true,
    url: yql,
    success: successCallback
  });
}, 500);

// Added by Ryerson University Library
// Moves the callback out of the ajax options to make the code readable.
var successCallback = function (data) {
  // Build the HTML to be added to #mydiv < lol wtf
  var html = '';

  // our styles to inject
  html += `<style>
    .format {
      background-color: #29b6f6;
      border-radius: 3px;
      display: inline-block;
      cursor: pointer;
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      padding: 5px 11px;
      width: 100%;
      text-decoration: none;
    }
  </style>`;

  // the journal section, don't do this the script was called with ?book=true
  if ( !onlyBook() ) {
    var journalData = data.filter(function (i) { return i['format'] == 'journal'; });
    html += "<a href='#' class='format'>Journal</a><br>";
    html += generateTitlesHTML(journalData);
  }

  // the book section, don't do this the script was called with ?journal=true
  if ( !onlyJournal() ) {
    var bookData = data.filter(function (i) { return i['format'] == 'book'; });
    html += "<a href='#' class='format' style=\"margin-top: 12px\">Book</a><br>"
    html += generateTitlesHTML(bookData);
  }

  // This is a really stupid id.
  $('div#mydiv').html(html);
}

// Added by Ryerson University Library
// HTML Helper function
function generateTitlesHTML(data) {
  html = "";
  for (var i = 0; i < data.length; i++) {
    var title = data[i]['title'];
    var pidentifer = data[i]['pidentifer'];
    var eidentifer = data[i]['eidentifer'];
    html += generateHoldingsTitleHTML(title, pidentifer, eidentifer);
    html += generateHoldingsHTML(data[i]['holdings']);
  }
  return html;
}

// Added by Ryerson University Library
// HTML Helper function
function generateHoldingsTitleHTML(title, pidentifer, eidentifer) {
  var nbsp = "&nbsp;";
  var comma = ",";

  var html = '';
  if (title) {
    html += "<span><b>" + title + "</b></span> ";
  }
  if (pidentifer) {
    html += "<span>" + pidentifer + "</span>";
  }
  if (eidentifer) {
    if (pidentifer)
      html += comma + nbsp + "<span>" + eidentifer + "</span>";
    else
      html += "<span>" + eidentifer + "</span>";
  }
  return html;
}

// Added by Ryerson University Library
// HTML Helper function
function generateHoldingsHTML(holdingsData) {
  // This is dumb. But it's the way the data is structured so whatever.
  var numHoldings = holdingsData['dbname'].length;

  var html = "";
  for (var j = 0; j < numHoldings; j++) {
    var dbName = holdingsData['dbname'][j];
    var dbUrl = holdingsData['url'][j];
    var startDate = holdingsData['startdate'][j];
    var endDate = holdingsData['enddate'][j];

    var dbLine = "<div style='text-indent:15px'>";
    if (dbName && dbUrl) {
      dbLine += "<a target='_blank' href='" + dbUrl + "'>" + dbName + "</a>";
    }
    else if (dbName) {
      dbLine += dbName;
    }

    dbLine += generateDateStringHTML(startDate, endDate)

    dbLine += "</div>";
    html += dbLine;
  }

  return html;
}

// Added by Ryerson University Library
// HTML Helper function
function generateDateStringHTML(startDate, endDate) {
  var nbsp = "&nbsp;";

  var html = '';
  if (startDate) {
    html += nbsp + "from" + nbsp + startDate;
    if (endDate) {
      html += nbsp + "to" + nbsp + endDate;
    } else {
      html += nbsp + "to present";
    }
  }
  return html;
}

// Added by Ryerson University Library
// Checks if the 'book' parameter is set
function onlyBook() {
  var book = getParam('book');
  if (book !== undefined && book === 'true') {
    return true;
  }
  return false;
}

// Added by Ryerson University Library
// Checks if the 'journal' parameter is set
function onlyJournal() {
  var journal = getParam('journal');
  if (journal !== undefined && journal === 'true') {
    return true;
  }
  return false;
}

// Added by Ryerson University Library
// Moves this bit out of the callback function make the code readable.
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