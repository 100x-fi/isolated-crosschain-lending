import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { task, subtask, types } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "hardhat-log-remover";
import "solidity-coverage";
import fs from "fs";

function getSortedFiles(dependenciesGraph: any) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const tsort = require("tsort");
  const graph = tsort();

  const filesMap: Record<any, any> = {};
  const resolvedFiles = dependenciesGraph.getResolvedFiles();
  resolvedFiles.forEach((f: any) => (filesMap[f.sourceName] = f));

  for (const [from, deps] of dependenciesGraph.entries()) {
    for (const to of deps) {
      graph.add(to.sourceName, from.sourceName);
    }
  }

  const topologicalSortedNames = graph.sort();

  // If an entry has no dependency it won't be included in the graph, so we
  // add them and then dedup the array
  const withEntries = topologicalSortedNames.concat(resolvedFiles.map((f: any) => f.sourceName));

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const sortedNames = [...new Set(withEntries)];
  return sortedNames.map((n) => filesMap[n]);
}

function getFileWithoutImports(resolvedFile: any) {
  const IMPORT_SOLIDITY_REGEX = /^\s*import(\s+)[\s\S]*?;\s*$/gm;

  return resolvedFile.content.rawContent.replace(IMPORT_SOLIDITY_REGEX, "").trim();
}

subtask("chip:get-flattened-sources", "Returns all contracts and their dependencies flattened")
  .addOptionalParam("files", undefined, undefined, types.any)
  .addOptionalParam("output", undefined, undefined, types.string)
  .setAction(async ({ files, output }, { run }) => {
    const dependencyGraph = await run("chip:get-dependency-graph", { files });
    console.log(dependencyGraph);

    let flattened = "";

    if (dependencyGraph.getResolvedFiles().length === 0) {
      return flattened;
    }

    const sortedFiles = getSortedFiles(dependencyGraph);

    let isFirst = true;
    for (const file of sortedFiles) {
      if (!isFirst) {
        flattened += "\n";
      }
      flattened += `// File ${file.getVersionedName()}\n`;
      flattened += `${getFileWithoutImports(file)}\n`;

      isFirst = false;
    }

    // Remove every line started with "// SPDX-License-Identifier:"
    flattened = flattened.replace(/SPDX-License-Identifier:/gm, "License-Identifier:");

    flattened = `// SPDX-License-Identifier: MIXED\n\n${flattened}`;

    // Remove every line started with "pragma experimental ABIEncoderV2;" except the first one
    flattened = flattened.replace(
      /pragma experimental ABIEncoderV2;\n/gm,
      (
        (i) => (m: any) =>
          !i++ ? m : ""
      )(0)
    );

    flattened = flattened.trim();
    if (output) {
      console.log("Writing to", output);
      fs.writeFileSync(output, flattened);
      return "";
    }
    return flattened;
  });

subtask("chip:get-dependency-graph")
  .addOptionalParam("files", undefined, undefined, types.any)
  .setAction(async ({ files }, { run }) => {
    const sourcePaths =
      files === undefined ? await run("compile:solidity:get-source-paths") : files.map((f: any) => fs.realpathSync(f));

    const sourceNames = await run("compile:solidity:get-source-names", {
      sourcePaths,
    });

    const dependencyGraph = await run("compile:solidity:get-dependency-graph", { sourceNames });

    return dependencyGraph;
  });

task("flat", "Flattens and prints contracts and their dependencies")
  .addOptionalVariadicPositionalParam("files", "The files to flatten", undefined, types.inputFile)
  .addOptionalParam("output", "Specify the output file", undefined, types.string)
  .setAction(async ({ files, output }, { run }) => {
    console.log(
      await run("chip:get-flattened-sources", {
        files,
        output,
      })
    );
  });

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      accounts: [
        {
          privateKey: process.env.LOCAL_PRIVATE_KEY_1,
          balance: "100000000000000000000000000000",
        },
        {
          privateKey: process.env.LOCAL_PRIVATE_KEY_2,
          balance: "100000000000000000000000000000",
        },
        {
          privateKey: process.env.LOCAL_PRIVATE_KEY_3,
          balance: "100000000000000000000000000000",
        },
        {
          privateKey: process.env.LOCAL_PRIVATE_KEY_4,
          balance: "100000000000000000000000000000",
        },
      ],
    },
    bsctest: {
      url: process.env.BSC_TESTNET_RPC,
      accounts: [process.env.BSC_TESTNET_PRIVATE_KEY],
      chainId: 97,
    },
    fuji: {
      url: `https://api.avax-test.network/ext/bc/C/rpc`,
      chainId: 43113,
      accounts: [process.env.BSC_TESTNET_PRIVATE_KEY],
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC || "",
      accounts: [process.env.RINKEBY_TESTNET_PRIVATE_KEY],
      chainId: 4,
    },
    bscmain: {
      url: process.env.BSC_MAINNET_RPC,
      accounts: [process.env.BSC_MAINNET_PRIVATE_KEY],
      chainId: 56,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: true,
        runs: 168,
      },
      evmVersion: "istanbul",
      outputSelection: {
        "*": {
          "": ["ast"],
          "*": [
            "evm.bytecode.object",
            "evm.deployedBytecode.object",
            "abi",
            "evm.bytecode.sourceMap",
            "evm.deployedBytecode.sourceMap",
            "metadata",
            "storageLayout",
          ],
        },
      },
    },
  },
  paths: {
    sources: "./contracts/v8",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "./typechain/v8",
  },
  mocha: {
    timeout: 500000,
  },
};
