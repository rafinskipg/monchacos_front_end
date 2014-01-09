'use strict';


/**
 * The main controller for the app. The controller:
 * - retrieves the model via a Service
 * - exposes the model to the template and provides event handlers
 * The controllers are not Models, they just link the data in the model and expose it to the View
 * { Tip of the day !} - Controllers should be "Write only", while views should be "Read Only"
 */
function mainCtrl($scope, $location, $timeout, $rootScope){
    
    var title = "I salute you. Thank you for coming. What do you need?";
    
    $scope.mainMenu = [];
    $scope.aboutMenu = [];
    $rootScope.menuEnabled = true;

    angular.forEach([
        
        ['home' , '#', 'glyphicon glyphicon-book'],
        ['team' , '#team', 'glyphicon glyphicon-send'],
        ['my list' , '#list', 'glyphicon glyphicon-th-list'],
        ['cv' , 'http://rvpg.me/cv', 'glyphicon glyphicon-user', 'blank']
        
        ]
        , function(item, index){

            $scope.mainMenu.push({ 
                title : item[0],
                src: item[1],
                class: item[2],
                target: item[3] || ''
            })
        });
    angular.forEach([
        ['GitHub' , 'https://github.com/rafinskipg'],
        ['Drupal.org' , 'http://drupal.org/user/856336'],
        ['Linkedin' , 'http://es.linkedin.com/pub/rafael-pedrola-gimeno/37/788/226'],
        ['Twitter' , 'https://twitter.com/rafinskipg'],
        ['WebSite API' , 'http://rvpg.me/monchacos'],
        ['NPM' , 'https://npmjs.org/~rafinskipg']
        
        ]
        , function(item, index){

            $scope.aboutMenu.push({ 
                title : item[0],
                src: item[1]
            })
        });

     
    $scope.pageTitle = title;
    
    function flipCoin(){
        var coin = Math.floor(Math.random()* 5);
        
        return coin > 0 ? false : true;
    }
    function randomNumber(){
        return Math.floor(Math.random()*  9);

    }
    

    function LoopPageTitle(){
        var charsTitle = _.str.chars(title);
        
        angular.forEach(charsTitle,function(character, i){
            if(flipCoin()){
                charsTitle[i] = randomNumber();
            }
        });
        
       $scope.pageTitle =  charsTitle.join('');
        $timeout(function() {
          LoopPageTitle(); 
        }, 2000);
    }
    LoopPageTitle();
 }

 function homeCtrl($scope){

 } 

 function blogCtrl( $scope, $location, monchacosStorage, $rootScope  ) {
    $rootScope.menuEnabled = true;
    var articles = $scope.articles = [];
    $scope.loaded = false;
    //Asyncronous call to a service. Using Angular JS promises
    monchacosStorage.getBlog().then(function(data) {
      $scope.articles = data;
      $scope.loaded = true;
    }, function(reason) {
      $scope.message = 'Sorry, bro... Maybe our CMS is down for maintenance';
    });
    
    // Watch directives are fired many times. You can use them to execute FAST pieces of code that evaluates some changes on the element.
    // Dont use SLOW pieces of code in a wath sentence (or counters) as they may slow your  site.
    $scope.$watch('articles', function() {});
    
    $scope.readArticle = function( article ) {
        $location.path('/article/'+article.nid);
    };

}

function articleCtrl($scope, $routeParams, $location, monchacosStorage){
    var nid = typeof($routeParams.nid) != 'undefined' ? parseInt($routeParams.nid,10) : 0;

    if(nid > 0){
        monchacosStorage.getNode(nid).then(function(data) {
            data.body = data.body.und[0].safe_value;
            $scope.node = data; 
        }, function(reason) {
            $scope.node = null;
            $scope.message = "Sorry we cannot recover that post at the momment; This is embarrasing :S";
        });
    } 
}

function notFoundCtrl($scope){
    $scope.numClicked = 0;
    $scope.showMonster = false;
     $scope.click= function(){
        console.log('wait...');
        $scope.numClicked++;
        if($scope.numClicked >= 10){
            $scope.showMonster = true;
        }
     }
}


function teamCtrl($scope, $rootScope){
    $rootScope.menuEnabled = true;
}

function listCtrl($scope, monchacosStorage){
    monchacosStorage.getList().then(function(response){
        $scope.list = response.data;
    }, function(){
        $scope.list = [];
    });
}