#! /usr/bin/env node

import { rimraf } from "rimraf"
import util from "util"
import path from "path"
import fs from "fs"
import decompress from "decompress"
import { writePluginInConfigFile, downloadGithubRelease } from "./utils"

const WORKING_DIR = process.cwd()

const OPEN_MP_RELEASE = "v1.2.0.2670"
const SAMP_NODE_RELEASE = "2.1.0"
const STREAMER_RELEASE = "v2.9.6"

const exec = util.promisify(require("node:child_process").exec)

async function cloneStarterRepo() {
    const starterRepoUrl = "https://github.com/vladgitx/og-starter"

    await exec(`git clone ${starterRepoUrl} ${WORKING_DIR}`)
    await rimraf(`${WORKING_DIR}/.git`)
    await exec(`cd ${WORKING_DIR} && git init && git add . && git commit -m "Initial commit"`)
}

async function downloadServerFiles() {
    const assetPath = await downloadGithubRelease("openmultiplayer", "open.mp", OPEN_MP_RELEASE, "open.mp-win-x86.zip", WORKING_DIR)

    const targetDir = WORKING_DIR + "/dist"

    await decompress(assetPath, targetDir, { strip: 1 }) // Strip the root Server/ directory
    await rimraf(assetPath)

    // Deleting useless files
    await rimraf([targetDir + "/gamemodes/"])
}

async function downloadSampNode() {
    const targetDir = WORKING_DIR + "/dist"
    const assetPath = await downloadGithubRelease("AmyrAhmady", "samp-node", SAMP_NODE_RELEASE, "samp-node-windows.zip", targetDir)

    await decompress(assetPath, targetDir, {
        filter: (file) => file.path === "libnode.dll",
    })

    await decompress(assetPath, targetDir + "/plugins", {
        filter: (file) => file.path === "samp-node.dll",
    })

    await rimraf(assetPath)

    await new Promise((resolve) => {
        fs.writeFile(
            targetDir + "/samp-node.json",
            JSON.stringify(
                {
                    entry_file: "./node/index.js",
                },
                null,
                4,
            ),
            resolve,
        )
    })

    await writePluginInConfigFile(targetDir, "samp-node")
}

async function downloadStreamer() {
    const targetDir = WORKING_DIR + "/dist"
    const assetPath = await downloadGithubRelease(
        "samp-incognito",
        "samp-streamer-plugin",
        STREAMER_RELEASE,
        "samp-streamer-plugin-2.9.6.zip",
        targetDir,
    )

    await decompress(assetPath, targetDir, {
        filter: (file) => file.path === "plugins/streamer.dll",
    })

    await rimraf(assetPath)
    await writePluginInConfigFile(targetDir, "streamer")
}

async function buildPawnFile() {
    const targetDir = WORKING_DIR + "/dist"
    const sourceFilePath = path.join(__dirname, "resources", "main.pwn").replace("\\dist", "")

    // gamemodes/ directory must exist for the pawn file to be compiled properly
    await new Promise((resolve) => {
        fs.mkdir(targetDir + "/gamemodes", { recursive: true }, resolve)
    })

    await exec(`${targetDir}/qawno/pawncc.exe ${sourceFilePath} -D${targetDir}/gamemodes`)

    await new Promise((resolve) => {
        const configFilePath = targetDir + "/config.json"

        fs.readFile(configFilePath, "utf8", (err, data) => {
            if (err) {
                throw err
            }

            const config = JSON.parse(data)
            config.pawn.main_scripts = ["main"]

            fs.writeFile(configFilePath, JSON.stringify(config, null, 4), resolve)
        })
    })
}

async function main() {
    console.log("Cloning the starter repository...")
    await cloneStarterRepo()

    console.log("Installing dependencies...")
    await exec(`cd ${WORKING_DIR} && npm install"`)

    console.log(`Downloading the open.mp ${OPEN_MP_RELEASE} server files...`)
    await downloadServerFiles()

    console.log(`Downloading samp-node ${SAMP_NODE_RELEASE}...`)
    await downloadSampNode()

    console.log(`Downloading Streamer ${STREAMER_RELEASE}...`)
    await downloadStreamer()

    console.log("Building the pawn file...")
    await buildPawnFile()

    console.log("Success! You can now run 'npm run start' to start the server.")
}

void main()
