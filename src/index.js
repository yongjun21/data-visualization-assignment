const dataURL = window.location.origin + '/data/processed.json'

window.fetch(dataURL).then(res => res.json()).then(json => {
  const data = {NHem: [], SHem: []}

  json.NHem.x.forEach((v, i) => {
    Object.keys(json).forEach(hem => {
      data[hem].push({
        x: json[hem].x[i],
        y: json[hem].y[i],
        yHat: json[hem].fitted[i],
        yPlus: json[hem].fitted[i] + json[hem].halfwidth[i],
        yMinus: json[hem].fitted[i] - json[hem].halfwidth[i]
      })
    })
  })

  const xScale = new Plottable.Scales.Time()
    .domain([new Date(1880, 0, 1), new Date(2015, 0, 1)])
  const yScale = {
    NHem: new Plottable.Scales.Linear().domain([-60, 110]),
    SHem: new Plottable.Scales.Linear().domain([-60, 110])
  }

  const markers = {
    NHem: new Plottable.Plots.Scatter()
      .addDataset(new Plottable.Dataset(data.NHem))
      .x(d => new Date(d.x, 0, 1), xScale)
      .y(d => d.y, yScale.NHem)
      .attr('fill', 'black')
      .size(3),
    SHem: new Plottable.Plots.Scatter()
      .addDataset(new Plottable.Dataset(data.SHem))
      .x(d => new Date(d.x, 0, 1), xScale)
      .y(d => d.y, yScale.SHem)
      .attr('fill', 'black')
      .size(3)
  }

  const line = {
    NHem: new Plottable.Plots.Line()
      .addDataset(new Plottable.Dataset(data.NHem))
      .x(d => new Date(d.x, 0, 1), xScale)
      .y(d => d.yHat, yScale.NHem)
      .attr('stroke', '#fc8d59'),
    SHem: new Plottable.Plots.Line()
      .addDataset(new Plottable.Dataset(data.SHem))
      .x(d => new Date(d.x, 0, 1), xScale)
      .y(d => d.yHat, yScale.SHem)
      .attr('stroke', '#91bfdb')
  }

  const area = {
    NHem: new Plottable.Plots.Area()
      .addDataset(new Plottable.Dataset(data.NHem))
      .x(d => new Date(d.x, 0, 1), xScale)
      .y0(d => d.yMinus, yScale.NHem)
      .y(d => d.yPlus, yScale.NHem)
      .attr('stroke-width', 0)
      .attr('fill', '#fc8d59'),
    SHem: new Plottable.Plots.Area()
      .addDataset(new Plottable.Dataset(data.SHem))
      .x(d => new Date(d.x, 0, 1), xScale)
      .y0(d => d.yMinus, yScale.SHem)
      .y(d => d.yPlus, yScale.SHem)
      .attr('stroke-width', 0)
      .attr('fill', '#91bfdb')
  }

  const xAxis = new Plottable.Axes.Time(xScale, 'bottom')
    .showEndTickLabels(true)
    .tierLabelPositions(['center'])
  const yAxis = {
    NHem: new Plottable.Axes.Numeric(yScale.NHem, 'left').showEndTickLabels(true),
    SHem: new Plottable.Axes.Numeric(yScale.SHem, 'left').showEndTickLabels(true)
  }
  xAxis._hideOverflowingTickLabels = () => null
  yAxis.NHem._hideOverflowingTickLabels = () => null
  yAxis.SHem._hideOverflowingTickLabels = () => null

  const xLabel = new Plottable.Components.AxisLabel('Year').yAlignment('center')
  const yLabel = new Plottable.Components.AxisLabel('Temperature Index (0.01°C deviation from 1951-1980 mean)')
    .angle(-90).yAlignment('center')

  const chartLabels = {
    NHem: new Plottable.Components.Label('Northern Hemisphere').angle(-90),
    SHem: new Plottable.Components.Label('Southern Hemisphere').angle(-90)
  }

  const layoutInner = new Plottable.Components.Table([
    [yAxis.NHem, new Plottable.Components.Group([area.NHem, line.NHem, markers.NHem]), chartLabels.NHem],
    [null, xAxis],
    [null, xLabel],
    [yAxis.SHem, new Plottable.Components.Group([area.SHem, line.SHem, markers.SHem]), chartLabels.SHem]
  ])

  const layoutOuter = new Plottable.Components.Table([
    [yLabel, layoutInner]
  ])

  new Plottable.Interactions.PanZoom(xScale, null).attachTo(markers.NHem)
  new Plottable.Interactions.PanZoom(xScale, null).attachTo(markers.SHem)

  layoutOuter.renderTo('svg#chart')

  window.addEventListener('resizSHeme', function () {
    layoutOuter.redraw()
  })
})
