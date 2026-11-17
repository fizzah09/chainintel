require('@nomicfoundation/hardhat-toolbox');
const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');

// Offline builds: set SOLCJS=1 to compile with the bundled solc-js (npm "solc") instead of downloading a native compiler.
if (process.env.SOLCJS === '1') {
  subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
    if (args.solcVersion !== '0.8.24') return runSuper();
    return { compilerPath: require.resolve('solc/soljson.js'), isSolcJs: true, version: args.solcVersion, longVersion: require('solc').version() };
  });
}

const { SEPOLIA_RPC_URL = '', DEPLOYER_PRIVATE_KEY = '', ETHERSCAN_API_KEY = '' } = process.env;

module.exports = {
  solidity: { version: '0.8.24', settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    hardhat: {},
    localhost: { url: 'http://127.0.0.1:8545' },
    ...(SEPOLIA_RPC_URL && DEPLOYER_PRIVATE_KEY ? { sepolia: { url: SEPOLIA_RPC_URL, accounts: [DEPLOYER_PRIVATE_KEY] } } : {}),
  },
  etherscan: { apiKey: ETHERSCAN_API_KEY },
};
