'use strict';

(function() {

  class MainController {

    constructor($http, $scope, socket) {
      this.$http = $http;
      this.socket = socket;
      this.stocks = [];
      this.chartType = true
      this.highlighted = {}
      this.sending = false

      this.myDate = new Date();
      this.minDate = new Date(
        this.myDate.getFullYear(),
        this.myDate.getMonth() - 2,
        this.myDate.getDate());
      this.maxDate = new Date(
        this.myDate.getFullYear(),
        this.myDate.getMonth(),
        this.myDate.getDate());
        this.data = []


        this.changeChart = function(){
          if(this.highlighted._id){
            console.log('sfjnsdkjfnsdjkfnsjkfnsdkjnfskjnfdksjn')
            this.options = this.candlestickBarChart
            console.log(this.options)
          }else if (this.chartType) {
            this.options = this.lineChart
          }else {
            this.options = this.cumulativeLineChart

          }
        }

        this.fill = function(){
          var that = this
          that.data = []
          var temp = []
          if(that.highlighted._id){
            temp = _.filter(that.stocks, function(stock){
              return stock._id === that.highlighted._id
            })

          }else{
             temp = that.stocks
          }

          _.each(temp, function(stock){
            that.data.push({key: stock.key,
                 values: _.filter(stock.values, function(value){
                   return value.date >= that.minDate.getTime() && value.date <= that.maxDate.getTime()

                 })
               })
             })
             console.log(that.data)
        }

      $scope.$on('$destroy', function() {
        socket.unsyncUpdates('stock');
      });


      this.lineChart = {
           chart: {
               type: 'lineChart',
               height: 450,
               margin : {
                   top: 20,
                   right: 20,
                   bottom: 60,
                   left: 75
               },
               x: function(d){ return d.date; },
               y: function(d){ return d.close; },
               useInteractiveGuideline: true,

               xAxis: {
                   tickFormat: function(d) {
                       return d3.time.format('%m/%d/%y')(new Date(d))
                   },
                   showMaxMin: false,
                   staggerLabels: false
               },
               yAxis: {
                 tickFormat: function(d){
                     return '$' + d3.format(',.2f')(d);
                 },

               }
           },
           title: {
               enable: true,
               text: 'Stock Tracker'
           },
           subtitle: {
               enable: true,
               text: 'Chart and share stock trends with your friends in real time!',
               css: {
                   'text-align': 'center',
                   'margin': '10px 13px 0px 7px'
               }
           }
       };

      this.candlestickBarChart = {
            chart: {
                type: 'candlestickBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 75
                },
                x: function(d){ return d.date; },
                y: function(d){ return d.close; },

                xAxis: {
                    tickFormat: function(d) {
                         return d3.time.format('%m/%d/%y')(new Date(d))
                    },
                    showMaxMin: false,
                    staggerLabels: false
                },

                yAxis: {
                    axisLabel: 'Price ($)',
                    tickFormat: function(d){
                        return '$' + d3.format(',.2f')(d);
                    },
                    showMaxMin: true
                }
            },
            title: {
                enable: true,
                text: 'Stock Tracker'
            },
            subtitle: {
                enable: true,
                text: 'Chart and share stock trends with your friends in real time!',
                css: {
                    'text-align': 'center',
                    'margin': '10px 13px 0px 7px'
                }
            }
        };

        this.cumulativeLineChart ={
            chart: {
                type: 'cumulativeLineChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 75
                },
                x: function(d){ return d.date; },
                y: function(d){ return d.close; },
                average: function(d) { return d.mean/100; },

                color: d3.scale.category10().range(),
                duration: 300,
                useInteractiveGuideline: true,
                clipVoronoi: true,

                xAxis: {
                    tickFormat: function(d) {
                        return d3.time.format('%m/%d/%y')(new Date(d))
                    },
                    showMaxMin: false,
                    staggerLabels: false
                },

                yAxis: {
                    axisLabel: 'Y Axis',
                    tickFormat: function(d){
                        return d3.format(',.1%')(d);
                    },
                    axisLabelDistance: 20
                }
            },
            title: {
                enable: true,
                text: 'Stock Tracker'
            },
            subtitle: {
                enable: true,
                text: 'Chart and share stock trends with your friends in real time!',
                css: {
                    'text-align': 'center',
                    'margin': '10px 13px 0px 7px'
                }
            }
        };

       this.options = this.changeChart()

}


    $onInit() {
      var that = this
      this.$http.get('/api/stocks')
        .then(response => {
          that.stocks = response.data
          that.fill()
          that.changeChart()
            this.socket.syncUpdates('stock', that.stocks, function(event, stock, stocks){
              that.fill()
            })
        });
    }

    addStock(stock) {
      var that = this
      if (stock) {
        that.sending = true
        this.$http.post('/api/stocks', {
          key: stock
        }).then(function(res){
          that.sending = false
        }, function(e){
          that.sending = false
        })
      }
      return null
    }

    highlight(stock){
      this.highlighted = {name: stock.name, _id: stock._id}
      this.fill()
      this.changeChart()
    }
    removeHighlighted(){
      this.highlighted = {}
      this.fill()
      this.changeChart()
    }


    deleteStock(stock) {
      this.$http.delete('/api/stocks/' + stock._id);
    }
  }

  angular.module('finalApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController
    });
})();
