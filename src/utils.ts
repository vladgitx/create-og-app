import axios from "axios"
import fs from "fs"
import path from "path"

export async function downloadGithubRelease(owner: string, repo: string, releaseTag: string, assetName: string, outputDirPath: string) {
    const releaseUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${releaseTag}`
    const asset = (await axios.get(releaseUrl)).data.assets.find((a: any) => a?.name === assetName)

    if (!asset) {
        throw new Error(`Asset ${assetName} not found in release ${releaseTag} from ${owner}/${repo}`)
    }

    const responseStream = await axios.get(asset.browser_download_url, { responseType: "stream" })

    const filePath = path.join(outputDirPath, assetName)
    const fileStream = fs.createWriteStream(filePath)

    responseStream.data.pipe(fileStream)

    await new Promise((resolve, reject) => {
        fileStream.on("finish", resolve)
        fileStream.on("error", reject)
    })

    return filePath
}

export async function writePluginInConfigFile(fileDir: string, pluginName: string) {
    await new Promise((resolve) => {
        const configFilePath = fileDir + "/config.json"

        fs.readFile(configFilePath, "utf8", (err, data) => {
            if (err) {
                throw err
            }

            const config = JSON.parse(data)
            config.pawn.legacy_plugins.push(pluginName)

            fs.writeFile(configFilePath, JSON.stringify(config, null, 4), resolve)
        })
    })
}
