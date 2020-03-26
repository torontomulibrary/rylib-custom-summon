setTimeout( function() {
  var $inject_target = $('#main');
  var _el = angular.element($inject_target);

  _el.injector().invoke( function($compile, $http) {
    var $scope = _el.scope();
    
    $http({
      url: 'https://library.ryerson.ca/wp-json/acf/v3/options/options/summon_alert_message',
      method: 'GET'
    }).then(function(response) {
      const message = response.data['summon_alert_message'];
      
      if ( message.trim().length != 0 ) {
        var $inject_div = $("<div id='rula-message' style='background: #ffae65; padding: 15px 19.5px; font-size: 1.25em; font-weight: 700;'>"+message+"</div>");
  
        $inject_target.prepend( $compile($inject_div)($scope) );
      } 
    });
  });
}, 1000);

// It seems like we can just use straight jQuery?
$(document).ready(function () {
  // Inject our custom styles
  $('head').append('<link rel="stylesheet" type="text/css" href="https://ryersonlibrary.nyc3.digitaloceanspaces.com/rylib-custom-summon/css/rylib-custom-summon.css" />');

  // Temporary hard coded breadcrumb until I can figure out how to have it update dynamically
  // const title = "Search Everything";
  const title = document.title.replace(" - RULA Search Everything", '');

  // Inject our breadcrumbs
  var breadcrumbHTML = '<ul class="rylib-breadcrumb"><li><a href="https://library.ryerson.ca">Ryerson University Library</a></li><li id="rylib-current-search">' + title + '</li></ul>';

  $('#main').prepend(breadcrumbHTML);

  // Unsure if this actually works properly...
  // if ( $('.bxRecommender').children().length == 0 ) {
  //   $('.bxRecommender').remove();
  // }
  
  // Detect changes to title and update breadcrumb
  $('title').bind("DOMSubtreeModified",function(e){
    const title = document.title.replace(" - RULA Search Everything", '');
    $('#rylib-current-search').html(title);
  });
})

