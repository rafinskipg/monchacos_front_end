'use strict';


/**
 * The main controller for the app. The controller:
 * - retrieves the model via a Service
 * - exposes the model to the template and provides event handlers
 * The controllers are not Models, they just link the data in the model and expose it to the View
 * { Tip of the day !} - Controllers should be "Write only", while views should be "Read Only"
 */
function mainCtrl($scope, $location, $timeout){
    $scope.mainMenu = [];
    $scope.aboutMenu = [];

    angular.forEach([
        ['cv' , 'http://monchacos.com/cv'],
        ['blog' , '#blog'],
        ['home' , '#']
        
        ]
        , function(item, index){

            $scope.mainMenu.push({ 
                title : item[0],
                src: item[1]
            })
        });
    angular.forEach([
        ['GitHub' , 'https://github.com/rafinskipg'],
        ['Drupal.org' , 'http://drupal.org/user/856336'],
        ['Linkedin' , 'http://es.linkedin.com/pub/rafael-pedrola-gimeno/37/788/226'],
        ['Twitter' , 'https://twitter.com/rafinskipg'],
        ['WebSite API' , 'http://monchacos.com/monchacos']
        
        ]
        , function(item, index){

            $scope.aboutMenu.push({ 
                title : item[0],
                src: item[1]
            })
        });

     
    var myNewTitle =  "I salute you";
    $scope.pageTitle = myNewTitle;
    function flipCoin(){
        var coin = Math.floor(Math.random()* 2);
        
        return coin > 0 ? true : false;
    }
    function randomNumber(){
        return Math.floor(Math.random()*  9);

    }
    

    function LoopPageTitle(){
        var text = "I salute you";
    
        var words = text.split(" ");
        angular.forEach(words,function(w, i){
           
            if(flipCoin()){
                var ammount = Math.ceil(Math.random() * (w.length));
                var start = 0;
                var text_replace = "";
                for(var index = 0; index< ammount; index++){
                    text_replace += randomNumber();
                }

                var w_replace = w.substring(start, start+ammount);
                w = w.replace(w_replace, text_replace);
               
                words[i] = w;
            }

        });
        text = words.join(" ");
      
       $scope.pageTitle=  text;
        $timeout(function() {
          LoopPageTitle(); 
        }, 1000);
    }
    LoopPageTitle();
 }

 function homeCtrl($scope){

 } 

 function blogCtrl( $scope, $location, monchacosStorage, filterFilter, $http ) {
    var articles = $scope.articles = [];
    
    //Asyncronous call to a service. Using Angular JS promises
    monchacosStorage.getBlog().then(function(data) {
      $scope.articles = data;
    }, function(reason) {
      $scope.message = 'Sorry, bro... Maybe our CMS is down for maintenance';
    });
    
    // Watch directives are fired many times. You can use them to execute FAST pieces of code that evaluates some changes on the element.
    // Dont use SLOW pieces of code in a wath sentence (or counters) as they may slow your  site.
    $scope.$watch('articles', function() {});

    $scope.opened = false;
    
    $scope.readArticle = function( article ) {
        //$scope.articleReaded = article;
        $scope.opened = true;
        monchacosStorage.getNode(article.nid).then(function(data) {
            data.body = data.body.und[0].safe_value;
            $scope.node = data;
            
        }, function(reason) {
            $scope.node = null;
            $scope.opened = false;
            $scope.message = "Sorry we cannot recover that post at the momment; This is embarrasing :S";
        });
    };

    $scope.closeArticle = function(){
        $scope.opened = false;
        if($scope.node){
            $scope.node = null;
        }
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