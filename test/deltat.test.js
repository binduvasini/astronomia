/* globals describe it */
/* eslint
no-multi-spaces: 0,
key-spacing: 0,
standard/array-bracket-even-spacing: 0
*/

var assert = require('assert')
var julian = require('..').julian
var deltat = require('..').deltat

describe('#deltat', function () {
  var tests = [
    {date: [ 333,  2,  6], exp: 7358.762}, // Example 10.b, p. 80.
    {date: [ 900,  1,  1], exp: 2200.288},
    {date: [ 947,  1,  1], exp: 1888.781},
    {date: [1600,  1,  1], exp:  120.000},
    {date: [1780,  1,  1], exp:   15.600},
    {date: [1800,  1,  1], exp:   12.600},
    {date: [1860,  1,  1], exp:    7.350},
    {date: [1900,  1,  1], exp:   -2.700},
    {date: [1940,  1,  1], exp:   24.350},
    {date: [1973,  1, 31], exp:   43.467},
    {date: [1973,  2,  1], exp:   43.470},
    {date: [1977,  2, 18], exp:   47.647}, // Example 10.a, p. 78.
    {date: [2000,  1,  1], exp:   63.828},
    {date: [2005,  1,  1], exp:   64.687},
    {date: [2010,  1,  1], exp:   66.070},
    {date: [2015,  1,  1], exp:   67.644},
    {date: [2016,  1,  1], exp:   68.102},
    {date: [2017,  1,  1], exp:   68.600}, // might change on new deltat data set
    {date: [2020,  1,  1], exp:   70.000},
    {date: [2024, 12, 31], exp:   72.984},
    {date: [2025,  1,  1], exp:   74.467},
    {date: [2049, 12, 31], exp:   92.999},
    {date: [2050,  1,  1], exp:   93.004},
    {date: [2100,  1,  2], exp:  202.750},
    {date: [2149, 12, 31], exp:  328.477},
    {date: [2150,  1,  1], exp:  328.480},
    {date: [2200,  1,  1], exp:  442.080}
  ]

  describe('deltaT', function () {
    tests.forEach(function (t) {
      var year = t.date[0]
      var month = t.date[1]
      var day = t.date[2]
      if (!t.omit) {
        it(year + '-' + month + '-' + day, function () {
          var cal = new julian.Calendar(year, month, day)
          var res = deltat.deltaT(cal.toYear())
          assert.equal(res.toFixed(3), t.exp)
        })
      }
    })
  })
})