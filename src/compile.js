const path = require("path")
const fs = require("fs")
const solc = require("solc")

const lotteryPath = path.resolve(__dirname, "contracts", "lotteryWheelBet.sol")
const source = fs.readFileSync(lotteryPath, "utf-8")

module.exports = solc.compile(source, 1).contracts[":Lottery"];