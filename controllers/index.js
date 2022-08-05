const gunzip = require('gunzip-file')
const csv = require('csvtojson')
const fs = require("fs");
const { Raw_Data } = require("../models/index")
const { Op } = require('sequelize')

class Controller {
    static async postData(req, res) {
        try {
            // console.log(req.file, 'ini file');
            gunzip(`./tempZip/${req.file.filename}`, `./tempCSV/${req.file.filename}.csv`, function () {
                csv()
                    .fromFile(`./tempCSV/${req.file.filename}.csv`)
                    .then((jsonObj) => {
                        let dataForInput = []
                        jsonObj.forEach(el => {
                            let resultTime = el["Result Time"]
                            let enodebId = el["Object Name"].split(',').filter(el => el.includes("eNodeB ID"))[0] ?
                                el["Object Name"].split(',').filter(el => el.includes("eNodeB ID"))[0].split('=')[1] : null
                            let cellId = el['Object Name'].split(',').filter(el => el.includes("Local Cell ID"))[0] ?
                                el['Object Name'].split(',').filter(el => el.includes("Local Cell ID"))[0].split('=')[1] : null
                            let availDur = +el.L.Cell.Avail.Dur
                            dataForInput.push({ resultTime, enodebId, cellId, availDur })
                        });
                        return dataForInput
                    })
                    .then(dataForInput => {
                        let input = dataForInput.slice(1)
                        input.forEach(el => {
                            let resultTime = el.resultTime
                            let enodebId = el.enodebId
                            let cellId = el.cellId
                            let availDur = el.availDur

                            Raw_Data.findOrCreate({
                                where: { resultTime, enodebId, cellId, },
                                defaults: {
                                    resultTime, enodebId, cellId, availDur
                                }
                            })
                        });
                    })
                    .then(() => {
                        const pathZip = `./tempZip/${req.file.filename}`
                        const pathCSV = `./tempCSV/${req.file.filename}.csv`
                        fs.unlinkSync(pathZip);
                        fs.unlinkSync(pathCSV)
                        console.log("Zip removed:", pathZip);
                        console.log("CSV removed:", pathCSV);
                    })
                    .catch(err => {
                        console.log(err);
                    })
            });

            res.status(201).json({
                message: "Success input to database"
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Internal server error"
            })
        }
    }

    static async getData(req, res) {
        try {
            console.log(req.query);
            const { enodebId, cellId, startDate, endDate } = req.query

            let option = {
                order: [
                    ['resultTime', 'ASC'],
                ],
            }
            //enodebId
            if (enodebId && !cellId && !startDate && !endDate) {
                option.where = {
                    enodebId
                }
            }
            //ennodebId, range time
            if (enodebId && !cellId && startDate && endDate) {
                option.where = {
                    enodebId,
                    resultTime: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }

            //cellId 
            if (cellId && !enodebId && !startDate && !endDate) {
                option.where = {
                    cellId
                }
            }
            //cellId, range time
            if (cellId && !enodebId && startDate && endDate) {
                option.where = {
                    enodebId,
                    resultTime: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }

            //enodebId, cellId
            if (cellId && enodebId && !startDate && !endDate) {
                option.where = {
                    cellId, enodebId
                }
            }
            //enodebId, cellId, range time
            if (cellId && enodebId && startDate && endDate) {
                option.where = {
                    cellId,
                    enodebId,
                    resultTime: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }

            //range time
            if (startDate && endDate && !enodebId && !cellId) {
                option.where = {
                    resultTime: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }
            const data = await Raw_Data.findAll(option)
            if (!data) throw { message: "Not found" }
            res.status(200).json(data)
        } catch (err) {
            console.log(err);
            res.status(500).json('error')
        }

    }
}

module.exports = Controller