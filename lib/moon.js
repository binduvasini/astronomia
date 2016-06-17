'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @copyright 2013 Sonia Keys
 * @copyright 2016 commenthol
 * @license MIT
 */
/**
 * Moon: Chapter 53, Ephemeris for Physical Observations of the Moon.
 *
 * Incomplete.  Topocentric functions are commented out for lack of test data.
 */

var base = require('./base');
// const parallax = require('./parallax')
var coord = require('./coord');
var moonposition = require('./moonposition');
var nutation = require('./nutation');
// const planetposition = require('./planetposition')
var solar = require('./solar');

var M = exports;

var p = Math.PI / 180;
var _I = 1.54242 * p; // IAU value of inclination of mean lunar equator

var _base$sincos = base.sincos(_I);

var _base$sincos2 = _slicedToArray(_base$sincos, 2);

var sI = _base$sincos2[0];
var cI = _base$sincos2[1];

/**
 * Physical returns quantities useful for physical observation of the Moon.
 *
 * Returned l, b are librations in selenographic longitude and latitude.
 * They represent combined optical and physical librations.  Topocentric
 * librations are not considered.
 *
 * Returned P is the the position angle of the Moon's axis of rotation.
 *
 * Returned l0, b0 are the selenographic coordinates of the Sun.
 *
 * Returned values all in radians.
 */

M.physical = function (jde, earth) {
  // (jde float64, earth *pp.V87Planet)  (l, b, P, l0, b0 float64)

  var _moonposition$positio = moonposition.position(jde);

  var lon = _moonposition$positio.lon;
  var lat = _moonposition$positio.lat;
  var range = _moonposition$positio.range; // (λ without nutation)
  // [λ, β, Δ]

  var m = new Moon(jde);

  var _m$lib = m.lib(lon, lat);

  var _m$lib2 = _slicedToArray(_m$lib, 2);

  var l = _m$lib2[0];
  var b = _m$lib2[1];

  var P = m.pa(lon, lat, b);

  var _m$sun = m.sun(lon, lat, range, earth);

  var _m$sun2 = _slicedToArray(_m$sun, 2);

  var l0 = _m$sun2[0];
  var b0 = _m$sun2[1];

  return [l, b, P, l0, b0];
};

/**
 * Quantities computed for a jde and used in computing return values of
 * Physical().  Computations are broken into several methods to organize
 * the code.
 */

var Moon = function () {
  function Moon(jde) {
    _classCallCheck(this, Moon);

    this.jde = jde;
    // Δψ, F, Ω, p. 372.0

    var _nutation$nutation = nutation.nutation(jde);

    var _nutation$nutation2 = _slicedToArray(_nutation$nutation, 2);

    var Δψ = _nutation$nutation2[0];
    var Δε = _nutation$nutation2[1];

    this.Δψ = Δψ;
    var T = base.J2000Century(jde);
    var F = this.F = base.horner(T, 93.272095 * p, 483202.0175233 * p, -0.0036539 * p, -p / 3526000, p / 863310000);
    this.Ω = base.horner(T, 125.0445479 * p, -1934.1362891 * p, 0.0020754 * p, p / 467441, -p / 60616000);
    // true ecliptic
    this.ε = nutation.meanObliquity(jde) + Δε;
    this.sε = Math.sin(this.ε);
    this.cε = Math.cos(this.ε);
    // ρ, σ, τ, p. 372,373
    var D = base.horner(T, 297.8501921 * p, 445267.1114034 * p, -0.0018819 * p, p / 545868, -p / 113065000);
    var M = base.horner(T, 357.5291092 * p, 35999.0502909 * p, -0.0001535 * p, p / 24490000);
    var M_ = base.horner(T, 134.9633964 * p, 477198.8675055 * p, 0.0087414 * p, p / 69699, -p / 14712000);
    var E = base.horner(T, 1, -0.002516, -0.0000074);
    var K1 = 119.75 * p + 131.849 * p * T;
    var K2 = 72.56 * p + 20.186 * p * T;
    this.ρ = -0.02752 * p * Math.cos(M_) + -0.02245 * p * Math.sin(F) + 0.00684 * p * Math.cos(M_ - 2 * F) + -0.00293 * p * Math.cos(2 * F) + -0.00085 * p * Math.cos(2 * (F - D)) + -0.00054 * p * Math.cos(M_ - 2 * D) + -0.0002 * p * Math.sin(M_ + F) + -0.0002 * p * Math.cos(M_ + 2 * F) + -0.0002 * p * Math.cos(M_ - F) + 0.00014 * p * Math.cos(M_ + 2 * (F - D));
    this.σ = -0.02816 * p * Math.sin(M_) + 0.02244 * p * Math.cos(F) + -0.00682 * p * Math.sin(M_ - 2 * F) + -0.00279 * p * Math.sin(2 * F) + -0.00083 * p * Math.sin(2 * (F - D)) + 0.00069 * p * Math.sin(M_ - 2 * D) + 0.0004 * p * Math.cos(M_ + F) + -0.00025 * p * Math.sin(2 * M_) + -0.00023 * p * Math.sin(M_ + 2 * F) + 0.0002 * p * Math.cos(M_ - F) + 0.00019 * p * Math.sin(M_ - F) + 0.00013 * p * Math.sin(M_ + 2 * (F - D)) + -0.0001 * p * Math.cos(M_ - 3 * F);
    this.τ = 0.0252 * p * Math.sin(M) * E + 0.00473 * p * Math.sin(2 * (M_ - F)) + -0.00467 * p * Math.sin(M_) + 0.00396 * p * Math.sin(K1) + 0.00276 * p * Math.sin(2 * (M_ - D)) + 0.00196 * p * Math.sin(this.Ω) + -0.00183 * p * Math.cos(M_ - F) + 0.00115 * p * Math.sin(M_ - 2 * D) + -0.00096 * p * Math.sin(M_ - D) + 0.00046 * p * Math.sin(2 * (F - D)) + -0.00039 * p * Math.sin(M_ - F) + -0.00032 * p * Math.sin(M_ - M - D) + 0.00027 * p * Math.sin(2 * (M_ - D) - M) + 0.00023 * p * Math.sin(K2) + -0.00014 * p * Math.sin(2 * D) + 0.00014 * p * Math.cos(2 * (M_ - F)) + -0.00012 * p * Math.sin(M_ - 2 * F) + -0.00012 * p * Math.sin(2 * M_) + 0.00011 * p * Math.sin(2 * (M_ - M - D));
  }

  /**
   * lib() curiously serves for computing both librations and solar coordinates,
   * depending on the coordinates λ, β passed in.  Quantity A not described in
   * the book, but clearly depends on the λ, β of the current context and so
   * does not belong in the moon struct.  Instead just return it from optical
   * and pass it along to physical.
   */


  _createClass(Moon, [{
    key: 'lib',
    value: function lib(λ, β) {
      var _optical = this.optical(λ, β);

      var _optical2 = _slicedToArray(_optical, 3);

      var l_ = _optical2[0];
      var b_ = _optical2[1];
      var A = _optical2[2];

      var _physical = this.physical(A, b_);

      var _physical2 = _slicedToArray(_physical, 2);

      var l$ = _physical2[0];
      var b$ = _physical2[1];

      var l = l_ + l$;
      if (l > Math.PI) {
        l -= 2 * Math.PI;
      }
      var b = b_ + b$;
      return [l, b];
    }
  }, {
    key: 'optical',
    value: function optical(λ, β) {
      // (53.1) p. 372
      var W = λ - this.Ω; // (λ without nutation)

      var _base$sincos3 = base.sincos(W);

      var _base$sincos4 = _slicedToArray(_base$sincos3, 2);

      var sW = _base$sincos4[0];
      var cW = _base$sincos4[1];

      var _base$sincos5 = base.sincos(β);

      var _base$sincos6 = _slicedToArray(_base$sincos5, 2);

      var sβ = _base$sincos6[0];
      var cβ = _base$sincos6[1];

      var A = Math.atan2(sW * cβ * cI - sβ * sI, cW * cβ);
      var l_ = base.pmod(A - this.F, 2 * Math.PI);
      var b_ = Math.asin(-sW * cβ * sI - sβ * cI);
      return [l_, b_, A];
    }
  }, {
    key: 'physical',
    value: function physical(A, b_) {
      // (53.2) p. 373

      var _base$sincos7 = base.sincos(A);

      var _base$sincos8 = _slicedToArray(_base$sincos7, 2);

      var sA = _base$sincos8[0];
      var cA = _base$sincos8[1];

      var l$ = -this.τ + (this.ρ * cA + this.σ * sA) * Math.tan(b_);
      var b$ = this.σ * cA - this.ρ * sA;
      return [l$, b$];
    }
  }, {
    key: 'pa',
    value: function pa(λ, β, b) {
      var V = this.Ω + this.Δψ + this.σ / sI;

      var _base$sincos9 = base.sincos(V);

      var _base$sincos10 = _slicedToArray(_base$sincos9, 2);

      var sV = _base$sincos10[0];
      var cV = _base$sincos10[1];

      var _base$sincos11 = base.sincos(_I + this.ρ);

      var _base$sincos12 = _slicedToArray(_base$sincos11, 2);

      var sIρ = _base$sincos12[0];
      var cIρ = _base$sincos12[1];

      var X = sIρ * sV;
      var Y = sIρ * cV * this.cε - cIρ * this.sε;
      var ω = Math.atan2(X, Y);
      var ecl = new coord.Ecliptic(λ + this.Δψ, β).toEquatorial(this.ε); // eslint-disable-line no-unused-vars
      var P = Math.asin(Math.hypot(X, Y) * Math.cos(ecl.ra - ω) / Math.cos(b));
      if (P < 0) {
        P += 2 * Math.PI;
      }
      return P;
    }
  }, {
    key: 'sun',
    value: function sun(λ, β, Δ, earth) {
      var _solar$apparentVSOP = solar.apparentVSOP87(earth, this.jde);

      var lon = _solar$apparentVSOP.lon;
      var lat = _solar$apparentVSOP.lat;
      var range = _solar$apparentVSOP.range; // eslint-disable-line no-unused-vars

      var ΔR = Δ / (range * base.AU);
      var λH = lon + Math.PI + ΔR * Math.cos(β) * Math.sin(lon - λ);
      var βH = ΔR * β;
      return this.lib(λH, βH);
    }
  }]);

  return Moon;
}();

M.Moon = Moon;

/* commented out for lack of test data
M.Topocentric = function (jde, ρsφ_, ρcφ_, L) { // (jde, ρsφ_, ρcφ_, L float64)  (l, b, P float64)
  λ, β, Δ := moonposition.Position(jde) // (λ without nutation)
  Δψ, Δε := nutation.Nutation(jde)
  sε, cε := base.sincos(nutation.MeanObliquity(jde) + Δε)
  α, δ := coord.EclToEq(λ+Δψ, β, sε, cε)
  α, δ = parallax.Topocentric(α, δ, Δ/base.AU, ρsφ_, ρcφ_, L, jde)
  λ, β = coord.EqToEcl(α, δ, sε, cε)
  let m = newMoon(jde)
  l, b = m.lib(λ, β)
  P = m.pa(λ, β, b)
  return
}

M.TopocentricCorrections = function (jde, b, P, φ, δ, H, π) { // (jde, b, P, φ, δ, H, π float64)  (Δl, Δb, ΔP float64)
  sφ, cφ := base.sincos(φ)
  sH, cH := base.sincos(H)
  sδ, cδ := base.sincos(δ)
  let Q = Math.atan(cφ * sH / (cδ*sφ - sδ*cφ*cH))
  let z = Math.acos(sδ*sφ + cδ*cφ*cH)
  let π_ = π * (Math.sin(z) + 0.0084*Math.sin(2*z))
  sQP, cQP := base.sincos(Q - P)
  Δl = -π_ * sQP / Math.cos(b)
  Δb = π_ * cQP
  ΔP = Δl*Math.sin(b+Δb) - π_*Math.sin(Q)*Math.tan(δ)
  return
}
*/

/**
 * SunAltitude returns altitude of the Sun above the lunar horizon.
 *
 * Arguments η, θ are selenographic longitude and latitude of a site on the
 * Moon, l0, b0 are selenographic coordinates of the Sun, as returned by
 * Physical(), for example.
 *
 * Result is altitude in radians.
 */
M.sunAltitude = function (η, θ, l0, b0) {
  // (η, θ, l0, b0 float64)  float64
  var c0 = Math.PI / 2 - l0;

  var _base$sincos13 = base.sincos(b0);

  var _base$sincos14 = _slicedToArray(_base$sincos13, 2);

  var sb0 = _base$sincos14[0];
  var cb0 = _base$sincos14[1];

  var _base$sincos15 = base.sincos(θ);

  var _base$sincos16 = _slicedToArray(_base$sincos15, 2);

  var sθ = _base$sincos16[0];
  var cθ = _base$sincos16[1];

  return Math.asin(sb0 * sθ + cb0 * cθ * Math.sin(c0 + η));
};

/**
 * Sunrise returns time of sunrise for a point on the Moon near the given date.
 *
 * Arguments η, θ are selenographic longitude and latitude of a site on the
 * Moon, jde can be any date.
 *
 * Returned is the time of sunrise as a jde nearest the given jde.
 */
M.sunrise = function (η, θ, jde, earth) {
  // (η, θ, jde float64, earth *pp.V87Planet)  float64
  jde -= srCorr(η, θ, jde, earth);
  return jde - srCorr(η, θ, jde, earth);
};

/**
 * Sunset returns time of sunset for a point on the Moon near the given date.
 *
 * Arguments η, θ are selenographic longitude and latitude of a site on the
 * Moon, jde can be any date.
 *
 * Returned is the time of sunset as a jde nearest the given jde.
 */
M.sunset = function (η, θ, jde, earth) {
  // (η, θ, jde float64, earth *pp.V87Planet)  float64
  jde += srCorr(η, θ, jde, earth);
  return jde + srCorr(η, θ, jde, earth);
};

function srCorr(η, θ, jde, earth) {
  // (η, θ, jde float64, earth *pp.V87Planet)  float64
  var phy = M.physical(jde, earth);
  var h = M.sunAltitude(η, θ, phy[3], phy[4]); // l0, b0
  return h / (12.19075 * p * Math.cos(θ));
}