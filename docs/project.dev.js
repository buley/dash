var dashApp = angular.module('dashApp', ['ngRoute']);
dashApp.config(['$routeProvider',
  function ($routeProvider) {
    /* Behaviors */
    dash.add.behavior(dashStats);
    dash.add.behavior(dashCache);
    dash.add.behavior(dashLive);
    dash.add.behavior(dashChanges);
    dash.add.behavior(dashMatch);
    dash.add.behavior(dashCollect);
    dash.add.behavior(dashMap);
    dash.add.behavior(dashMapReduce);
    dash.add.behavior(dashPatch);
    dash.add.behavior(dashShorthand);
    dash.add.behavior(dashRest);

    $routeProvider
      .when('/about', {
        templateUrl: '/docs/templates/about.html',
        controller: 'dashAppAboutController'
      }).
    when('/docs', {
      templateUrl: '/docs/templates/docs.html',
      controller: 'dashAppDocsController'
    }).
    when('/docs/:doc1', {
      templateUrl: '/docs/templates/docs.html',
      controller: 'dashAppDocsController'
    }).
    when('/docs/:doc1/:doc2', {
      templateUrl: '/docs/templates/docs.html',
      controller: 'dashAppDocsController'
    }).
    when('/docs/:doc1/:doc2/:doc3', {
      templateUrl: '/docs/templates/docs.html',
      controller: 'dashAppDocsController'
    }).
    when('/docs/:doc1/:doc2/:doc3/:doc4', {
      templateUrl: '/docs/templates/docs.html',
      controller: 'dashAppDocsController'
    }).
    when('/', {
      templateUrl: '/docs/templates/splash.html',
      controller: 'dashAppSplashController'
    }).
    otherwise({
      redirectTo: '/docs'
    });
}]);
dashApp.controller('dashAppController', ['$location', '$scope',
  function ($location, $scope) {
    $scope.isSplash = function () {
      return '/' === $location.path();
    };
    $scope.isDocs = function () {
      return '/docs' === $location.path();
    };
    $scope.isAbout = function () {
      return '/about' === $location.path();
    };
}]);
dashApp.controller('dashAppAboutController', [

  function () {}]);
dashApp.controller('dashAppDocsController', ['$scope', '$http', '$templateCache', '$routeParams',
  function ($scope, $http, $templateCache, $routeParams) {
    $scope.parentSelected = function (parent) {
      var current = $scope.currentTopic();
      return parent.path === current;
    };
    $scope.currentTopic = function () {
      var params = [];
      if ($routeParams.doc1) {
        params.push($routeParams.doc1);
      }
      if ($routeParams.doc2) {
        params.push($routeParams.doc2);
      }
      if ($routeParams.doc3) {
        params.push($routeParams.doc3);
      }
      if ($routeParams.doc4) {
        params.push($routeParams.doc4);
      }
      return params.join('/');
    };
    $scope.parentShowing = function (obj, child) {
      var params = [],
        match,
        regx,
        current,
        others;
      if ($routeParams.doc1) {
        params.push($routeParams.doc1);
      }
      if ($routeParams.doc2) {
        params.push($routeParams.doc2);
      }
      if ($routeParams.doc3) {
        params.push($routeParams.doc3);
      }
      if ($routeParams.doc4) {
        params.push($routeParams.doc4);
      }
      current = params.join('\/');
      if ('' === current) {
        return false;
      }
      regx = new RegExp('^' + current);
      match = (null !== obj.path.match(regx)) ? true : false;
      others = child.path.split('/');
      others.pop();
      others = others.join('/');
      regx = new RegExp('^' + others);
      return match || (null !== current.match(regx)) ? true : false;
    };
    $scope.documents = [
      {
        path: 'overview',
        children: [
          {
            'path': 'overview',
            'title': 'Overview',
            'default': true,
            'children': [
              {
                'path': 'general/security',
                'title': 'Security'
                        },
              {
                'path': 'general/transactions',
                'title': 'Transactions',
                'children': [{
                  'path': 'general/transaction/requests',
                  'title': 'Requests'
                            }]
                        }
                    ]
                },
          {
            'path': 'databases',
            'title': 'Databases',
            'children': [
              {
                'path': 'database/opening',
                'title': 'Opening',
                'demos': [{
                  'title': 'Opening A Database Example: Simple Case',
                  'id': 'dashdb/ZCngL'
                 }]
                        },
              {
                'path': 'database/closing',
                'title': 'Closing',
                'demos': [
                  {
                    'title': 'Closing A Database Example: Simple Case',
                    'id': 'dashdb/SFYx5'
                                }
                            ]
                        },
              {
                'path': 'database/removing',
                'title': 'Removing',
                'demos': [{
                  'title': 'Removing A Database Example: Simple Case',
                  'id': 'dashdb/retKS'
                            }]
                        },
              {
                'path': 'database/getting',
                'title': 'Getting',
                'demos': [
                  {
                    'title': 'Getting Existing Databases Example: Simple Case',
                    'id': 'dashdb/5ZWMg'
                                }
                            ]
                        }]
                },
          {
            'path': 'stores',
            'title': 'Stores',
            'children': [
              {
                'path': 'objectstore/clearing',
                'title': 'Clearing',
                'demos': [{
                  'title': 'Clearing An Object Store Example: Simple Case',
                  'id': 'dashdb/YCj4Q'
                            }]
              },
              {
                'path': 'objectstore/creating',
                'title': 'Creating',
                'demos': [{
                  'title': 'Creating An Object Store Example: Simple Case',
                  'id': 'dashdb/8mCew'
                            }]
              },
              {
                'path': 'objectstore/getting',
                'title': 'Getting',
                'demos': [{
                  'title': 'Getting An Object Store Example: Simple Case',
                  'id': 'dashdb/LJqjA'
                            }]
              },
              {
                'path': 'objectstore/iteration',
                'title': 'Iterating',
                'demos': [{
                  'title': 'Getting Multiple Object Stores Example: Simple Case',
                  'id': 'dashdb/ZCngL'
                            }]
              },
              {
                'path': 'objectstore/removing',
                'title': 'Removing',
                'demos': [{
                  'title': 'Removing An Object Store Example: Simple Case',
                  'id': 'dashdb/Zcw46'
                            }]
              }
                    ]
                },

          {
            'path': 'keys',
            'title': 'Keys',
            'children': [
              {
                'path': 'key/ranges',
                'title': 'Keyranges',
                'children': [
                  {
                    'path': 'key/range/bounds',
                    'title': 'Bounds'
                  },
                  {
                    'path': 'key/range/direction',
                    'title': 'Direction'
                  }
                            ]
                        },
              {
                'path': 'key/cursors',
                'title': 'Cursors',
                'children': []
                        }]
                },
          {
            'path': 'indexes',
            'title': 'Indexes',
            'children': [
              {
                'path': 'index/creating',
                'title': 'Creating',
                'demos': [{
                  'title': 'Creating An Index Example: Simple Case',
                  'id': 'dashdb/kM4sQ'
                            }]
              },
              {
                'path': 'index/getting',
                'title': 'Getting',
                'demos': [{
                  'title': 'Getting An Index Example: Simple Case',
                  'id': 'dashdb/2vqYW'
                            }]
              },
              {
                'path': 'index/iterating',
                'title': 'Iterating',
                'demos': [{
                  'title': 'Getting Multiple Indexes Example: Simple Case',
                  'id': 'dashdb/2FmJg'
                            }]
              },
              {
                'path': 'index/removing',
                'title': 'Removing',
                'demos': [{
                  'title': 'Removing An Index Example: Simple Case',
                  'id': 'dashdb/2td5q'
                            }]
                        }
                    ]
                },
          {
            'path': 'entries',
            'title': 'Entries',
            'children': [
              {
                'path': 'entry/adding',
                'title': 'Adding',
                'demos': [{
                  'title': 'Adding An Object To An Object Store Example: Simple Case',
                  'id': 'dashdb/LD42e'
                            }]
              },
              {
                'path': 'entry/getting',
                'title': 'Getting',
                'demos': [{
                    'title': 'Getting An Object From An Object Store Example: Simple Case',
                    'id': 'dashdb/ALXu8'
                            },
                  {
                    'title': 'Getting Multiple Objects From A Database Example: Simple Case',
                    'id': 'dashdb/R8ZL4'
                                }]
              },
              {
                'path': 'entry/putting',
                'title': 'Putting',
                'demos': [{
                  'title': 'Putting An Object Into An Object Store Example: Simple Case',
                  'id': 'dashdb/zHLWL'
                            }]
              },
              {
                'path': 'entry/removing',
                'title': 'Removing',
                'demos': [{
                    'title': 'Removing An Object From An Object Store Example: Simple Case',
                    'id': 'dashdb/Gb2CC'
                            },
                  {
                    'title': 'Removing Multiple Objects From A Database Example: Simple Case',
                    'id': 'dashdb/H6r9x'
                                }]
              },
              {
                'path': 'entry/updating',
                'title': 'Updating',
                'demos': [{
                  'title': 'Updating Multiple Objects In A Database Example: Simple Case',
                  'id': 'dashdb/dqx4R'
                            }]
              }
                    ]
                },
            ]
        }
    ];
    $scope.emptyPath = function () {
      return '' === $scope.currentTopic();
    };
    var getPath = function (path) {
      return ['/documentation/', path, '.md'].join('');
    }
    $scope.documentContent = function (path) {
      return $templateCache.get(getPath(path))[1];
    }
    $scope.currentDocument = function () {
      var topic = $scope.currentTopic(),
        found = false;
      _.map($scope.documents, function (item) {
        if (item.path === topic) {
          found = item;
          return;
        }
        if (item.children) {
          _.map(item.children, function (item2) {
            if (item2.path === topic) {
              found = item2;
              return;
            }
            if (item2.children) {
              _.map(item2.children, function (item3) {
                if (item3.path === topic) {
                  found = item3;
                  return;
                }
                if (item3.children) {
                  _.map(item3.children, function (item4) {
                    if (item4.path === topic) {
                      found = item4;
                      return;
                    }
                  });
                }
              });
            }
          });
        }
      });
      return found;
    }
    var process = function (item) {
      $http.get(getPath(item.path), {
        cache: $templateCache
      });
      if (!item.children) {
        return;
      } else {
        _.map(item.children, function (datum) {
          process(datum);
        });
      }
    };
    _.map($scope.documents, process);
}]);
dashApp.controller('dashAppDocsContentController', ['$routeParams', '$scope',
  function ($routeParams, $scope) {
    $scope.pathLevel = function (obj) {
      var current = $scope.currentTopic();
      return (true === obj.
        default && '' === current) || obj.path === current;
    };
}]);
dashApp.controller('dashAppDocsSidebarController', ['$routeParams', '$scope',
  function ($routeParams, $scope) {}]);
dashApp.controller('dashAppDocsDemosController', ['$scope', '$sce',
  function ($scope, $sce) {
    $scope.demos = function () {
      var current = $scope.currentDocument(),
        queue = current.demos || [];
      _.map(current.children || [], function (child) {
        queue.push.apply(queue, child.demos || []);
      });
      return queue;
    };
    $scope.demoUrl = function (demo) {
      return $sce.trustAsResourceUrl('http://jsfiddle.net/' + demo.id + '/embedded');
    };
}]);
dashApp.directive('dashSplash', ['dashAppSplashBroadcast', 'dashWorkerService',
  function (dashAppSplashBroadcast, dashWorkerService) {
    return {
      scope: {},
      restrict: 'AE',
      compile: function () {
        return function link(scope, element, attrs) {};
      }
    };
}]);
dashApp.factory('dashAppSplashBroadcast', function () {
  queue = [];
  return {
    current: function (data) {
      var x = 0,
        xlen = queue.length;
      for (x = 0; x < xlen; x += 1) {
        queue[x].apply(queue[x], [data]);
      }
    },
    subscribe: function (cb) {
      queue.push(cb);
    },
    statistics: function (stats) {
      console.log('stats', stats);
    }
  };
});
dashApp.controller('dashAppSplashController', ['$scope', '$http',
  function ($scope, $http) {
    //does nothing
}]);
dashApp.directive('dashSplashOverlay', ['$q', '$http', '$timeout', 'dashAppSplashBroadcast', 'dashWorkerService',
  function ($q, $http, $timeout, dashAppSplashBroadcast, dashWorkerService) {
    return {
      scope: {},
      restrict: 'AE',
      templateUrl: '/docs/templates/overlay.html',
      compile: function () {
        var el = document.createElement('div'),
          pid;
        el.setAttribute('id', 'dash-splash-container');
        return function link(scope, element, attrs) {
          var statsObj = {},
            system = IMDBSystem(el, $('#dash-splash-overlay').width(), $('#dash-splash-overlay').height(), function (data) {
              if (!data) {
                return;
              }
              dash.get.entry({
                database: 'dash-demo',
                store: 'imdb',
                key: data,
                patch: function(state) {
                  return state;
                },
                map: function (item) {
                  item.se = item.se ? item.se + ' (' + item.id + ')' : item.id
                  return item;
                },
                cache: true,
                stats: true,
                forecast: false,
                store_key_path: 'id',
                diff: true,
                changes: function (state) {
                  console.log('CHANGES', state);
                }
              })
              (function (context) {
                if (context.statistics) {
                  statsObj = context.statistics;
                }
                dashAppSplashBroadcast.current(context.entry);
                if (pid) {
                  clearTimeout(pid);
                }
                pid = setTimeout(function () {
                  scope.$apply(function () {
                    scope.data = {
                      se: '',
                      ep: ''
                    };
                    scope.statsDisplay = {
                      prettyRate: '0/second',
                      prettyAvg: '0/second',
                      prettyElapsed: '00:00',
                      prettyRemain: '00:00',
                      complete: 0,
                      total: 0
                    };
                  });
                }, 3000);
              }, function (context) {
                console.log('missing entry', context);
              });
            }),
            layout = system.layout;
          element[0].appendChild(el);
          scope.data = {
            se: '',
            ep: ''
          };
          scope.range = 2014;
          scope.sort = 'from';
          scope.visuals = true;
          scope.field = 'thousand';
          scope.verb = 'explore';
          scope.statsDisplay = {
            prettyRate: '0/second',
            prettyAvg: '0/second',
            prettyElapsed: '00:00',
            prettyRemain: '00:00',
            complete: 0,
            total: 0
          };
          scope.stats = function () {
            return 'dash is ready';
          };
          scope.estimate = function () {
            if ('search' === scope.verb || 'remove' === scope.verb || hasDownloaded(scope.downloaded, scope.range, scope.sort)) {
              limit = totalDownloaded(scope.downloaded, scope.range, scope.sort);
              if ('million' === field && limit > 1000000) {
                limit = 1000000;
              } else if ('hundredthousand' === field && limit > 100000) {
                limit = 100000;
              } else if ('tenthousand' === field && limit > 10000) {
                limit = 10000;
              } else if ('thousand' === field && limit > 1000) {
                limit = 1000;
              }
              return limit.toString() + ' entries';
            }
            var values = [],
              start = false,
              file;
            if ('from' === scope.sort) {
              values = [scope.files[scope.range]];
            } else {
              for (file in scope.files) {
                if (false === start && scope.files.hasOwnProperty(file)) {
                  if (file === scope.range.toString()) {
                    start = true;
                  }
                }
                if (start && false === scope.downloaded[file]) {
                  values.push(scope.files[file]);
                }
              }
            }
            var x = 0,
              xlen = values.length,
              xitem, total = 0;
            for (x = 0; x < xlen; x += 1) {
              xitem = values[x].filesize;
              var cut = xitem.replace(/K$/, '');
              if (cut !== xitem) {
                cut = parseInt(cut, 10);
                total += cut * 1024;
              } else {
                cut = xitem.replace(/M$/, '');
                if (cut !== xitem) {
                  cut = parseInt(cut, 10);
                  total += cut * 1048576;
                } else {
                  cut = parseInt(cut, 10);
                  total += cut;
                }
              }
            }
            if (total < 1024) {
              return (total).toString() + 'B download';
            } else if (total < 1048576) {
              return Math.floor(total / 1024).toString() + 'KB download';
            } else {
              return Math.round(total / 1048576).toString() + 'MB download';
            }
          };
          scope.files = {
            '1880': {
              'filecount': '1',
              'filesize': '79'
            },
            '1881': {
              'filecount': '0',
              'filesize': '0'
            },
            '1882': {
              'filecount': '0',
              'filesize': '0'
            },
            '1883': {
              'filecount': '0',
              'filesize': '0'
            },
            '1884': {
              'filecount': '0',
              'filesize': '0'
            },
            '1885': {
              'filecount': '0',
              'filesize': '0'
            },
            '1886': {
              'filecount': '0',
              'filesize': '0'
            },
            '1887': {
              'filecount': '1',
              'filesize': '82'
            },
            '1888': {
              'filecount': '5',
              'filesize': '364'
            },
            '1889': {
              'filecount': '2',
              'filesize': '198'
            },
            '1890': {
              'filecount': '5',
              'filesize': '374'
            },
            '1891': {
              'filecount': '8',
              'filesize': '580'
            },
            '1892': {
              'filecount': '9',
              'filesize': '589'
            },
            '1893': {
              'filecount': '2',
              'filesize': '134'
            },
            '1894': {
              'filecount': '93',
              'filesize': '6429'
            },
            '1895': {
              'filecount': '102',
              'filesize': '7756'
            },
            '1896': {
              'filecount': '650',
              'filesize': '49067'
            },
            '1897': {
              'filecount': '1133',
              'filesize': '86257'
            },
            '1898': {
              'filecount': '1641',
              'filesize': '126334'
            },
            '1899': {
              'filecount': '1644',
              'filesize': '130673'
            },
            '1900': {
              'filecount': '1692',
              'filesize': '135274'
            },
            '1901': {
              'filecount': '1657',
              'filesize': '135629'
            },
            '1902': {
              'filecount': '1651',
              'filesize': '133894'
            },
            '1903': {
              'filecount': '2501',
              'filesize': '197964'
            },
            '1904': {
              'filecount': '1681',
              'filesize': '133077'
            },
            '1905': {
              'filecount': '1465',
              'filesize': '118787'
            },
            '1906': {
              'filecount': '1344',
              'filesize': '104630'
            },
            '1907': {
              'filecount': '1583',
              'filesize': '116504'
            },
            '1908': {
              'filecount': '2523',
              'filesize': '185237'
            },
            '1909': {
              'filecount': '2941',
              'filesize': '213073'
            },
            '1910': {
              'filecount': '3993',
              'filesize': '287878'
            },
            '1911': {
              'filecount': '5363',
              'filesize': '385301'
            },
            '1912': {
              'filecount': '7169',
              'filesize': '511932'
            },
            '1913': {
              'filecount': '8328',
              'filesize': '591839'
            },
            '1914': {
              'filecount': '7773',
              'filesize': '554111'
            },
            '1915': {
              'filecount': '7405',
              'filesize': '523955'
            },
            '1916': {
              'filecount': '5490',
              'filesize': '387773'
            },
            '1917': {
              'filecount': '4098',
              'filesize': '287612'
            },
            '1918': {
              'filecount': '3326',
              'filesize': '233720'
            },
            '1919': {
              'filecount': '3300',
              'filesize': '230726'
            },
            '1920': {
              'filecount': '3651',
              'filesize': '253766'
            },
            '1921': {
              'filecount': '3280',
              'filesize': '228619'
            },
            '1922': {
              'filecount': '2809',
              'filesize': '194633'
            },
            '1923': {
              'filecount': '2364',
              'filesize': '163426'
            },
            '1924': {
              'filecount': '2394',
              'filesize': '164794'
            },
            '1925': {
              'filecount': '2578',
              'filesize': '176339'
            },
            '1926': {
              'filecount': '2620',
              'filesize': '181211'
            },
            '1927': {
              'filecount': '2644',
              'filesize': '181856'
            },
            '1928': {
              'filecount': '2567',
              'filesize': '175460'
            },
            '1929': {
              'filecount': '2562',
              'filesize': '175859'
            },
            '1930': {
              'filecount': '2318',
              'filesize': '158537'
            },
            '1931': {
              'filecount': '2294',
              'filesize': '155849'
            },
            '1932': {
              'filecount': '2264',
              'filesize': '154744'
            },
            '1933': {
              'filecount': '2124',
              'filesize': '145439'
            },
            '1934': {
              'filecount': '2291',
              'filesize': '157639'
            },
            '1935': {
              'filecount': '2276',
              'filesize': '156300'
            },
            '1936': {
              'filecount': '2511',
              'filesize': '172571'
            },
            '1937': {
              'filecount': '2556',
              'filesize': '176819'
            },
            '1938': {
              'filecount': '2511',
              'filesize': '172950'
            },
            '1939': {
              'filecount': '2309',
              'filesize': '155597'
            },
            '1940': {
              'filecount': '1989',
              'filesize': '133319'
            },
            '1941': {
              'filecount': '1991',
              'filesize': '134545'
            },
            '1942': {
              'filecount': '1924',
              'filesize': '129786'
            },
            '1943': {
              'filecount': '1706',
              'filesize': '115224'
            },
            '1944': {
              'filecount': '1591',
              'filesize': '106442'
            },
            '1945': {
              'filecount': '1528',
              'filesize': '102607'
            },
            '1946': {
              'filecount': '1772',
              'filesize': '119063'
            },
            '1947': {
              'filecount': '2047',
              'filesize': '138628'
            },
            '1948': {
              'filecount': '2604',
              'filesize': '180072'
            },
            '1949': {
              'filecount': '3589',
              'filesize': '258345'
            },
            '1950': {
              'filecount': '4494',
              'filesize': '337956'
            },
            '1951': {
              'filecount': '5414',
              'filesize': '416974'
            },
            '1952': {
              'filecount': '6050',
              'filesize': '471326'
            },
            '1953': {
              'filecount': '6487',
              'filesize': '513967'
            },
            '1954': {
              'filecount': '6929',
              'filesize': '555062'
            },
            '1955': {
              'filecount': '7788',
              'filesize': '631661'
            },
            '1956': {
              'filecount': '8340',
              'filesize': '672694'
            },
            '1957': {
              'filecount': '9268',
              'filesize': '743843'
            },
            '1958': {
              'filecount': '9585',
              'filesize': '762883'
            },
            '1959': {
              'filecount': '10290',
              'filesize': '822636'
            },
            '1960': {
              'filecount': '10809',
              'filesize': '869289'
            },
            '1961': {
              'filecount': '10742',
              'filesize': '852910'
            },
            '1962': {
              'filecount': '9925',
              'filesize': '779863'
            },
            '1963': {
              'filecount': '10972',
              'filesize': '861186'
            },
            '1964': {
              'filecount': '11040',
              'filesize': '865431'
            },
            '1965': {
              'filecount': '12605',
              'filesize': '978927'
            },
            '1966': {
              'filecount': '13447',
              'filesize': '1048568'
            },
            '1967': {
              'filecount': '14348',
              'filesize': '1087987'
            },
            '1968': {
              'filecount': '13569',
              'filesize': '1020474'
            },
            '1969': {
              'filecount': '98499',
              'filesize': '7171766'
            },
            '1970': {
              'filecount': '14375',
              'filesize': '997882'
            },
            '1971': {
              'filecount': '13987',
              'filesize': '1031525'
            },
            '1972': {
              'filecount': '13186',
              'filesize': '965233'
            },
            '1973': {
              'filecount': '14006',
              'filesize': '1031337'
            },
            '1974': {
              'filecount': '13685',
              'filesize': '1010484'
            },
            '1975': {
              'filecount': '13921',
              'filesize': '1019735'
            },
            '1976': {
              'filecount': '13926',
              'filesize': '1028081'
            },
            '1977': {
              'filecount': '13917',
              'filesize': '1035434'
            },
            '1978': {
              'filecount': '14209',
              'filesize': '1056863'
            },
            '1979': {
              'filecount': '14846',
              'filesize': '1100010'
            },
            '1980': {
              'filecount': '14632',
              'filesize': '1081242'
            },
            '1981': {
              'filecount': '14137',
              'filesize': '1039765'
            },
            '1982': {
              'filecount': '14424',
              'filesize': '1058616'
            },
            '1983': {
              'filecount': '15504',
              'filesize': '1137485'
            },
            '1984': {
              'filecount': '16953',
              'filesize': '1248905'
            },
            '1985': {
              'filecount': '18714',
              'filesize': '1386288'
            },
            '1986': {
              'filecount': '19504',
              'filesize': '1451236'
            },
            '1987': {
              'filecount': '20369',
              'filesize': '1520735'
            },
            '1988': {
              'filecount': '19780',
              'filesize': '1459797'
            },
            '1989': {
              'filecount': '21422',
              'filesize': '1584441'
            },
            '1990': {
              'filecount': '22577',
              'filesize': '1674534'
            },
            '1991': {
              'filecount': '23461',
              'filesize': '1750247'
            },
            '1992': {
              'filecount': '24739',
              'filesize': '1837145'
            },
            '1993': {
              'filecount': '26703',
              'filesize': '2000643'
            },
            '1994': {
              'filecount': '30339',
              'filesize': '2258967'
            },
            '1995': {
              'filecount': '36109',
              'filesize': '2688222'
            },
            '1996': {
              'filecount': '36588',
              'filesize': '2714163'
            },
            '1997': {
              'filecount': '40094',
              'filesize': '2975775'
            },
            '1998': {
              'filecount': '46345',
              'filesize': '3417832'
            },
            '1999': {
              'filecount': '50993',
              'filesize': '3756717'
            },
            '2000': {
              'filecount': '53386',
              'filesize': '3920892'
            },
            '2001': {
              'filecount': '58935',
              'filesize': '4320285'
            },
            '2002': {
              'filecount': '62697',
              'filesize': '4696932'
            },
            '2003': {
              'filecount': '68791',
              'filesize': '5154423'
            },
            '2004': {
              'filecount': '85372',
              'filesize': '6403047'
            },
            '2005': {
              'filecount': '96441',
              'filesize': '7278718'
            },
            '2006': {
              'filecount': '109556',
              'filesize': '8320602'
            },
            '2007': {
              'filecount': '121155',
              'filesize': '9236684'
            },
            '2008': {
              'filecount': '126480',
              'filesize': '9676631'
            },
            '2009': {
              'filecount': '134360',
              'filesize': '10330826'
            },
            '2010': {
              'filecount': '148216',
              'filesize': '11512087'
            },
            '2011': {
              'filecount': '168799',
              'filesize': '13209276'
            },
            '2012': {
              'filecount': '178812',
              'filesize': '14080908'
            },
            '2013': {
              'filecount': '169119',
              'filesize': '13265965'
            },
            '2014': {
              'filecount': '27651',
              'filesize': '2003925'
            },
            '2015': {
              'filecount': '2388',
              'filesize': '157804'
            },
            '2016': {
              'filecount': '311',
              'filesize': '20739'
            },
            '2017': {
              'filecount': '62',
              'filesize': '4162'
            },
            '2018': {
              'filecount': '18',
              'filesize': '1303'
            },
            '2019': {
              'filecount': '4',
              'filesize': '294'
            },
            '2020': {
              'filecount': '2',
              'filesize': '150'
            },
            '2021': {
              'filecount': '1',
              'filesize': '67'
            }
          };
          scope.downloaded = JSON.parse(localStorage.getItem('dash-demo-downloaded')) || {};
          var dirty = false,
            attr;
          for (attr in scope.files) {
            if (scope.files.hasOwnProperty(attr) && undefined === scope.downloaded[attr]) {
              scope.downloaded[attr] = false;
              dirty = true;
            }
          }
          if (dirty) {
            localStorage.setItem('dash-demo-downloaded', JSON.stringify(scope.downloaded));
          }
          dirty = false;
          scope.progress = JSON.parse(localStorage.getItem('dash-demo-progress')) || {};
          for (attr in scope.files) {
            if (scope.files.hasOwnProperty(attr) && undefined === scope.progress[attr]) {
              scope.progress[attr] = false;
              dirty = true;
            }
          }
          if (dirty) {
            localStorage.setItem('dash-demo-progress', JSON.stringify(scope.progress));
          }
          scope.sorts = [{
            name: 'from',
            display: 'from',
            selected: 'from' === scope.sort ? 'selected' : '',
            enabled: true
          }, {
            name: 'since',
            display: 'since',
            selected: 'since' === scope.sort ? 'selected' : '',
            enabled: true
          }];
          scope.fields = [{
            name: 'everything',
            display: 'all entries',
            selected: 'everything' === scope.field ? 'selected' : '',
            enabled: true
          }, {
            name: 'hundredthousand',
            display: '100k entries',
            selected: 'hundredthousand' === scope.field ? 'selected' : '',
            enabled: true
          }, {
            name: 'tenthousand',
            display: '10k entries',
            selected: 'tenthousand' === scope.field ? 'selected' : '',
            enabled: true
          }, {
            name: 'thousand',
            display: '1k entries',
            selected: (null === scope.field || 'thousand' === scope.field) ? 'selected' : '',
            enabled: true
          }];
          scope.verbs = [{
            name: 'download',
            display: 'download',
            selected: 'download' === scope.verb ? 'selected' : '',
            enabled: true
          }, {
            name: 'explore',
            display: 'explore',
            selected: 'explore' === scope.verb ? 'selected' : '',
            enabled: true
          }, {
            name: 'search',
            display: 'search',
            selected: 'search' === scope.verb ? 'selected' : '',
            enabled: true
          }, {
            name: 'remove',
            display: 'remove',
            selected: 'remove' === scope.verb ? 'selected' : '',
            enabled: true
          }];
          scope.numFields = function () {
            return hasDownloaded(scope.range) ? 3 : 1;
          };
          scope.numEntries = function () {
            return totalDownloaded(scope.downloaded, scope.range, scope.sort);
          };
          var hasDownloaded = function (range) {
            var attr;
            for (attr in scope.downloaded) {
              if (scope.downloaded.hasOwnProperty(attr)) {
                if (parseInt(attr, 10) >= range) {
                  if (false === scope.downloaded[attr]) {
                    return false;
                  }
                  if ('from' === scope.sort) {
                    return true;
                  }
                }
              }
            }
            return true;
          };
          var totalDownloaded = function (downloaded, range, sort) {
            var attr, total = 0;
            for (attr in downloaded) {
              if (downloaded.hasOwnProperty(attr)) {
                if (parseInt(attr, 10) >= range) {
                  if (false === downloaded[attr]) {
                    continue;
                  }
                  if ('from' === sort) {
                    return downloaded[attr];
                  } else {
                    total += downloaded[attr];
                  }
                }
              }
            }
            return downloaded;
          };
          scope.$watch('visuals', function (newer, older) {
            if (false === newer) {
              system.reset();
            }
          });
          scope.$watch('range', function (newer, older) {
            var is_installed, x, xlen = scope.verbs.length;
            if (true === hasDownloaded(newer)) {
              is_installed = true;
            } else {
              is_installed = false;
            }
            for (x = 0; x < xlen; x += 1) {
              if ('search' === scope.verbs[x].name || 'remove' === scope.verbs[x].name) {
                scope.verbs[x].enabled = is_installed;
              }
            }
            if (is_installed) {
              xlen = scope.fields.length;
              var field,
                total = totalDownloaded(scope.downloaded, scope.range, scope.sort);
              for (x = 0; x < xlen; x += 1) {
                field = scope.fields[x].name;
                if ('million' === field && total < 1000000) {
                  scope.fields[x].enabled = false;
                } else if ('hundredthousand' === field && total < 100000) {
                  scope.fields[x].enabled = false;
                } else if ('tenthousand' === field && total < 10000) {
                  scope.fields[x].enabled = false;
                } else if ('thousand' === field && total < 1000) {
                  scope.fields[x].enabled = false;
                }
              }
            }
            console.log('range changed', newer, older);
          });
          scope.$watch('verb', function (newer, older) {
            console.log('verb changed', newer, older);
          });
          scope.$watch('field', function (newer, older) {
            console.log('field changed', newer, older);
          });
          scope.$watch('sort', function (newer, older) {
            console.log('sort changed', newer, older);
          });
          $('#dash-demo-overlay-marketing').hover(function () {
            system.controls(false);
          }, function () {
            system.controls(true);
          });
          scope.verb = 'explore';
          scope.go = function () {
            console.log('GO', scope.field, scope.range, scope.query, scope.sort, scope.verb);
            system.reset();
            $('.dash-demo-overlay-marketing-button').blur();
            var limit = null, //default: everything
              field = scope.field;
            if ('million' === field) {
              limit = 1000000;
            } else if ('hundredthousand' === field) {
              limit = 100000;
            } else if ('tenthousand' === field) {
              limit = 10000;
            } else if ('thousand' === field) {
              limit = 1000;
            }
            var ctx = {}, callLayout = function () {
                doLayout({
                  range: scope.range,
                  limit: limit,
                  query: scope.query,
                  sort: scope.sort,
                  verb: scope.verb
                });
              };
            if ('remove' !== scope.verb && 'search' !== scope.verb) {
              callLayout();
            } else if ('remove' === scope.verb) {
              var ctx = {
                database: 'dash-demo',
                store: 'imdb',
                auto_increment: true,
                store_key_path: 'id',
                index: 'season',
                index_key_path: 'sy',
                limit: limit,
                key: new Date('1/1/' + scope.range).getTime()
              },
                dash_promise = dashWorkerService.remove.entries(ctx),
                start_promise = new Date().getTime();
              dash_promise.then(function (context) {
                //xxx
                var values = [],
                  start = false,
                  file;
                if ('from' === scope.sort) {
                  values = [scope.files[scope.range]];
                } else {
                  for (file in scope.files) {
                    if (false === start && scope.files.hasOwnProperty(file)) {
                      if (file === scope.range.toString()) {
                        start = true;
                      }
                    }
                    if (start) {
                      scope.progress[file] = false;
                      if ('from' === scope.sort) {
                        return;
                      }
                    }
                  }
                }
                statsUpdate(context.statistics);
              }, function (context) {
                console.log('dash promise rejected', context);
              }, function (context) {
                system.remove(context);
                statsUpdate(context.statistics);
                //system.cameraMod( 'z', 2, 50000, 10 );
                //system.cameraMod( 'z', 1, 10000, 0 );
              });
            } else {
              var ctx = {
                database: 'dash-demo',
                store: 'imdb',
                auto_increment: true,
                store_key_path: 'id',
                index: 'season',
                stats: true,
                map: function (current) {
                  return { 
                    count: 1
                  };
                  return item;
                },
                reduce: function (intermediate, current) {
                  if (isNaN(intermediate)) {
                    intermediate = 0;
                  }
                  return intermediate += current.total;
                },
                progress: true,
                index_key_path: 'sy',
                limit: limit,
                match: {
                  se: new RegExp(scope.query),
                  ep: RegExp(scope.query)
                },
                any: true,
                key: new Date('1/1/' + scope.range).getTime()
              },
                q = new RegExp(scope.query),
                //dash_promise = dashWorkerService.get.entries(ctx),
                dash_promise = dash.get.entries(ctx),
                start_promise = new Date().getTime();
              //dash_promise.then( function(context) {
              dash_promise(function (context) {
                console.log('searched all', context.amount);
                statsObj = context.statistics;
                statsUpdate(context.statistics);
              }, function (context) {
                console.log('dash promise rejected', context);
              }, function (context) {
                console.log('found item', context);
                context.id = context.primary_key;
                statsObj = context.statistics;
                if (true === scope.visuals) {
                  system.add(context);
                }
                statsUpdate(context.statistics);
                //system.cameraMod( 'z', 2, 50000, 10 );
                //system.cameraMod( 'z', 1, 10000, 0 );
              });
            }
          };
          var last_time = new Date().getTime(),
            first_time = null,
            statsProc = null,
            statsTimeout = 1000,
            wasCompleted = false,
            statsFunc = function () {
              scope.$apply(function () {
                scope.statsDisplay = scope.statsDisplay || {};
                if (!statsObj || true === statsObj.clear || !statsObj.request || !statsObj.request.metrics) {
                  scope.statsDisplay.total = 0;
                  scope.statsDisplay.complete = 0;
                  scope.statsDisplay.prettyElapsed = '';
                  scope.statsDisplay.prettyRemain = '';
                  scope.statsDisplay.prettyAvg = '';
                  scope.statsDisplay.prettyRate = '';
                } else {
                  scope.statsDisplay.total = statsObj.request.metrics.total.expected;
                  scope.statsDisplay.complete = statsObj.request.metrics.total.requests;
                  scope.statsDisplay.prettyElapsed = statsObj.request.display.actual.total;
                  scope.statsDisplay.prettyRemain = statsObj.request.display.remaining.total;
                  scope.statsDisplay.prettyAvg = statsObj.request.display.thoroughput_average.total;
                  scope.statsDisplay.prettyRate = statsObj.request.display.thoroughput_rate.total;
                  //scope.statsDisplay.prettyAvg = statsObj.request.prettySpeedAverage.total;
                  //scope.statsDisplay.prettyRate = statsObj.request.prettySpeedRate.total;
                }
                statsUIProc = null;
              });
            },
            statsUIProc,
            statsUpdate = function (stats) {
              statsObj = stats;
              if (!statsUIProc) {
                statsUIProc = setTimeout(statsFunc, 100);
              }
            },
            doLayout = function (cmdargs) {
              var file, start = false,
                values = [];
              last_time = new Date().getTime();
              if ('from' === scope.sort) {
                if (false !== scope.progress[scope.range]) {
                  values.push([scope.range, (!scope.downloaded[scope.range] || scope.downloaded[scope.range] < scope.files[scope.range].filecount), scope.progress[scope.range]]);
                } else {
                  values.push([scope.range, (!scope.downloaded[scope.range] || scope.downloaded[scope.range] < scope.files[scope.range].filecount), null]);
                }
              } else {
                for (file in scope.downloaded) {
                  if (scope.downloaded.hasOwnProperty(file)) {
                    if (false === start) {
                      if (file === scope.range.toString()) {
                        start = true;
                      }
                    }
                    if (start) {
                      if (false !== scope.progress[file]) {
                        values.push([file, (!scope.downloaded[file] || scope.downloaded[file] < scope.files[file].filecount), scope.progress[file]]);
                      } else {
                        values.push([file, (!scope.downloaded[file] || scope.downloaded[file] < scope.files[file].filecount), null]);
                      }
                    }
                  }
                }
              }
              var deferred = $q.defer(),
                promise = deferred.promise,
                ndeferred, count = 0,
                queuedSave = null;
              queueSave = function () {
                if (!queuedSave) {
                  queuedSave = setTimeout(function () {
                    localStorage.setItem('dash-demo-downloaded', JSON.stringify(scope.downloaded));
                    localStorage.setItem('dash-demo-progress', JSON.stringify(scope.progress));
                    localStorage.setItem('dash-demo-progress', JSON.stringify(scope.progress));
                  }, 1000);
                }
              };
              var x = 0,
                xlen = values.length;
              for (x = 0; x < xlen; x += 1) {
                if (true === values[x][1]) {
                  promise = promise.then((function (attr, last_add) {
                    var deferred2 = $q.defer();
                    return function () {
                      var start = scope.range,
                        stacklist = [],
                        start_promise = new Date().getTime(),
                        stack_count = 0,
                        addCount = 0,
                        addLimit = cmdargs.limit,
                        stack_length = 0,
                        statistics = null,
                        in_progress = false,
                        processNext = function (context) {
                          if (0 === stacklist.length) {
                            deferred2.resolve({
                              range: attr,
                              count: stack_count,
                              skip: true
                            });
                          }
                          if (!in_progress && stacklist.length > 0) {
                            in_progress = true;
                            scope.statsData = scope.statsData || {};
                            doNext(stacklist.shift());
                            scope.downloaded[attr] = scope.downloaded[attr] || 0;
                            scope.downloaded[attr] += 1;
                            queueSave();
                            deferred2.notify({
                              range: attr,
                              count: stack_count,
                              context: context
                            });
                          }
                        },
                        doNext = function (next) {
                          stack_count += 1;
                          dash.add.entry({
                            database: 'dash-demo',
                            store: 'imdb',
                            index: 'season',
                            index_key_path: 'sy',
                            auto_increment: true,
                            store_key_path: null,
                            data: next,
                            stats: true,
                            forecast: false,
                            statistics: statistics
                          })
                          (function (context) {
                            in_progress = false;
                            if (true === scope.visuals) {
                              system.add({
                                id: context.key
                              });
                            }
                            statistics = context.statistics;
                            statsUpdate(statistics);
                            scope.progress[attr] = context;
                            queueSave();
                            if (!addLimit || (addCount++ < addLimit)) {
                              processNext(context);
                            }
                          }, function (context) {
                            in_progress = false;
                            processNext(context);
                          });
                        };
                      //xxx
                      var field = scope.field,
                        limit = null;
                      if ('million' === field) {
                        limit = 1000000;
                      } else if ('hundredthousand' === field) {
                        limit = 100000;
                      } else if ('tenthousand' === field) {
                        limit = 10000;
                      } else if ('thousand' === field) {
                        limit = 1000;
                      }
                      $http({
                        method: 'GET',
                        url: '/docs/demo/data/' + attr + '.json'
                      }).success(function (data, status, headers, config) {
                        var x = 0,
                          xlen = data.length,
                          placemark = false,
                          sofar = 0;
                        for (x = 0; x < xlen; x += 1) {
                          if (null === last_add && (false === scope.downloaded[attr] || x > scope.downloaded[attr])) {
                            if (!limit || sofar < limit) {
                              total_count = stacklist.push(data[x]);
                              sofar += 1;
                            }
                          } else {
                            if (true === placemark || (false !== scope.downloaded[attr] && x > scope.downloaded[attr])) {
                              if (!limit || sofar < limit) {
                                total_count = stacklist.push(data[x]);
                                sofar += 1;
                              }
                            } else {
                              if (null !== last_add && data[x].ep === last_add.data.ep && data[x].ey === last_add.data.ey && data[x].se === last_add.data.se && data[x].sy === last_add.data.sy) {
                                placemark = true;
                              }
                            }
                          }
                        }
                        stack_length = stacklist.length;
                        processNext();
                      }).error(function (data, status, headers, config) {
                        console.log('error', data, status, headers, config);
                      });
                      return deferred2.promise;
                    }
                  }(values[x][0], values[x][2])));
                } else {
                  promise = promise.then((function (attr) {
                    var deferred2 = $q.defer();
                    return function () {
                      deferred2.notify({
                        range: attr
                      });
                      deferred2.resolve({
                        range: attr
                      });
                      return deferred2.promise;
                    }
                  }(values[x][0])));
                }
              }
              promise.then(function (args) {
                if (true === args.skip) {
                  return;
                }
                var ctx = {
                  database: 'dash-demo',
                  store: 'imdb',
                  auto_increment: true,
                  store_key_path: 'id',
                  stats: true,
                  progress: true,
                  forecast: false,
                  /*map: function (current) {
                    return (current && current.se) ? current.se.split(/\s/) : []
                  },
                  reduce: function (intermediate, current) {
                    if (!intermediate) {
                      intermediate = {};
                    }
                    for( var x = 0; x < current.length; x += 1) {
                      intermediate[ current[x] ] = intermediate[ current[x] ] || 0;
                      intermediate[ current[x] ] += 1;
                    }
                    return intermediate;
                  },*/
                  patch: [ function(ctx) {
                    ctx.context.limit = 1337;
                    return ctx;
                  }, function(ctx) {
                    if (ctx.context.entry) {
                      ctx.context.entry.foo = 'bar';
                    }
                    return ctx;
                  }],
                  shorthand: {
                    'se': 'season',
                    'ep': 'episode'
                  },
                  live: true,
                  index: 'season',
                  index_key_path: 'sy',
                  index_key: new Date('1/1/' + args.range).getTime(),
                  limit: cmdargs.limit
                },
                  //dash_promise = dashWorkerService.get.entries(ctx),
                  dash_promise = dash.get.entries(ctx),
                  start_promise = new Date().getTime();
                //dash_promise.then( function(context) {
                dash_promise(function (context) {
                  console.log('promiss success',context);
                  statsUpdate(context.statistics);
                }, function (context) {
                  console.log('dash promise rejected', context);
                }, function (context) {
                  if (true === scope.visuals) {
                    system.add(context.entry);
                  }
                  _.throttle(function() {
                    statsUpdate(context.statistics);
                  }, 100);
                  //system.cameraMod( 'z', -2, 50000, 10 );
                  //system.cameraMod( 'z', 1, 10000, 0 );
                });
              }, null, function (args) {
                //console.log('notify',args);
              });
              deferred.resolve();
            };
          dashAppSplashBroadcast.subscribe(function (data) {
            scope.data = data;
            statsUpdate(statsObj);
          });
        };
      }
    };
}]);
dashApp.directive('markdown', function () {
  var converter = new Showdown.converter();
  return {
    restrict: 'AE',
    link: function (scope, element, attrs) {
      if (attrs.markdown) {
        scope.$watch(attrs.markdown, function (newVal) {
          if (!newVal) {
            return;
          }
          var html = converter.makeHtml(newVal);
          element.html(html);
        });
      } else {
        var text = element.text(),
          html = text ? converter.makeHtml(element.text()) : '';
        element.html(html);
      }
    }
  };
});
dashApp.factory('dashWorkerService', ['$q',
  function ($q) {
    var worker = new Worker('/dist/dash.js'),
      queue = {},
      methods = [
       'add.entry',
       'count.entries',
       'get.database',
       'get.databases',
       'get.store',
       'get.stores',
       'get.index',
       'get.indexes',
       'get.entry',
       'get.entries',
       'update.entries',
       'put.entry',
       'clear.store',
       'remove.database',
       'remove.store',
       'remove.index',
       'remove.entry',
       'remove.entries'
     ],
      register = function (message, context, success, error, notify) {
        var random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
          count = 16,
          x = 0,
          xlength = 0,
          strlen = random.length,
          str = [],
          id;
        for (x = 0; x < count; x += 1) {
          str.push(random[Math.floor(Math.random() * 100) % strlen]);
        }
        id = str.join('');
        queue[id] = {
          success: success,
          error: error,
          notify: notify
        };
        worker.postMessage({
          dash: message,
          context: context,
          uid: id
        });
      },
      send = function (message, context) {
        var deferred = $q.defer();
        register(message, context, function (data) {
          deferred.resolve(data);
        }, function (data) {
          deferred.reject(data);
        }, function (data) {
          deferred.notify(data);
        });
        return deferred.promise;
      },
      API = {},
      y = 0,
      ylen = methods.length,
      method,
      commands;
    worker.addEventListener('message', function (e) {
      var data = e.data,
        queued = queue[data.uid];
      if (undefined !== queued) {
        switch (e.data.type) {
        case 'success':
          if ('function' === typeof queued.success) {
            queued.success(data.context);
          }
          break;
          delete queue[data.uid];
        case 'error':
          if ('function' === typeof queued.error) {
            queued.error(data.context);
          }
          break;
          delete queue[data.uid];
        case 'notify':
          if ('function' === typeof queued.notify) {
            queued.notify(data.context);
          }
          break;
        default:
          break;
        }
      }
    });
    for (y = 0; y < methods.length; y += 1) {
      method = methods[y];
      commands = method.split('.');
      if (undefined === API[commands[0]]) {
        API[commands[0]] = {};
      }
      API[commands[0]][commands[1]] = (function (signature) {
        return function (context) {
          return send(signature, context);
        };
      }(method));
    }
    return API;
}]);