'use strict';

/**
 * @ngdoc function
 * @name simplexApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the simplexApp
 */
angular.module('simplexApp')
        .factory('Tableau', function() {
            function Tableau(tab) {
                this.table = tab;
                this.m = tab.length; // rows
                this.n = tab[0].length; // columns
            }
            Tableau.prototype = {
                getTableau: function() {
                    return this.table
                },
                divideRow: function(rowIndex,denominator){
                    for (var i = 0; i < this.n; i++)
                        this.table[rowIndex][i] /= denominator;
                },
                addRowToRow: function(addToIndex,addWhatIndex,multiplier){
                    multiplier = typeof multiplier !== 'undefined' ? multiplier : 1;//Default 1
                    for (var i = 0; i < this.n; i++)
                        this.table[addToIndex][i] += this.table[addWhatIndex][i]*multiplier;
                }
            };
            return(Tableau);
        })
        .factory(
                'Simplex',
                function(Tableau) {
                    // Define the constructor function.
                    function Simplex(conditions) {
                        this.conditions = conditions;
                        var tab = [
                            [0, 1, 3, 1, 0, 0, 6],
                            [0, -1, 1, 0, 1, 0, 1],
                            [0, 3, -1, 0, 0, 1, 6],
                            [1, -1, -2, 0, 0, 0, 0],
                        ];
                        this.m = tab.length; // always start from 1 cause of f(x) basis
                        this.n = tab[0].length; // always end on m-1 cause of b vector
                        this.tableau = tab;
                        this.solve();
                    }


                    // Define the "instance" methods using the prototype
                    // and standard prototypal inheritance.
                    Simplex.prototype = {
                        solve: function() {
                            if (!this.isOptimal())
                            {
                                var pivotColumn = this.findPivotColumnIndex();
                                var pivotRow = this.findPivotRowIndex(pivotColumn);
                                var pivot = {
                                    row: pivotRow,
                                    column: pivotColumn
                                }
                            }
                            var tableaux = {
                                table: this.tableau,
                                pivot: pivot,
                                quotients: [
                                    2, 3, 4
                                ]
                            };
                            var it = [];
                            
                            it.push(Simplex.clone(tableaux));
                            var t = new Tableau(this.tableau);
                            t.addRowToRow(0,1,-3);
                            tableaux.table = t.getTableau();
                            t.addRowToRow(2,1);
                            tableaux.table = t.getTableau();
                            it.push(Simplex.clone(tableaux));
                            t.addRowToRow(3,1,2);
                            tableaux.table = t.getTableau();
                            it.push(Simplex.clone(tableaux));
                            tableaux.table = t.getTableau();
                            it.push(Simplex.clone(tableaux));
                            this.iterations = it;
                            this.isOptimal();
                        },
                        getIterations: function() {
                            return this.iterations;
                        },
                        isOptimal: function() {
                            for (var i = 1; i < this.n - 1; i++)
                                if (this.tableau[this.m - 1][i] < 0)
                                    return 0;
                            return 1;
                        },
                        findPivotColumnIndex: function() {
                            var minIndex = 1;
                            var vector = this.tableau[this.m - 1];
                            for (var i = 1; i < this.n - 1; i++) {
                                if (vector[i] < vector[minIndex])
                                    minIndex = i;
                            }
                            return minIndex;
                        },
                        findPivotRowIndex: function(columnIndex) {
                            var quotients = [];
                            var tableau = this.tableau;
                            var b = this.n - 1; // Index for b vector
                            for (var j = 0; j < this.m - 1; j++)
                                quotients.push(tableau[j][b] / tableau[j][columnIndex]);
                            var minIndex = undefined;
                            for (var i = 0; i < quotients.length; i++)
                                if (minIndex === undefined) {
                                    if (quotients[i] > 0)
                                        minIndex = i;
                                } else {
                                    if ((quotients[i] < quotients[minIndex]) && (quotients[i] > 0))
                                        minIndex = i;
                                }
                            return minIndex;


                            /*
                             var minIndex = 1;
                             var vector = this.tableau[this.m - 1];
                             for (var i = 1; i < this.n - 1; i++) {
                             if (vector[i] < vector[minIndex])
                             minIndex = i;
                             }
                             return minIndex;
                             */
                        },
                    };


                    // Define the "class" / "static" methods. These are
                    // utility methods on the class itself; they do not
                    /* have access to the "this" reference.
                     Friend.fromFullName = function( fullName ) {
                     
                     var parts = trim( fullName || "" ).split( /\s+/gi );
                     
                     return(
                     new Friend(
                     parts[ 0 ],
                     parts.splice( 0, 1 ) && parts.join( " " )
                     )
                     );
                     
                     
                     };*/


                    // Return constructor - this is what defines the actual
                    // injectable in the DI framework.
                    Simplex.clone = function(src){
                        return JSON.parse(JSON.stringify(src));
                    };
                    return(Simplex);

                }
        )
        .filter('range', function() {
            return function(input, total) {
                total = parseInt(total);
                for (var i = 0; i < total; i++)
                    input.push(i);
                return input;
            };
        })



        .controller('MainCtrl', function($scope, Simplex) {
            $scope.awesomeThings = [
                'HTML5 Boilerplate',
                'AngularJS',
                'Karma'
            ];
            var a = [
            ];
            var c = [1, 2];
            $scope.$watch('conditions.numberOfVariables', function(newValue, oldValue) {
                $scope.conditions.numberOfVariables = 0;
                $scope.conditions.numberOfVariables = newValue;
                $scope.solve();
            });
            $scope.solve = function() {
                var simplex = new Simplex($scope.optimization);
                $scope.iterations = simplex.getIterations();
            }
            //$scope.solve();

        })
        .directive('numberOnlyInput', function() {
            return {
                restrict: 'EA',
                scope: {
                    inputValue: '=',
                    inputName: '='
                },
                link: function(scope) {
                    scope.$watch('inputValue', function(newValue, oldValue) {
                        var arr = String(newValue).split("");
                        if (arr.length === 0)
                            return;
                        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.'))
                            return;
                        if (arr.length === 2 && newValue === '-.')
                            return;
                        if (isNaN(newValue)) {
                            scope.inputValue = oldValue;
                        }
                    });
                }
            };
        });

;
