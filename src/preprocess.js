import raw from '../dist/data/GISTEMPData2.json'
import Loess from 'loess'
import fs from 'fs'

const data = {NHem: {x: [], y: []}, SHem: {x: [], y: []}}

raw.forEach(row => {
  data.NHem.x.push(row.Year)
  data.NHem.y.push(row.NHem)
  data.SHem.x.push(row.Year)
  data.SHem.y.push(row.SHem)
})

Object.keys(data).forEach(hem => {
  const model = new Loess(data[hem], {span: 0.4, band: 0.9})
  const output = model.predict()

  data[hem].fitted = output.fitted
  data[hem].halfwidth = output.halfwidth
})

fs.writeFileSync('dist/data/processed.json', JSON.stringify(data, null, '\t'))
