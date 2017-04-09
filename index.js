'use strict';

var dataURL = window.location.origin + '/data/tmp.json';

window.fetch(dataURL).then(function (res) {
  return res.json();
}).then(function (json) {
  var data = { NHem: [], SHem: [] };

  json.NHem.x.forEach(function (v, i) {
    Object.keys(json).forEach(function (hem) {
      data[hem].push({
        x: json[hem].x[i],
        y: json[hem].y[i],
        yHat: json[hem].fitted[i],
        yPlus: json[hem].fitted[i] + json[hem].halfwidth[i],
        yMinus: json[hem].fitted[i] - json[hem].halfwidth[i]
      });
    });
  });

  var xScale = new Plottable.Scales.Time().domain([new Date(1880, 0, 1), new Date(2015, 0, 1)]);
  var yScale = {
    NHem: new Plottable.Scales.Linear().domain([-60, 110]),
    SHem: new Plottable.Scales.Linear().domain([-60, 110])
  };

  var markers = {
    NHem: new Plottable.Plots.Scatter().addDataset(new Plottable.Dataset(data.NHem)).x(function (d) {
      return new Date(d.x, 0, 1);
    }, xScale).y(function (d) {
      return d.y;
    }, yScale.NHem).attr('fill', 'black').size(3),
    SHem: new Plottable.Plots.Scatter().addDataset(new Plottable.Dataset(data.SHem)).x(function (d) {
      return new Date(d.x, 0, 1);
    }, xScale).y(function (d) {
      return d.y;
    }, yScale.SHem).attr('fill', 'black').size(3)
  };

  var line = {
    NHem: new Plottable.Plots.Line().addDataset(new Plottable.Dataset(data.NHem)).x(function (d) {
      return new Date(d.x, 0, 1);
    }, xScale).y(function (d) {
      return d.yHat;
    }, yScale.NHem).attr('stroke', '#fc8d59'),
    SHem: new Plottable.Plots.Line().addDataset(new Plottable.Dataset(data.SHem)).x(function (d) {
      return new Date(d.x, 0, 1);
    }, xScale).y(function (d) {
      return d.yHat;
    }, yScale.SHem).attr('stroke', '#91bfdb')
  };

  var area = {
    NHem: new Plottable.Plots.Area().addDataset(new Plottable.Dataset(data.NHem)).x(function (d) {
      return new Date(d.x, 0, 1);
    }, xScale).y0(function (d) {
      return d.yMinus;
    }, yScale.NHem).y(function (d) {
      return d.yPlus;
    }, yScale.NHem).attr('stroke-width', 0).attr('fill', '#fc8d59'),
    SHem: new Plottable.Plots.Area().addDataset(new Plottable.Dataset(data.SHem)).x(function (d) {
      return new Date(d.x, 0, 1);
    }, xScale).y0(function (d) {
      return d.yMinus;
    }, yScale.SHem).y(function (d) {
      return d.yPlus;
    }, yScale.SHem).attr('stroke-width', 0).attr('fill', '#91bfdb')
  };

  var xAxis = new Plottable.Axes.Time(xScale, 'bottom').showEndTickLabels(true).tierLabelPositions(['center']);
  var yAxis = {
    NHem: new Plottable.Axes.Numeric(yScale.NHem, 'left').showEndTickLabels(true),
    SHem: new Plottable.Axes.Numeric(yScale.SHem, 'left').showEndTickLabels(true)
  };
  xAxis._hideOverflowingTickLabels = function () {
    return null;
  };
  yAxis.NHem._hideOverflowingTickLabels = function () {
    return null;
  };
  yAxis.SHem._hideOverflowingTickLabels = function () {
    return null;
  };

  var xLabel = new Plottable.Components.AxisLabel('Year').yAlignment('center');
  var yLabel = new Plottable.Components.AxisLabel('Temperature Index (0.01°C deviation from 1951-1980 mean)').angle(-90).yAlignment('center');

  var chartLabels = {
    NHem: new Plottable.Components.Label('Northern Hemisphere').angle(-90),
    SHem: new Plottable.Components.Label('Southern Hemisphere').angle(-90)
  };

  var layoutInner = new Plottable.Components.Table([[yAxis.NHem, new Plottable.Components.Group([area.NHem, line.NHem, markers.NHem]), chartLabels.NHem], [null, xAxis], [null, xLabel], [yAxis.SHem, new Plottable.Components.Group([area.SHem, line.SHem, markers.SHem]), chartLabels.SHem]]);

  var layoutOuter = new Plottable.Components.Table([[yLabel, layoutInner]]);

  new Plottable.Interactions.PanZoom(xScale, null).attachTo(markers.NHem);
  new Plottable.Interactions.PanZoom(xScale, null).attachTo(markers.SHem);

  layoutOuter.renderTo('svg#chart');

  window.addEventListener('resizSHeme', function () {
    layoutOuter.redraw();
  });
});
